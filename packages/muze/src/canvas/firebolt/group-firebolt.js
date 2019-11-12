import {
    FieldType,
    mergeRecursive,
    CommonProps,
    ReservedFields
} from 'muze-utils';
import { Firebolt, getSideEffects } from '@chartshq/muze-firebolt';

import { applyInteractionPolicy } from '../helper';
import { payloadGenerator } from '../../../../visual-unit/src/firebolt/payload-generator';
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

        Object.assign(keys, data.reduce((acc, row, i) => {
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
                const key2 = dims.length ? `${dims},${measureNames}` : `${uid},${measureNames}`;
                acc[key2] = acc[key2] || {};
                acc[key2] = {
                    dims,
                    measureNames,
                    uid
                };
            });

            return acc;
        }, keys));
        Object.assign(dimsMap, data.reduce((acc, row) => {
            const dims = dimensions.map((d) => {
                if (d.def.name in fieldsConfig) {
                    return row[fieldsConfig[d.def.name].index];
                }
                return facetFieldsMap[d.def.name];
            });

            layers.forEach((layer) => {
                const measureNames = layer.data().getSchema().filter(d => d.type === FieldType.MEASURE)
                    .map(d => d.name);
                acc[dims] = acc[dims] || [];
                acc[dims].push(measureNames);
            });

            return acc;
        }, dimsMap));
    });

    return {
        keys,
        dimsMap,
        fields: [...dimensions.map(d => d.def.name)]
    };
};

const defaultCrossInteractionPolicy = {
    behaviours: {
        '*': (propagationPayload, context) => {
            const propagationCanvasAlias = propagationPayload.sourceCanvas;
            const canvasAlias = context.parentAlias();
            return propagationCanvasAlias ? canvasAlias === propagationCanvasAlias : true;
        }
    },
    sideEffects: {
        tooltip: (propagationPayload, context) => {
            const propagationUnit = propagationPayload.sourceUnit;
            const propagationCanvas = propagationPayload.sourceCanvas;
            const unitId = context.id();
            const canvasAlias = context.parentAlias();
            if (propagationCanvas) {
                return propagationCanvas !== canvasAlias ? true : unitId === propagationUnit;
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

        let enabled;

        if (enabledFn) {
            enabled = enabledFn(config, this);
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
            });
        });

        return this;
    }

    handlePhysicalAction (event, payload, unit) {
        const firebolt = unit.firebolt();
        const { behaviours } = firebolt._actionBehaviourMap[event];
        const { interaction: { behaviours: behaviourConfs = {} } } = firebolt.context.config();
        behaviours.forEach((action) => {
            const fields = [...this._dimensionsSet, ReservedFields.MEASURE_NAMES];
            const mode = behaviourConfs[action];
            let targetFirebolt = firebolt;
            if (mode === COMMON_INTERACTION) {
                targetFirebolt = this;
            }
            payload.criteria = sanitizePayloadCriteria(payload.criteria, fields, unit.facetFieldsMap(), {
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
                propagationDataSource: targetFirebolt.data()
            });
        });
    }

    dispatchBehaviour (action, payload, propagationInf = {}) {
        const { criteria } = payload;
        const fields = [...this._dimensionsSet, ReservedFields.MEASURE_NAMES];
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
}
