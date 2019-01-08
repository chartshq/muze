import { FieldType } from 'muze-utils';
import { Firebolt } from '@chartshq/muze-firebolt';
import { registerListeners } from './helper';
import { payloadGenerator } from './payload-generator';
import { propagateValues } from './data-propagator';

/**
 * This class manages the interactions of visual unit. It associates physical actions with
 * behavioural actions. It also propagates the behavioural actions to other datamodels.
 */
export default class UnitFireBolt extends Firebolt {
    constructor (...params) {
        super(...params);
        registerListeners(this);
    }

    propagate (behaviour, payload, selectionSet, sideEffects) {
        propagateValues(this, behaviour, {
            payload,
            selectionSet,
            sideEffects,
            propagationFields: this._propagationFields
        });
    }

    getApplicableSideEffects (sideEffects, payload, propagationInf) {
        const context = this.context;
        const unitId = context.id();
        const aliasName = context.parentAlias();
        const propagationSourceCanvas = propagationInf.propPayload && propagationInf.propPayload.sourceCanvas;
        const sourceUnitId = propagationInf.propPayload && propagationInf.propPayload.sourceUnit;
        const sourceSideEffects = this._sourceSideEffects;
        const sideEffectInstances = this.sideEffects();
        const actionOnSource = sourceUnitId ? sourceUnitId === unitId : true;

        const applicableSideEffects = payload.sideEffects ? [{
            effects: payload.sideEffects,
            behaviours: [payload.action]
        }] : sideEffects;
        applicableSideEffects.forEach((d) => {
            let mappedEffects = d.effects;
            mappedEffects = mappedEffects.filter((se) => {
                const mutates = sideEffectInstances[se.name || se].constructor.mutates();
                if (mutates && propagationInf.isMutableAction === false) {
                    return false;
                }
                if (!actionOnSource && payload.criteria !== null) {
                    const sideEffectChecker = sourceSideEffects[se.name || se];
                    return sideEffectChecker ? sideEffectChecker(propagationInf.propPayload, context) : true;
                }
                if (propagationSourceCanvas === aliasName || actionOnSource) {
                    return se.applyOnSource !== false;
                }

                return true;
            });
            d.effects = mappedEffects;
        });
        return applicableSideEffects;
    }

    shouldApplySideEffects (propagate) {
        return propagate === false;
    }

    onDataModelPropagation () {
        return (data, config) => {
            let isSourceFieldPresent = true;
            let isMutableAction = false;
            const propPayload = config.payload;
            const sourceIdentifiers = config.sourceIdentifiers;
            const enabledFn = config.enabled;
            const action = config.action;
            const payloadFn = payloadGenerator[action] || payloadGenerator.__default;

            if (sourceIdentifiers) {
                const fieldsConfig = sourceIdentifiers.getFieldsConfig();
                const sourceIdentifierFields = Object.keys(fieldsConfig);
                const propFields = Object.keys(data[0].getFieldsConfig());
                if (!Object.values(fieldsConfig).some(d => d.def.type === FieldType.MEASURE)) {
                    isSourceFieldPresent = sourceIdentifierFields.some(d => propFields.indexOf(d) !== -1);
                }
            }

            const payload = payloadFn(this.context, data, config);
            const sourceBehaviours = this._sourceBehaviours;
            const filterFn = sourceBehaviours[action] || sourceBehaviours['*'];
            let enabled = true;

            if (filterFn) {
                enabled = filterFn(propPayload || {}, this.context);
            }

            if (enabledFn) {
                enabled = enabledFn(config, this) && enabled !== false;
            }

            if (enabled) {
                const effects = this._behaviourEffectMap[action];
                const sideEffectInstances = this.sideEffects();
                isMutableAction = config.groupId ?
                    effects.some(d => sideEffectInstances[d.name || d].constructor.mutates()) : config.isMutableAction;

                const propagationInf = {
                    propagate: false,
                    data,
                    propPayload,
                    sourceIdentifiers,
                    persistent: false,
                    isSourceFieldPresent,
                    sourceId: config.propagationSourceId,
                    isMutableAction: config.isMutableAction
                };

                this._actionHistory[action] = {
                    payload,
                    propagationInf,
                    isMutableAction
                };
                this.dispatchBehaviour(action, payload, propagationInf);
            }
        };
    }

    prepareSelectionSets (behaviours) {
        const data = this.context.data();
        if (data) {
            this.createSelectionSet(data.getData().uids, behaviours);
        }
        return this;
    }

    initializeSideEffects () {
        if (this.context.data()) {
            super.initializeSideEffects();
        }
        return this;
    }

    remove () {
        this.context.cachedData()[0].unsubscribe('propagation');
        return this;
    }
}
