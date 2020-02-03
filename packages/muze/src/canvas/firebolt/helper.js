import { isSimpleObject, ReservedFields, FieldType } from 'muze-utils';
import { getSideEffects, BEHAVIOURS } from '@chartshq/muze-firebolt';
import { PSEUDO_SELECT } from '@chartshq/visual-unit/src/enums/behaviours';

export const addFacetDataAndMeasureNames = (data, facetData, measureNames) => {
    if (data === null) {
        return data;
    }

    const facets = Object.keys(facetData);
    const facetVals = Object.values(facetData);

    if (isSimpleObject(data)) {
        return Object.assign({}, Object.keys(facetData).reduce((acc, v) => {
            acc[v] = [facetData[v]];
            return acc;
        }, {}), data, {
            [ReservedFields.MEASURE_NAMES]: measureNames
        });
    }
    const criteriaFields = data[0];
    const hasMeasureNameField = criteriaFields.find(field => field === ReservedFields.MEASURE_NAMES);
    const fieldsWithFacets = [...facets, ...criteriaFields,
        ...(hasMeasureNameField ? [] : [ReservedFields.MEASURE_NAMES])];

    const dataWithFacets = [
        fieldsWithFacets
    ];

    for (let i = 1, len = data.length; i < len; i++) {
        let measureNameArr = [];
        if (!hasMeasureNameField && measureNames) {
            measureNameArr = measureNames;
        }
        const row = [...facetVals, ...data[i], ...measureNameArr];
        dataWithFacets.push(row);
    }
    return dataWithFacets;
};

export const propagateValues = (instance, action, config = {}) => {
    const { payload, identifiers, sourceUnitId, sourceCanvasId, propagationDataSource } = config;
    const dataModel = propagationDataSource;
    const sideEfffects = instance._sideEffectDefinitions;
    const behaviourEffectMap = instance._behaviourEffectMap;
    const propagationBehaviourMap = instance._propagationBehaviourMap;
    const propagationBehaviour = propagationBehaviourMap[action] || action;

    payload.sourceUnit = sourceUnitId;
    payload.action = action;
    payload.sourceCanvas = sourceCanvasId;

    const groupId = sourceCanvasId;

    const filterFn = (entry, propagationConf) => {
        const effects = behaviourEffectMap[entry.config.action];
        const mutates = entry.config.groupId ?
            (effects ? effects.some(d => sideEfffects[d.name || d].mutates()) : false) : true;
        return entry.config.groupId !== propagationConf.groupId && mutates;
    };

    const sourceBehaviour = instance._actions.behavioural[action];
    let isMutableAction = sourceBehaviour ? sourceBehaviour.constructor.mutates() : false;
    const propConfig = {
        payload,
        action,
        criteria: identifiers,
        isMutableAction,
        groupId,
        sourceId: config.sourceId,
        filterFn,
        enabled: (propConf, firebolt) => (action !== propagationBehaviour ?
            propConf.payload.sourceCanvas === firebolt.sourceCanvas() : true)
    };

    dataModel.propagate(identifiers, propConfig, true);

    if (action !== propagationBehaviour) {
        const behaviourInstance = instance._actions.behavioural[propagationBehaviour];
        isMutableAction = behaviourInstance ? behaviourInstance.constructor.mutates() : false;

        dataModel.propagate(identifiers, Object.assign({}, propConfig, {
            isMutableAction,
            applyOnSource: false,
            action: propagationBehaviour,
            sourceId: isMutableAction ? groupId : sourceUnitId,
            enabled: (propConf, firebolt) => propConf.payload.sourceCanvas !== firebolt.sourceCanvas()
        }), true, {
            filterImmutableAction: (actionInf, propInf) => actionInf.groupId !== propInf.groupId
        });
    }
};

const isDimension = fields => fields.some(field => field.type() === FieldType.DIMENSION);

export const isCrosstab = (fields) => {
    const { rowFacets, colFacets, rowProjections, colProjections } = fields;
    if (rowFacets.length || colFacets.length) {
        return true;
    }
    const colProj = colProjections.flat();
    const rowProj = rowProjections.flat();

    if ((isDimension(colProj) || isDimension(rowProj)) && (colProj.length > 1 || rowProj.length > 1)) {
        return true;
    }
    return false;
};

export const addSelectedMeasuresInPayload = (firebolt, unit, payload) => {
    const groupFields = firebolt.context.composition().visualGroup.resolver().getAllFields();
    if (isCrosstab(groupFields)) {
        const { x, y } = unit.fields();
        let measureFields;

        if (x.length && y.length) {
            if (x[0].type() === FieldType.MEASURE) {
                measureFields = [`${x[0]}`];
            } else if (y[0].type() === FieldType.MEASURE) {
                measureFields = [`${y[0]}`];
            }
            payload.selectedMeasures = measureFields;
        }
    }
};

export const dispatchBehaviours = (firebolt, { payload, unit, behaviours }) => {
    behaviours.forEach((action) => {
        const actions = firebolt._actions.behavioural;
        payload.criteria = addFacetDataAndMeasureNames(payload.criteria, unit.facetFieldsMap(),
            unit.layers().map(layer => Object.keys(layer.data().getFieldspace().getMeasure())));

        addSelectedMeasuresInPayload(firebolt, unit, payload);
        payload.sourceCanvas = firebolt.sourceCanvas();
        firebolt.dispatchBehaviour(action, payload, {
            propagate: false,
            unit
        });

        const identifiers = actions[action].propagationIdentifiers();

        firebolt.propagate(action, payload, identifiers, {
            sideEffects: getSideEffects(action, firebolt._behaviourEffectMap),
            sourceUnitId: unit.id(),
            sourceId: firebolt.id(),
            propagationDataSource: firebolt.getPropagationSource()
        });
    });
};

export const resetSelectAction = (firebolt, { unit, payload, behaviours }) => {
    if (behaviours[0] === BEHAVIOURS.BRUSH && payload.dragging && payload.dragDiff < 5) {
        dispatchBehaviours(firebolt, {
            behaviours: [BEHAVIOURS.SELECT],
            payload: {
                criteria: null
            },
            unit
        });
    }
};

export const attachBehaviours = (group) => {
    const allFields = group.resolver().getAllFields();
    const valueMatrix = group.matrixInstance().value;
    const crosstab = isCrosstab(allFields);

    valueMatrix.each((cell) => {
        const unit = cell.valueOf();
        const firebolt = unit.firebolt();
        const behaviours = crosstab ? [PSEUDO_SELECT] : [];
        firebolt._connectedBehaviours[BEHAVIOURS.SELECT] = behaviours;
    });
};
