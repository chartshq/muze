import { CommonProps } from 'muze-utils';
import { DATA, MOUNT } from '../enums/reactive-props';

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

export const registerListeners = (firebolt) => {
    const context = firebolt.context;
    const store = context.store();

    store.registerImmediateListener([DATA, MOUNT], (dataModel, mount) => {
        const dm = dataModel[1];

        if (dm && mount[1]) {
            const originalData = firebolt.context.cachedData()[0];
            firebolt.createSelectionSet(firebolt.context.data().getData().uids);
            firebolt.attachPropagationListener(originalData);
        }
    }, true);

    context._layerDeps.throwback.registerChangeListener([CommonProps.ON_LAYER_DRAW],
        ([, onlayerdraw]) => {
            if (onlayerdraw) {
                firebolt.initializeSideEffects();
                firebolt.config(context.config().interaction);
                firebolt.mapActionsAndBehaviour();
                dispatchQueuedSideEffects(firebolt);
                clearActionHistory(firebolt);
            }
        });
};

