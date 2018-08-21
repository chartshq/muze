import { FieldType } from 'muze-utils';
import { Firebolt, SpawnableSideEffect } from '@chartshq/muze-firebolt';
import { registerListeners, getApplicableSideEffects } from './helper';
import { payloadGenerator } from './payload-generator';
import { propagateValues } from './data-propagator';

/**
 * This class manages the interactions of visual unit. It associates physical actions with
 * behavioural actions. It also propagates the behavioural actions to other datamodels.
 */
export default class UnitFireBolt extends Firebolt {
    constructor (...params) {
        super(...params);
        this._entryExitSet = {};
        registerListeners(this);
    }

     /**
     * Dispatches the behaviour with a given payload.
     * @param {string | Array} behaviourList Name of a single behaviour or multiple behaviours
     * @param {Object} payload Configuration parameters for action.
     * @return {VisualUnit} Instance of visual unit.
     */
    dispatchBehaviour (behaviour, payload, propagationInfo = {}) {
        const propagate = propagationInfo.propagate !== undefined ? propagationInfo.propagate : true;
        const behaviouralActions = this._actions.behavioural;
        const action = behaviouralActions[behaviour];
        const behaviourEffectMap = this._behaviourEffectMap;
        const sideEffects = behaviourEffectMap[behaviour] && behaviourEffectMap[behaviour];
        const selectionSet = action.dispatch(payload, propagationInfo)();
        const propagationSelectionSet = selectionSet.find(d => !d.sourceSelectionSet);
        this._entryExitSet[behaviour] = propagationSelectionSet;

        if (propagate) {
            propagateValues(this, behaviour, {
                payload,
                selectionSet: selectionSet.find(d => d.sourceSelectionSet),
                sideEffects
            });
        } else {
            const applicableSideEffects = getApplicableSideEffects(this, payload, sideEffects, propagationInfo);
            this.applySideEffects(applicableSideEffects, propagationSelectionSet, payload);
        }

        return this;
    }

    enableSideEffectOnPropagation (sideEffect) {
        this._sourceSideEffects[sideEffect] = false;
        return this;
    }

    disableSideEffectOnPropagation (sideEffect) {
        this._sourceSideEffects[sideEffect] = true;
        return this;
    }

    onDataModelPropagation () {
        return (propValue) => {
            let isSourceFieldPresent = true;
            const data = propValue.data;
            const propPayload = propValue.payload;
            const sourceIdentifiers = propValue.sourceIdentifiers;
            const action = propPayload.action;
            const payloadFn = payloadGenerator[action] || payloadGenerator.__default;

            if (sourceIdentifiers) {
                const fieldsConfig = sourceIdentifiers.getFieldsConfig();
                const sourceIdentifierFields = Object.keys(fieldsConfig);
                const propFields = Object.keys(data[0].getFieldsConfig());
                if (!Object.values(fieldsConfig).some(d => d.def.type === FieldType.MEASURE)) {
                    isSourceFieldPresent = sourceIdentifierFields.some(d => propFields.indexOf(d) !== -1);
                }
            }

            const payload = payloadFn(this.context, data, propValue);
            payload && this.dispatchBehaviour(action, payload, {
                propagate: false,
                data,
                propPayload,
                sourceIdentifiers,
                persistent: false,
                isSourceFieldPresent,
                sourceId: propValue.sourceId
            });
        };
    }

    initializeSideEffects () {
        super.initializeSideEffects();
        const sideEffects = this.sideEffects();
        for (const key in sideEffects) {
            if ({}.hasOwnProperty.call(sideEffects, key)) {
                sideEffects[key] instanceof SpawnableSideEffect && sideEffects[key].drawingContext(() => {
                    const context = this.context;
                    return context.getDrawingContext();
                });
            }
        }
    }

    remove () {
        this.context.cachedData()[0].unsubscribe('propagation');
        return this;
    }

    getEntryExitSet (action) {
        return this._entryExitSet[action];
    }
}
