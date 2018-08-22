import { CommonProps } from 'muze-utils';
import { DATA, MOUNT } from '../enums/reactive-props';

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
            }
        });
};

export const getApplicableSideEffects = (firebolt, payload, sideEffects, propagationInf = {}) => {
    let applicableSideEffects;
    const context = firebolt.context;
    const unitId = context.id();
    const aliasName = context.parentAlias();
    const propagationSourceCanvas = propagationInf.propPayload && propagationInf.propPayload.sourceCanvas;
    const sourceUnitId = propagationInf.propPayload && propagationInf.propPayload.sourceUnit;
    const sourceSideEffects = firebolt._sourceSideEffects;
    const actionOnSource = sourceUnitId === unitId;

    applicableSideEffects = payload.sideEffects ? payload.sideEffects : sideEffects;

    applicableSideEffects = applicableSideEffects.filter((d) => {
        if (!actionOnSource && payload.criteria !== null) {
            return !sourceSideEffects[d.name || d];
        }
        if (propagationSourceCanvas === aliasName) {
            return d.applyOnSource !== false;
        }
        return true;
    });

    return applicableSideEffects;
};
