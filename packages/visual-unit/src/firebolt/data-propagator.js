export const addFacetData = ({ identifiers: data }, facetData, propFields) => {
    const fieldsWithFacets = data[0].length ? [...data[0].map((d, i) => ({
        name: d,
        index: i
    })), ...facetData[0].map(d => d.getSchemaDef())] : [];

    const fieldIndexMap = fieldsWithFacets.reduce((acc, v, i) => {
        acc[v.name] = i;
        return acc;
    }, {});
    propFields = propFields || fieldsWithFacets.map(d => d.name);
    const dataWithFacets = [
        propFields
    ];

    for (let i = 1, len = data.length; i < len; i++) {
        const row = [...data[i], ...facetData[1]];
        const newRow = [];
        propFields.forEach((field) => {
            const idx = fieldIndexMap[field];
            newRow.push(row[idx]);
        });
        dataWithFacets.push(newRow);
    }
    return dataWithFacets;
};

export const propagateValues = (instance, action, config = {}) => {
    let propFields = [];
    const { payload, identifiers, propagationFields } = config;
    const { fields: propagationFieldNames = [], append } = propagationFields[action] || {};
    const context = instance.context;
    const dataModel = context.cachedData()[0];
    const sourceId = context.id();
    const sideEfffects = instance.sideEffects();
    const behaviourEffectMap = instance._behaviourEffectMap;
    const propagationBehaviourMap = instance._propagationBehaviourMap;
    const propagationBehaviour = propagationBehaviourMap[action] || action;
    const facetByFields = context.facetByFields();

    payload.sourceUnit = sourceId;
    payload.action = action;
    payload.sourceCanvas = context.parentAlias();

    if (identifiers !== null) {
        propFields = identifiers.fields;

        if (propagationFieldNames.length) {
            const fields = identifiers.fields;
            propFields = append ? [...fields.map(d => d.name), ...propagationFieldNames] : propagationFieldNames;
            Object.assign(identifiers, {
                identifiers: addFacetData(identifiers, facetByFields, propFields)
            });
        }
    }

    const groupId = context.parentAlias();

    const filterFn = (entry, propagationConf) => {
        const effects = behaviourEffectMap[entry.config.action];
        const mutates = entry.config.groupId ?
            (effects ? effects.some(d => sideEfffects[d.name || d].constructor.mutates()) : false) : true;
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
        sourceId: action === 'select' ? groupId : sourceId,
        filterFn,
        enabled: (propConf, firebolt) => (action !== propagationBehaviour ?
            propConf.payload.sourceCanvas === firebolt.context.parentAlias() : true)
    };

    dataModel.propagate(identifiers, propConfig, true);

    if (action !== propagationBehaviour) {
        const behaviourInstance = instance._actions.behavioural[propagationBehaviour];
        isMutableAction = behaviourInstance ? behaviourInstance.constructor.mutates() : false;

        dataModel.propagate(identifiers, Object.assign({}, propConfig, {
            isMutableAction,
            applyOnSource: false,
            action: propagationBehaviour,
            sourceId: isMutableAction ? groupId : sourceId,
            enabled: (propConf, firebolt) => propConf.payload.sourceCanvas !== firebolt.context.parentAlias()
        }), true, {
            filterImmutableAction: (actionInf, propInf) => actionInf.groupId !== propInf.groupId
        });
    }
};
