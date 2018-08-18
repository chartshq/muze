import { isSimpleObject } from 'muze-utils';

export const propagateValues = (instance, action, config = {}) => {
    let propagationData;
    const payload = config.payload;
    const selectionSet = config.selectionSet;
    const criteria = payload.criteria;
    const context = instance.context;
    const dataModel = context.cachedData()[0];
    const sourceId = context.id();
    const sideEffects = config.sideEffects;
    const mutableEffect = sideEffects.find(sideEffect =>
        instance._sideEffects[sideEffect.name || sideEffect].constructor.mutates(true));
    const mergedModel = selectionSet.mergedEnter.model;

    payload.sourceUnit = sourceId;
    payload.sourceFacets = context.facetByFields();
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
