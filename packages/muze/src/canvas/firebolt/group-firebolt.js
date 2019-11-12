import {
    FieldType,
    mergeRecursive,
    CommonProps,
    ReservedFields
} from 'muze-utils';
import { Firebolt, getSideEffects } from '@chartshq/muze-firebolt';
import { payloadGenerator, isSideEffectEnabled } from '@chartshq/visual-unit';
import { applyInteractionPolicy } from '../helper';
import { propagateValues, sanitizePayloadCriteria } from './helper';
import { COMMON_INTERACTION } from '../../constants';

const getKeysFromData = (group, dataModel) => {
    const valueMatrix = group.matrixInstance().value;
    const dimensions = Object.values(dataModel.getFieldsConfig()).filter(d => d.def.type === FieldType.DIMENSION);
    const keys = {};
    const dimsMap = {};
    valueMatrix.each((cell) => {
        const unit = cell.source();
        const facetFieldsMap = unit.facetFieldsMap();
        const dm = unit.data();
        const { data } = dm.getData();
        const uids = dm.getUids();
        const layers = unit.layers();
        const fieldsConfig = dm.getFieldsConfig();

        data.forEach((row, i) => {
            const dims = dimensions.map((d) => {
                if (d.def.name in fieldsConfig) {
                    return row[fieldsConfig[d.def.name].index];
                }
                return facetFieldsMap[d.def.name];
            });
            const uid = uids[i];

            layers.forEach((layer) => {
                const measureNames = layer.data().getSchema().filter(d => d.type === FieldType.MEASURE)
                    .map(d => d.name);
                const key = dims.length ? `${[dims, ...measureNames]}` : `${[uid, ...measureNames]}`;
                keys[key] = keys[key] || {};
                keys[key] = {
                    dims,
                    measureNames,
                    uid
                };
                dimsMap[dims] = measureNames;
            });
        });
    });

    return {
        keys,
        dimsMap,
        fields: [...dimensions.map(d => d.def.name)]
    };
};

const defaultCrossInteractionPolicy = {
    behaviours: {
        '*': (propagationPayload, firebolt) => {
            const propagationCanvasAlias = propagationPayload.sourceCanvas;
            const canvasAlias = firebolt.sourceCanvas();
            return propagationCanvasAlias ? canvasAlias === propagationCanvasAlias : true;
        }
    },
    sideEffects: {
        tooltip: (propagationPayload, firebolt) => {
            const propagationCanvas = propagationPayload.sourceCanvas;
            const canvasAlias = firebolt.sourceCanvas();
            if (propagationCanvas) {
                return propagationCanvas === canvasAlias;
            }
            return true;
        },
        selectionBox: () => false
    }
};

/**
 * This class is responsible for dispatching any behavioural action to all the visual units housed by the canvas.
 * It is created by {@link Canvas}. This class does not handle any physical actions. Physical actions get triggered
 * in {@link VisualUnit} which is managed by it's own firebolt instance. The firebolt instance of canvas only
 * propagates the action to all the visual units in it's composition.
 *
 * To get the firebolt instance of {@link Canvas}
 * ```
 *  const firebolt = canvas.firebolt();
 * ```
 *
 * @class GroupFireBolt
 * @public
 */
export default class GroupFireBolt extends Firebolt {
    constructor (...params) {
        super(...params);
        this._interactionPolicy = this.constructor.defaultInteractionPolicy();
        this.crossInteractionPolicy(this.constructor.defaultCrossInteractionPolicy());
    }

    static defaultInteractionPolicy () {
        return () => {};
    }

    static defaultCrossInteractionPolicy () {
        return defaultCrossInteractionPolicy;
    }

    interactionPolicy (...policy) {
        if (policy.length) {
            this._interactionPolicy = policy[0] || this.constructor.defaultInteractionPolicy();
            return this;
        }
        return this._interactionPolicy;
    }

    crossInteractionPolicy (...policy) {
        if (policy.length) {
            const context = this.context;
            this._crossInteractionPolicy = mergeRecursive(mergeRecursive({},
                this.constructor.defaultCrossInteractionPolicy()), policy[0] || {});

            applyInteractionPolicy(this);
            const throwback = context._throwback;
            throwback.registerImmediateListener([CommonProps.MATRIX_CREATED], () => {
                applyInteractionPolicy(this);
                const group = this.context.composition().visualGroup;
                if (group) {
                    const { keys, fields, dimsMap } = getKeysFromData(group, group.getGroupByData());
                    this._dimensionsMap = dimsMap;
                    this._dimensionsSet = fields;
                    this.createSelectionSet({ keys, fields });
                    group.getGroupByData().on('propagation', (data, config) => {
                        this.handleDataModelPropagation(data, config);
                    });
                }
            });
            return this;
        }
        return this._crossInteractionPolicy;
    }

