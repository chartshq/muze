import { isSimpleObject, getArrayIndexMap } from 'muze-utils';

export const sanitizePayloadCriteria = (criteria, propFields, dm) => {
    if (criteria === null) {
        return null;
    }
    if (isSimpleObject(criteria)) {
        return criteria;
    }

    const criteriaFields = criteria[0] || [];
    const fieldIndexMap = getArrayIndexMap(criteriaFields);
    const fieldsConfig = dm.getFieldsConfig();
    const propDims = criteriaFields.filter(field => field in fieldsConfig);

    const dimsMap = dm.getData().data.reduce((acc, row) => {
        const key = propDims.map(d => row[fieldsConfig[d].index]);
        acc[key] || (acc[key] = []);
        acc[key].push(row);
        return acc;
    }, {});

    const dataWithFacets = [
        propFields
    ];

    for (let i = 1, len = criteria.length; i < len; i++) {
        const row = criteria[i];
        const dimKey = propDims.map(field => row[fieldIndexMap[field]]);
        const origRow = dimsMap[dimKey];

        if (origRow) {
            origRow.forEach((rowVal) => {
                const newRowVal = [];
                propFields.forEach((field) => {
                    if (field in fieldIndexMap) {
                        const idx = fieldIndexMap[field];
                        newRowVal.push(row[idx]);
                    } else {
                        const idx = fieldsConfig[field].index;
                        newRowVal.push(rowVal[idx]);
                    }
                });

                dataWithFacets.push(newRowVal);
            });
        }
    }
    return dataWithFacets;
};

export const propagateValues = (instance, action, config = {}) => {
    const { payload, identifiers, sourceUnitId, sourceCanvasId } = config;
    // const { fields: propagationFieldNames = [], append } = propagationFields[action] || {};
    const dataModel = instance.data();
    const sideEfffects = instance._sideEffectDefinitions;
    const behaviourEffectMap = instance._behaviourEffectMap;
    const propagationBehaviourMap = instance._propagationBehaviourMap;
    const propagationBehaviour = propagationBehaviourMap[action] || action;

    payload.sourceUnit = sourceUnitId;
    payload.action = action;
    payload.sourceCanvas = sourceCanvasId;

    // if (identifiers !== null) {
    //     propFields = identifiers.fields;

    //     if (propagationFieldNames.length) {
    //         const fields = identifiers.fields;
    //         propFields = append ? [...fields.map(d => d.name), ...propagationFieldNames] : propagationFieldNames;
    //     }
    // }

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
            propConf.payload.sourceCanvas === firebolt.context.alias() : true)
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
            enabled: (propConf, firebolt) => propConf.payload.sourceCanvas !== firebolt.context.alias()
        }), true, {
            filterImmutableAction: (actionInf, propInf) => actionInf.groupId !== propInf.groupId
        });
    }
};
