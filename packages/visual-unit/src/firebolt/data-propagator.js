import { isSimpleObject } from 'muze-utils';

export const propagateValues = (instance, action, config = {}) => {
    let propagationData;
    const payload = config.payload;
    const isMutableAction = config.mutates;
    const selectionSet = config.selectionSet;
    const criteria = payload.criteria;
    const context = instance.context;
    const dataModel = context.cachedData()[0];
    const sourceId = context.id();
    const mergedModel = selectionSet.mergedEnter.model;

    payload.sourceUnit = sourceId;
    payload.sourceFacets = context.facetByFields();
    payload.action = action;
    payload.sourceCanvas = context.parentAlias();

    if (criteria === null) {
        propagationData = null;
    } else if (isSimpleObject(criteria)) {
        const fields = Object.keys(criteria || {});
        propagationData = mergedModel.project(fields);
    } else {
        const criteriaFields = criteria[0];
        propagationData = mergedModel.project(criteriaFields);
    }

    dataModel.addToPropNamespace(sourceId, payload, propagationData, isMutableAction);
    dataModel.propagate(propagationData, payload, {
        isMutableAction,
        sourceId
    });
};
