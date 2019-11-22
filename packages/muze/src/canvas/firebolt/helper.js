import { isSimpleObject, ReservedFields, FieldType } from 'muze-utils';

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
    const fieldsWithFacets = [...facets, ...criteriaFields];

    const dataWithFacets = [
        fieldsWithFacets
    ];

    for (let i = 1, len = data.length; i < len; i++) {
        const row = [...facetVals, ...data[i]];
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
    return rowFacets.length || colFacets.length || isDimension(rowProjections.flat()) ||
        isDimension(colProjections.flat());
};
