import { isSimpleObject, FieldType, ReservedFields, getObjProp } from 'muze-utils';

export const sanitizePayloadCriteria = (data, propFields, facetData = {}, { dm, dimensionsMap }) => {
    if (data === null) {
        return data;
    }

    const facets = Object.keys(facetData);
    const facetVals = Object.values(facetData);
    const facetLen = facets.length;
    if (isSimpleObject(data)) {
        return Object.assign({}, Object.keys(facetData).reduce((acc, v) => {
            acc[v] = [facetData[v]];
            return acc;
        }, {}), data);
    }
    const criteriaFields = data[0];
    const fieldsWithFacets = criteriaFields.length ? [...facets.map(d => ({ name: d, type: FieldType.DIMENSION })),
        ...criteriaFields.map((d, i) => ({
            name: d,
            index: i + facetLen
        }))] : [];

    const fieldIndexMap = fieldsWithFacets.reduce((acc, v, i) => {
        acc[v.name] = i;
        return acc;
    }, {});

    propFields = propFields || fieldsWithFacets.map(d => d.name);
    const dataWithFacets = [
        propFields
    ];
    const measureNameField = criteriaFields.find(field => field === ReservedFields.MEASURE_NAMES);
    const fieldsConfig = dm.getFieldsConfig();
    const propDims = fieldsWithFacets.filter(d => d.name in fieldsConfig).map(d => d.name);

    const dimsMap = dm.getData().data.reduce((acc, row) => {
        const key = propDims.map(d => row[fieldsConfig[d].index]);
        acc[key] || (acc[key] = []);
        acc[key].push(row);
        return acc;
    }, {});

    for (let i = 1, len = data.length; i < len; i++) {
        const row = [...facetVals, ...data[i]];
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
                        const idx = getObjProp(fieldsConfig[field], 'index');
                        idx !== undefined && newRowVal.push(rowVal[idx]);
                    }
                });
                if (!measureNameField) {
                    const measuresArr = dimensionsMap[newRowVal].length ? dimensionsMap[newRowVal] : [[]];
                    measuresArr.forEach((measures) => {
                        dataWithFacets.push([...newRowVal, ...measures]);
                    });
                } else {
                    dataWithFacets.push(newRowVal);
                }
            });
        }
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
