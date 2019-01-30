import { CommonProps } from 'muze-utils';
import { SpawnableSideEffect } from '@chartshq/muze-firebolt';
import { DATA } from '../enums/reactive-props';

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

export const registerListeners = (firebolt) => {
    const context = firebolt.context;
    const store = context.store();

    store.registerImmediateListener([`local.units.${context.metaInf().namespace}.${DATA}`], (dataModel) => {
        const dm = dataModel[1];

        if (dm) {
            firebolt.createSelectionSet(firebolt.context.data().getData().uids);
            firebolt.initializeSideEffects();
            const originalData = firebolt.context.cachedData()[0];
            firebolt.attachPropagationListener(originalData);
        }
    });

    store.registerChangeListener([`local.units.${context.metaInf().namespace}.${DATA}`], () => {
        if (!firebolt.context.mount()) {
            const originalData = firebolt.context.cachedData()[0];
            originalData.unsubscribe('propagation');
        }
    });

    context._layerDeps.throwback.registerChangeListener([CommonProps.ON_LAYER_DRAW],
        ([, onlayerdraw]) => {
            if (onlayerdraw) {
                dispatchQueuedSideEffects(firebolt);
                clearActionHistory(firebolt);
            }
        });
};
