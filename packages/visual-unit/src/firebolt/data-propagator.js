import { isSimpleObject, FieldType, DataModel } from 'muze-utils';

const getModelWithFacetData = (dm, data) => {
    const dataObj = dm.getData();
    const schema1 = dataObj.schema;
    const data1 = dataObj.data;
    const jsonData = [];
    const schema2 = data[0].map(d => ({
        name: `${d}`,
        type: FieldType.DIMENSION
    }));
    const data2 = data[1];

    data1.forEach((d) => {
        const tuple = {};
        schema1.forEach((obj, i) => {
            tuple[obj.name] = d[i];
        });
        schema2.forEach((obj, i) => {
            tuple[obj.name] = data2[i];
        });
        jsonData.push(tuple);
    });

    return new DataModel(jsonData, [...schema1, ...schema2]);
};

export const propagateValues = (instance, action, config = {}) => {
    let propagationData;
    const payload = config.payload;
    const selectionSet = config.selectionSet;
    const propagationFieldInf = config.propagationFields[action] || {};
    const propagationFields = propagationFieldInf.fields || [];
    const append = propagationFieldInf.append;
    const criteria = payload.criteria;
    const context = instance.context;
    const dataModel = context.cachedData()[0];
    const sourceId = context.id();
    const sideEfffects = instance.sideEffects();
    const behaviourEffectMap = instance._behaviourEffectMap;
    const mergedModel = selectionSet.mergedEnter.model;
    const fieldsConfig = dataModel.getFieldsConfig();
    payload.sourceUnit = sourceId;
    payload.action = action;
    payload.sourceCanvas = context.parentAlias();
    const propagationBehaviourMap = instance._propagationBehaviourMap;
    const propagationBehaviour = propagationBehaviourMap[action] || action;

    let propFields = [];
    if (criteria === null) {
        propagationData = null;
    } else if (isSimpleObject(criteria)) {
        propFields = Object.keys(criteria || {});
        propagationData = mergedModel ? mergedModel.project(propFields) : null;
    } else {
        propFields = criteria[0];
        propagationData = mergedModel ? mergedModel.project(propFields) : null;
    }

    const facetByFields = context.facetByFields();
    if (propagationData !== null && propagationFields.length) {
        const fields = propagationData.getData().schema.map(d => d.name);
        propagationData = getModelWithFacetData(propagationData, facetByFields);
        propFields = append ? [...fields, ...propagationFields] : propagationFields;
        propagationData = propagationData.project(propFields);
    }

    let propagateInterpolatedValues = false;
    if (propFields.length && propFields.every(field => fieldsConfig[field] &&
        fieldsConfig[field].def.type === FieldType.MEASURE)) {
        propagateInterpolatedValues = true;
    }

    const groupId = context.parentAlias();
    payload.action = action;
    const behaviourInstance = instance._actions.behavioural[propagationBehaviour];
    const isMutableAction = behaviourInstance ? behaviourInstance.constructor.mutates() : false;

    const filterFn = (entry, propagationConf) => {
        const effects = behaviourEffectMap[entry.config.action];
        const mutates = entry.config.groupId ?
            effects.some(d => sideEfffects[d.name || d].constructor.mutates()) : true;
        return entry.config.groupId !== propagationConf.groupId && mutates;
    };

    const sourceBehaviour = instance._actions.behavioural[action];
    const mutates = sourceBehaviour ? sourceBehaviour.constructor.mutates() : false;
    let propConfig = {
        payload,
        action,
        criteria: propagationData,
        isMutableAction: mutates,
        propagateInterpolatedValues,
        groupId,
        sourceId: mutates ? groupId : sourceId,
        filterFn,
        enabled: (propConf, firebolt) => (action !== propagationBehaviour ?
            propConf.payload.sourceCanvas === firebolt.context.parentAlias() : true)
    };

    dataModel.propagate(propagationData, propConfig, true);

    if (action !== propagationBehaviour) {
        propConfig = {
            payload,
            sourceId: isMutableAction ? groupId : sourceId,
            criteria: propagationData,
            isMutableAction,
            propagateInterpolatedValues,
            action: propagationBehaviour,
            groupId,
            applyOnSource: action === propagationBehaviour,
            enabled: (propConf, firebolt) => propConf.payload.sourceCanvas !== firebolt.context.parentAlias(),
            filterFn
        };

        dataModel.propagate(propagationData, propConfig, true, {
            filterImmutableAction: (actionInf, propInf) => actionInf.groupId !== propInf.groupId
        });
    }
};
