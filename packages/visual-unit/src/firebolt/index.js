import { FieldType, intersect } from 'muze-utils';
import { Firebolt, SIDE_EFFECTS } from '@chartshq/muze-firebolt';
import { payloadGenerator } from './payload-generator';
import {
    isSideEffectEnabled,
    dispatchSecondaryActions,
    createMapByDimensions
} from './helper';

const sideEffectPolicy = (propPayload, firebolt, propagationInf) => {
    const { sourceIdentifiers, propagationData } = propagationInf;
    const fields = sourceIdentifiers.fields;
    const sourceIdentifierFields = fields.filter(field =>
        field.type !== FieldType.MEASURE).map(field => field.name);
    const propFields = Object.keys(propagationData.getFieldsConfig());
    const hasCommonCanvas = propPayload.sourceCanvas === firebolt.sourceCanvas();
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
        this._connectedBehaviours = {};
        this.payloadGenerators(payloadGenerator);
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
                    return isSideEffectEnabled(this, { se, propagationInf });
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

    data (...params) {
        if (params.length) {
            const model = params[0];
            this.context.enableCaching().data(model);
            return this;
        }
        return this.context.data();
    }

    resetData () {
        this.context.clearCaching().resetData();
        return this;
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

            const payloadFn = this.getPayloadGeneratorFor(action);
            const payload = payloadFn(this, propagationData, config, context.facetFieldsMap());
            const behaviourPolicies = this._behaviourPolicies;
            const filterFns = Object.values(behaviourPolicies[action] || behaviourPolicies['*'] || {});
            let enabled = filterFns.every(fn => fn(propPayload || {}, this, {
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
                    sourceId: config.propagationSourceId,
                    isMutableAction: config.isMutableAction
                };

                this._actionHistory[action] = {
                    payload,
                    propagationInf,
                    isMutableAction
                };

                this.dispatchBehaviour(action, payload, propagationInf);

                dispatchSecondaryActions(this, {
                    action,
                    propagationInf,
                    propagationData,
                    config
                });
            }
        };
    }

    target () {
        return 'visual-unit';
    }

    createSelectionSet (...params) {
        super.createSelectionSet(...params);

        this._dimsMapGetter = createMapByDimensions(this, this.data());

        return this;
    }

    remove () {
        this.context.cachedData()[0].unsubscribe('propagation');
        return this;
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

    id () {
        return this.context.id();
    }

    getPropagationSource () {
        return this.context.cachedData()[0];
    }

    sourceCanvas () {
        return this.context.parentAlias();
    }
}

