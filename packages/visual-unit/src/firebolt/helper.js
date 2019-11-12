import { SpawnableSideEffect } from '@chartshq/muze-firebolt';

export const initSideEffects = (sideEffects, firebolt) => {
    for (const key in sideEffects) {
        if ({}.hasOwnProperty.call(sideEffects, key)) {
            sideEffects[key] instanceof SpawnableSideEffect && sideEffects[key].drawingContext(() => {
                const context = firebolt.context;
                return context.getDrawingContext();
            });
            sideEffects[key].valueParser(firebolt.context.valueParser());
        }
    }
};

export const clearActionHistory = (context) => {
    const actionHistory = context._actionHistory;
    for (const key in actionHistory) {
        if (actionHistory[key].isMutableAction) {
            delete context._actionHistory[key];
        }
    }
};

export const dispatchQueuedSideEffects = (context) => {
    const queuedSideEffects = context._queuedSideEffects;
    Object.entries(queuedSideEffects).forEach((entry) => {
        const sideEffect = entry[1];
        context.dispatchSideEffect(sideEffect.name, ...sideEffect.params);
    });
    context._queuedSideEffects = {};
};

export const isSideEffectEnabled = (firebolt, { se, propagationInf }) => {
    const sideEffectPolicies = firebolt._sideEffectPolicies;
    const sideEffectCheckers = Object.values(sideEffectPolicies[se.name || se] || {});
    const { sourceIdentifiers, data: propagationData } = propagationInf;
    return sideEffectCheckers.length ? sideEffectCheckers.every(checker =>
        checker(propagationInf.propPayload, firebolt, {
            sourceIdentifiers,
            propagationData
        })) : true;
};
