import { FieldType, intersect } from 'muze-utils';
import { Firebolt, SIDE_EFFECTS } from '@chartshq/muze-firebolt';
import { payloadGenerator } from './payload-generator';

const sideEffectPolicy = (propPayload, context, propagationInf) => {
    const { sourceIdentifiers, propagationData } = propagationInf;
    const fields = sourceIdentifiers.fields;
    const sourceIdentifierFields = Object.keys(fields).filter(field =>
        field.type !== FieldType.MEASURE);
    const propFields = Object.keys(propagationData.getFieldsConfig());
    const hasCommonCanvas = propPayload.sourceCanvas === context.parentAlias();
    return intersect(sourceIdentifierFields, propFields).length || hasCommonCanvas;
};

/**
 * This class manages the interactions of visual unit. It associates physical actions with
 * behavioural actions. It also propagates the behavioural actions to other datamodels.
 */
export default class UnitFireBolt extends Firebolt {
    constructor (...params) {
        super(...params);
        const {
            TOOLTIP,
            HIGHLIGHTER,
            ANCHORS,
            BRUSH_ANCHORS,
            PERSISTENT_ANCHORS
        } = SIDE_EFFECTS;
        this._handlers = {};
        this._propagationIdentifiers = {};
        this.sideEffects().tooltip.disable();
        const disabledSideEffects = [TOOLTIP, HIGHLIGHTER, ANCHORS, BRUSH_ANCHORS, PERSISTENT_ANCHORS];
        disabledSideEffects.forEach((sideEffect) => {
            this.changeSideEffectStateOnPropagation(sideEffect, sideEffectPolicy, 'sourceTargetPolicy');
        });
    }

    getApplicableSideEffects (sideEffects, payload, propagationInf) {
        const context = this.context;
        const unitId = context.id();
        const aliasName = context.parentAlias();
        const propagationSourceCanvas = propagationInf.propPayload && propagationInf.propPayload.sourceCanvas;
        const sourceUnitId = propagationInf.propPayload && propagationInf.propPayload.sourceUnit;
        const sideEffectPolicies = this._sideEffectPolicies;
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
                    const sideEffectCheckers = Object.values(sideEffectPolicies[se.name || se] || {});
                    const { sourceIdentifiers, data: propagationData } = propagationInf;
                    return sideEffectCheckers.length ? sideEffectCheckers.every(checker =>
                        checker(propagationInf.propPayload, context, {
                            sourceIdentifiers,
                            propagationData
                        })) : true;
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

    shouldApplySideEffects (propInf) {
        return propInf.propagate === false && propInf.applySideEffect !== false;
    }

    onDataModelPropagation () {
        return (data, config) => {
            let isMutableAction = false;
            const context = this.context;
            if (!context.mount()) {
                return;
            }
            const propagationData = data;

            const {
                enabled: enabledFn,
                sourceIdentifiers,
                action,
                payload: propPayload
            } = config;

            const payloadFn = payloadGenerator[action] || payloadGenerator.__default;
            const payload = payloadFn(this, propagationData, config, context.facetByFields());
            const behaviourPolicies = this._behaviourPolicies;
            const filterFns = Object.values(behaviourPolicies[action] || behaviourPolicies['*'] || {});
            let enabled = filterFns.every(fn => fn(propPayload || {}, context, {
                sourceIdentifiers,
                propagationData
            }));

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
                    data: propagationData,
                    propPayload,
                    sourceIdentifiers,
                    persistent: false,
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

    target () {
        return 'visual-unit';
    }

    remove () {
        this.context.cachedData()[0].unsubscribe('propagation');
        return this;
    }

    triggerPhysicalAction (event, payload) {
        const handlers = this._handlers[event] || [];
        const genericHandlers = this._handlers['*'];

        [...handlers, ...genericHandlers].forEach((fn) => {
            fn(event, payload);
        });
    }

    onPhysicalAction (event, fn) {
        !this._handlers[event] && (this._handlers[event] = []);
        this._handlers[event].push(fn);
    }

    propagationIdentifiers (action, identifiers) {
        if (identifiers) {
            this._propagationIdentifiers = identifiers;
        }
        return this._propagationIdentifiers[action];
    }

    registerPhysicalActionHandlers () {
        return this;
    }
}
