import { clone, unique, intersect } from 'muze-utils';

export const initializeSideEffects = (context, sideEffects) => {
    const sideEffectsMap = context._sideEffects;
    sideEffects = sideEffects instanceof Array ? sideEffects : Object.values(sideEffects);
    sideEffects.forEach((SideEffect) => {
        const formalName = SideEffect.formalName();
        const target = SideEffect.target();
        if (target === context.target() || target === 'all') {
            const sideEffectInstance = sideEffectsMap[formalName];
            sideEffectsMap[formalName] = sideEffectInstance || new SideEffect(context);
        }
    });
    return sideEffectsMap;
};

export const setSideEffectConfig = (sideEffects, config) => {
    for (const key in sideEffects) {
        const sideEffect = sideEffects[key];
        const formalName = sideEffect.constructor.formalName();
        const sideEffectConf = config[formalName];

        sideEffectConf && sideEffect.config(sideEffectConf);
    }
};

export const initializeBehaviouralActions = (context, actions) => {
    const dispatchableBehaviours = {};

    actions = actions instanceof Array ? actions : Object.values(actions);
    actions.forEach((Action) => {
        dispatchableBehaviours[Action.formalName()] = new Action(context);
    });
    return dispatchableBehaviours;
};

export const initializePhysicalActions = (context, actions) => {
    const physicalActions = {};

    for (const name in actions) {
        if (!({}).hasOwnProperty.call(name, actions)) {
            physicalActions[name] = actions[name](context);
        }
    }
    return physicalActions;
};

export const changeSideEffectAvailability = (context, fn, toEnable) => {
    const sideEffects = context.sideEffects();
    for (const key in sideEffects) {
        if ({}.hasOwnProperty.call(sideEffects, key)) {
            let change = true;
            if (fn && fn(key) === false) {
                change = false;
            }
            if (change) {
                toEnable ? sideEffects[key].enable() : sideEffects[key].disable();
            }
        }
    }
};

export const getMergedSet = set => [...new Set([...set[0], ...set[1]])];

export const getSourceFields = (propagationInf, criteria = {}) => {
    const sourceIdentifiers = propagationInf.sourceIdentifiers;
    let sourceFields;
    if (sourceIdentifiers) {
        sourceFields = sourceIdentifiers.fields.map(d => d.name);
    } else if (criteria instanceof Array) {
        sourceFields = criteria[0];
    } else {
        sourceFields = Object.keys(criteria || {});
    }
    return sourceFields;
};

export const getSideEffects = (behaviour, behaviourEffectMap) => {
    const sideEffects = [];
    for (const key in behaviourEffectMap) {
        const behaviours = key.split(',');
        const found = behaviours.some(d => d === behaviour);
        if (found) {
            sideEffects.push({
                effects: behaviourEffectMap[key],
                behaviours
            });
        }
    }
    return sideEffects;
};

export const unionSets = (firebolt, behaviours) => {
    let combinedSet = null;
    const models = {
        mergedEnter: null,
        mergedExit: null
    };
    const uidSet = {
        mergedEnter: [],
        mergedExit: []
    };

    behaviours.forEach((behaviour) => {
        const entryExitSet = firebolt._entryExitSet[behaviour];
        if (entryExitSet) {
            combinedSet = Object.assign(combinedSet || {}, clone(entryExitSet));
            ['mergedEnter', 'mergedExit'].forEach((type) => {
                const { model, uids } = entryExitSet[type];
                let existingModel = models[type];

                if (!existingModel) {
                    existingModel = models[type] = model;
                    uidSet[type] = uids;
                } else if (`${model.getSchema().map(d => d.name).sort()}` ===
                    `${existingModel.getSchema().map(d => d.name).sort()}`) {
                    uidSet[type] = unique([...uidSet[type], ...uids]);
                    models[type] = model.isEmpty() ? existingModel : existingModel.union(model);
                } else {
                    existingModel = model;
                    uidSet[type] = uids;
                }
                combinedSet[type].uids = uidSet[type];
                combinedSet[type].model = models[type];
            });
        }
    });

    return combinedSet;
};

export const intersectSets = (firebolt, behaviours) => {
    let combinedSet = null;
    const models = {
        mergedEnter: null,
        mergedExit: null
    };
    const uidSet = {
        mergedEnter: [],
        mergedExit: []
    };

    behaviours.forEach((behaviour) => {
        const entryExitSet = firebolt._entryExitSet[behaviour];
        if (entryExitSet) {
            combinedSet = Object.assign(combinedSet || {}, clone(entryExitSet));
            ['mergedEnter', 'mergedExit'].forEach((type) => {
                const { model, uids } = entryExitSet[type];
                let existingModel = models[type];

                if (!existingModel) {
                    existingModel = models[type] = model;
                    uidSet[type] = uids;
                } else if (`${model.getSchema().map(d => d.name).sort()}` ===
                    `${existingModel.getSchema().map(d => d.name).sort()}`) {
                    const commonSet = intersect(uidSet[type], uids, [id => id[0], id => id[0]]);
                    uidSet[type] = [...commonSet];
                    models[type] = model.isEmpty() ? existingModel : existingModel.union(model);
                }
                combinedSet[type].uids = unique(uidSet[type]);
                combinedSet[type].model = models[type];
            });
        }
    });

    return combinedSet;
};
