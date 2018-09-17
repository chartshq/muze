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
    const sideEffects = config.sideEffects;
    const mutableEffect = [].concat(...Object.values(sideEffects).map(d => d.effects)).find(sideEffect =>
        instance._sideEffects[sideEffect.name || sideEffect].constructor.mutates(true) &&
        sideEffect.applyOnSource !== false);
    const mergedModel = selectionSet.mergedEnter.model;

    payload.sourceUnit = sourceId;
    payload.action = action;
    payload.sourceCanvas = context.parentAlias();

    if (criteria === null) {
        propagationData = null;
    } else if (isSimpleObject(criteria)) {
        const fields = Object.keys(criteria || {});
        propagationData = mergedModel ? mergedModel.project(fields) : null;
    } else {
        const criteriaFields = criteria[0];
        propagationData = mergedModel ? mergedModel.project(criteriaFields) : null;
    }

    if (propagationData !== null && propagationFields.length) {
        const fields = propagationData.getData().schema.map(d => d.name);
        propagationData = getModelWithFacetData(propagationData, context.facetByFields());
        propagationData = propagationData.project(append ? [...fields, ...propagationFields] : propagationFields);
    }

    dataModel.addToPropNamespace(sourceId, {
        payload,
        criteria: propagationData,
        isMutableAction: mutableEffect,
        actionName: mutableEffect ? (mutableEffect.name || mutableEffect) : action
    });
    dataModel.propagate(propagationData, payload, {
        isMutableAction: mutableEffect,
        sourceId
    });
};
