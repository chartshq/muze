import { clone } from 'muze-utils';
import * as SELECTION from '../enums/selection';

export const initializeSideEffects = (context, sideEffects) => {
    const sideEffectsMap = context._sideEffects;

    sideEffects = sideEffects instanceof Array ? sideEffects : Object.values(sideEffects);
    sideEffects.forEach((SideEffect) => {
        const sideEffectInstance = sideEffectsMap[SideEffect.formalName()];
        sideEffectsMap[SideEffect.formalName()] = sideEffectInstance || new SideEffect(context);
    });
    return sideEffectsMap;
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

export const changeSideEffectAvailability = (sideEffects, fn, toEnable) => {
    for (const key in sideEffects) {
        if ({}.hasOwnProperty.call(sideEffects, key)) {
            let change = true;
            if (fn && fn(sideEffects[key], key) === false) {
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
        sourceFields = sourceIdentifiers.getSchema().map(d => d.name);
    } else if (criteria instanceof Array) {
        sourceFields = criteria[0];
    } else {
        sourceFields = Object.keys(criteria || {});
    }
    return sourceFields;
};

const conditionsMap = {
    newEntry: [SELECTION.SELECTION_NEW_ENTRY],
    oldEntry: [SELECTION.SELECTION_OLD_ENTRY],
    mergedEnter: [SELECTION.SELECTION_NEW_ENTRY, SELECTION.SELECTION_OLD_ENTRY],
    newExit: [SELECTION.SELECTION_NEW_EXIT],
    oldExit: [SELECTION.SELECTION_OLD_EXIT],
    mergedExit: [SELECTION.SELECTION_NEW_EXIT, SELECTION.SELECTION_OLD_EXIT],
    complete: []
};

export const getModelFromSet = (type, model, set) => {
    if (model) {
        return model.select((fields, i) =>
           (conditionsMap[type].some(condition => set[i] === condition)), {
               saveChild: false
           });
    }
    return null;
};

export const getSetInfo = (type, set, config) => {
    let model = null;
    const filteredDataModel = config.filteredDataModel;
    const selectionSet = config.selectionSet;
    if (!config.propagationData) {
        if (selectionSet.resetted()) {
            model = null;
        } else {
            model = getModelFromSet(type, config.dataModel, config.selectionSet._set);
        }
    } else if (filteredDataModel) {
        model = type === 'mergedEnter' ? filteredDataModel[0] : filteredDataModel[1];
    }
    return {
        uids: set,
        length: set.length,
        model
    };
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

export const unionSets = (context, behaviours) => {
    let combinedSet = {};
    const models = {
        mergedEnter: null,
        mergedExit: null
    };
    behaviours.forEach((behaviour) => {
        const entryExitSet = context._entryExitSet[behaviour];
        if (entryExitSet) {
            combinedSet = Object.assign(combinedSet, clone(entryExitSet));
            ['mergedEnter', 'mergedExit'].forEach((type) => {
                const model = entryExitSet[type].model;
                let existingModel = models[type];
                if (!existingModel) {
                    existingModel = models[type] = model;
                } else {
                    existingModel = models[type] = model.union(existingModel);
                }
                combinedSet[type].model = existingModel;
            });
        }
    });
    return combinedSet;
};
