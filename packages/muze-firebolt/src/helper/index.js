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