    handleDataModelPropagation (data, config) {
        const group = this.context.composition().visualGroup;
        const valueMatrix = group.matrixInstance().value;
        const units = group.resolver().units();
        const propagationData = data;
        // @todo refactor this code
        const {
            enabled: enabledFn,
            sourceIdentifiers,
            action,
            payload: propPayload
        } = config;
        const { interaction: { behaviours: behaviourConfs = {} } } = this.context.config();
        const mode = behaviourConfs[action];
        if (mode !== COMMON_INTERACTION) {
            return this;
        }
        const payloadFn = payloadGenerator[action] || payloadGenerator.__default;
        const payload = payloadFn(this, propagationData, config);

        const behaviourPolicies = this._behaviourPolicies;
        const filterFns = Object.values(behaviourPolicies[action] || behaviourPolicies['*'] || {});
        let enabled = filterFns.every(fn => fn(propPayload || {}, this, {
            sourceIdentifiers,
            propagationData
        }));

        if (enabledFn) {
            enabled = enabledFn(config, this) && enabled;
        }

        if (enabled) {
            const propagationInf = {
                propagate: false,
                data: propagationData,
                propPayload,
                sourceIdentifiers,
                sourceId: config.propagationSourceId,
                isMutableAction: config.isMutableAction
            };

            const behaviourEffectMap = this._behaviourEffectMap;
            const sideEffects = getSideEffects(action, behaviourEffectMap);
            const sideEffectInstances = this.sideEffects();
            const { instance: unit = units[0][0] } =
                valueMatrix.findPlaceHolderById(propPayload.sourceUnit) || {};

            sideEffects.forEach(({ effects }) => {
                effects.forEach((effect) => {
                    const name = effect.name;
                    const inst = sideEffectInstances[name];

                    if (inst) {
                        inst.sourceInfo(() => unit.getSourceInfo());
                        inst.plotPointsFromIdentifiers((...params) =>
                            unit.getPlotPointsFromIdentifiers(...params));
                        inst.drawingContext(() => unit.getDrawingContext());
                    }
                });
            });
            this.dispatchBehaviour(action, payload, propagationInf);
        }

        return this;
    }

    registerSideEffects (sideEffects) {
        for (const key in sideEffects) {
            this._sideEffectDefinitions[sideEffects[key].formalName()] = sideEffects[key];
        }
        this.initializeSideEffects();
        return this;
    }

    target () {
        return 'visual-group';
    }

    mapActionsAndBehaviour () {
        const unitMatrix = this.context.composition().visualGroup.matrixInstance().value;

        unitMatrix.each((unit) => {
            const firebolt = unit.source().firebolt();
            firebolt.mapActionsAndBehaviour();
        });

        this.registerPhysicalActionHandlers();
    }

    registerPhysicalActionHandlers () {
        const unitMatrix = this.context.composition().visualGroup.matrixInstance().value;

        unitMatrix.each((cell) => {
            const unit = cell.source();
            const firebolt = unit.firebolt();

            firebolt.onPhysicalAction('*', (event, payload) => {
                this.handlePhysicalAction(event, payload, unit);
            }, this.context.constructor.formalName());
        });

        return this;
    }

    handlePhysicalAction (event, payload, unit) {
        const firebolt = unit.firebolt();
        const { behaviours } = firebolt._actionBehaviourMap[event];
        const { interaction: { behaviours: behaviourConfs = {} } } = firebolt.context.config();
        const hasMeasures = Object.keys(this.data().getFieldspace().getMeasure()).length;
        const measureName = hasMeasures ? [ReservedFields.MEASURE_NAMES] : [];

        behaviours.forEach((action) => {
            const fields = [...this._dimensionsSet, ...measureName];
            const mode = behaviourConfs[action];
            let targetFirebolt = firebolt;
            let facetMap = unit.facetFieldsMap();
            if (mode === COMMON_INTERACTION) {
                targetFirebolt = this;
            } else {
                facetMap = {};
            }

            payload.criteria = sanitizePayloadCriteria(payload.criteria, fields, facetMap, {
                dm: targetFirebolt.data(),
                dimensionsMap: targetFirebolt._dimensionsMap
            });

            targetFirebolt.dispatchBehaviour(action, payload, {
                propagate: false,
                applySideEffect: false
            });

            const identifiers = targetFirebolt._actions.behavioural[action].propagationIdentifiers();

            this.propagate(action, payload, identifiers, {
                sideEffects: getSideEffects(action, targetFirebolt._behaviourEffectMap),
                sourceUnitId: unit.id(),
                sourceId: targetFirebolt.id(),
                propagationDataSource: targetFirebolt.getPropagationSource()
            });
        });
    }

    dispatchBehaviour (action, payload, propagationInf = {}) {
        const { criteria } = payload;
        const hasMeasures = Object.keys(this.data().getFieldspace().getMeasure()).length;
        const measureName = hasMeasures ? [ReservedFields.MEASURE_NAMES] : [];
        const fields = [...this._dimensionsSet, ...measureName];
        const sanitizedPayload = Object.assign({}, payload,
            {
                criteria: sanitizePayloadCriteria(criteria, fields, {}, {
                    dm: this.data(),
                    dimensionsMap: this._dimensionsMap
                })
            });
        super.dispatchBehaviour(action, sanitizedPayload, propagationInf);
    }

    id () {
        return this.context.alias();
    }

    shouldApplySideEffects (propInf) {
        return propInf.applySideEffect !== false;
    }

    data () {
        return this.context.composition().visualGroup.getGroupByData();
    }

    getRangeFromIdentifiers ({ criteria, fields }) {
        return fields.reduce((acc, v) => {
            acc[v] = criteria[v];
            return acc;
        }, {});
    }

    propagate (behaviour, payload, identifiers, auxConfig = {}) {
        propagateValues(this, behaviour, Object.assign({
            payload,
            identifiers,
            propagationFields: this._propagationFields,
            sourceId: this.id(),
            sourceCanvasId: this.id(),
            propagationDataSource: this.data()
        }, auxConfig));
    }

    getPropagationSource () {
        return this.data();
    }

    sourceCanvas () {
        return this.context.alias();
    }

    getApplicableSideEffects (sideEffects, payload, propagationInf) {
        if (payload.sideEffects) {
            return [{
                effects: payload.sideEffects,
                behaviours: [payload.action]
            }];
        }
        sideEffects.forEach((d) => {
            let mappedEffects = d.effects;
            mappedEffects = mappedEffects.filter(se => isSideEffectEnabled(this, { se, propagationInf }));
            d.effects = mappedEffects;
        });
        return sideEffects;
    }
}
