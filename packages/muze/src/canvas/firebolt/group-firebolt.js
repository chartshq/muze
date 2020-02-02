import {
    FieldType,
    mergeRecursive,
    CommonProps,
    ReservedFields
} from 'muze-utils';
import { Firebolt, getSideEffects, SpawnableSideEffect } from '@chartshq/muze-firebolt';
import { createMapByDimensions } from '@chartshq/visual-unit/src/firebolt/helper';
import {
    payloadGenerator,
    isSideEffectEnabled,
    prepareSelectionSetMap
} from '@chartshq/visual-unit';
import { TOOLTIP } from '@chartshq/muze-firebolt/src/enums/side-effects';
import { FRAGMENTED } from '@chartshq/muze-firebolt/src/enums/constants';
import { applyInteractionPolicy } from '../helper';
import {
    propagateValues,
    isCrosstab,
    resetSelectAction,
    dispatchBehaviours,
    attachBehaviours
} from './helper';
import { COMMON_INTERACTION } from '../../constants';

const setSideEffectConfig = (firebolt) => {
    const tooltipSideEffect = firebolt.sideEffects().tooltip;
    const allFields = firebolt.context.composition().visualGroup.resolver().getAllFields();

    if (isCrosstab(allFields)) {
        tooltipSideEffect.config({
            selectionSummary: {
                order: 1,
                className: 'tooltip-content-container-selectionSummary-crosstab',
                showMultipleMeasures: true
            },
            highlightSummary: {
                order: 0,
                className: 'tooltip-content-container-highlightSummary-crosstab'
            }
        });
    } else {
        tooltipSideEffect.config({
            selectionSummary: {
                order: 0,
                className: 'tooltip-content-container-selectionSummary-default',
                showMultipleMeasures: false
            },
            highlightSummary: {
                order: 1,
                className: 'tooltip-content-container-highlightSummary-default'
            }
        });
    }
};

const prepareSelectionSetData = (group, dataModel) => {
    const valueMatrix = group.matrixInstance().value;
    const fieldsConfig = dataModel.getFieldsConfig();
    const dimensions = Object.values(fieldsConfig).filter(d => d.def.type === FieldType.DIMENSION);
    const hasMeasures = Object.keys(dataModel.getFieldspace().getMeasure()).length;
    const measureName = hasMeasures ? [ReservedFields.MEASURE_NAMES] : [];
    const keys = {};
    const dimensionsMap = {};
    const groupDataMap = {};

    dataModel.getData({ withUid: true }).data.forEach((row) => {
        const uid = row[row.length - 1];
        uid.values().reduce((acc, id) => {
            acc[id] = row;
            return acc;
        }, groupDataMap);
    });

    valueMatrix.each((cell) => {
        const unit = cell.source();
        const dm = unit.cachedData()[0];
        const layers = unit.layers();
        const linkedRows = [];
        const { uids: uidsArr } = dm.getData();
        const uids = [];

        uidsArr.forEach((uid) => {
            const values = uid.values();
            const id = values.find(idValue => groupDataMap[idValue]);
            const linkedRow = groupDataMap[id];

            if (linkedRow) {
                linkedRows.push(linkedRow);
                uids.push(linkedRow[linkedRow.length - 1]);
            }
        });

        prepareSelectionSetMap({
            data: linkedRows,
            uids,
            dimensions
        }, layers, {
            keys,
            dimensionsMap
        });
    });

    return {
        keys,
        dimensionsMap,
        dimensions,
        allFields: [...dimensions, ...measureName]
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
        '*': (propagationPayload, firebolt) => {
            const propagationCanvasAlias = propagationPayload.sourceCanvas;
            const canvasAlias = firebolt.sourceCanvas();
            return propagationCanvasAlias ? canvasAlias === propagationCanvasAlias : true;
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
        this.payloadGenerators(payloadGenerator);
        this._interactionPolicy = this.constructor.defaultInteractionPolicy();
        this.crossInteractionPolicy(this.constructor.defaultCrossInteractionPolicy());
        const throwback = this.context._throwback;
        throwback.registerImmediateListener([CommonProps.MATRIX_CREATED], () => {
            this.config(this.context.config().interaction);
            applyInteractionPolicy(this);
            const group = this.context.composition().visualGroup;
            if (group) {
                setSideEffectConfig(this);
                this.createSelectionSet(group.groupedData());
                group.getGroupByData().on('propagation', (data, config) => {
                    this.handleDataModelPropagation(data, config);
                });
                // Dispatch pseudo select behaviour for highlighting measures with common dimensions in crosstab
                attachBehaviours(group);
            }
        });
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
            this._crossInteractionPolicy = mergeRecursive(mergeRecursive({},
                this.constructor.defaultCrossInteractionPolicy()), policy[0] || {});

            applyInteractionPolicy(this);
            return this;
        }
        return this._crossInteractionPolicy;
    }

    handleDataModelPropagation (data, config) {
        const group = this.context.composition().visualGroup;
        const valueMatrix = group.matrixInstance().value;
        const units = group.resolver().units();
        const propagationData = data;
        if (config.propagationSourceId === this.id()) {
            return this;
        }
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

        const payloadFn = this.getPayloadGeneratorFor(action);
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
            const { instance: unit = units[0][0] } =
                valueMatrix.findPlaceHolderById(propPayload.sourceUnit) || {};
            const propagationInf = {
                propagate: false,
                data: propagationData,
                propPayload,
                sourceIdentifiers,
                sourceId: config.propagationSourceId,
                isMutableAction: config.isMutableAction,
                unit
            };

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
        dispatchBehaviours(this, { behaviours, payload, unit });
        // Reset select action when dragging is done. Remove this when brush and select will be unioned
        resetSelectAction(this, { behaviours, payload, unit });
    }

    createSelectionSet (data) {
        const group = this.context.composition().visualGroup;
        const { keys, dimensions, dimensionsMap, allFields } = prepareSelectionSetData(group, data);
        this._metaData = {
            dimensionsMap,
            dimensions,
            allFields
        };
        super.createSelectionSet({ keys, fields: dimensions.map(d => d.def.name) });

        this._dimsMapGetter = createMapByDimensions(this, this.data());

        return this;
    }

    id () {
        return this.context.alias();
    }

    shouldApplySideEffects (propInf) {
        return propInf.applySideEffect !== false;
    }

    data (...params) {
        const group = this.context.composition().visualGroup;

        if (params.length) {
            const model = params[0];
            group.groupedData(model);
            this.createSelectionSet(group.groupedData());
            return this;
        }

        return group.getGroupByData();
    }

    resetData () {
        const group = this.context.composition().visualGroup;
        group.resetData();
        this.createSelectionSet(group.groupedData());
        return this;
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
        const group = this.context.composition().visualGroup;

        return group._originalGroupedData;
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
        const { mode } = this.context.config().interaction.tooltip;
        propagationInf.propPayload = propagationInf.propPayload || payload;
        sideEffects.forEach((d) => {
            let mappedEffects = d.effects;
            mappedEffects = mappedEffects.filter((se) => {
                if (se.name === TOOLTIP && mode === FRAGMENTED) {
                    return false;
                }
                return isSideEffectEnabled(this, { se, propagationInf });
            });
            d.effects = mappedEffects;
        });
        return sideEffects;
    }

    dispatchBehaviour (action, payload, propagationInf = {}) {
        const group = this.context.composition().visualGroup;
        const units = group.resolver().units();
        const { unit = units[0][0] } = propagationInf;
        const behaviourEffectMap = this._behaviourEffectMap;
        const sideEffects = getSideEffects(action, behaviourEffectMap);
        const sideEffectInstances = this.sideEffects();

        sideEffects.forEach(({ effects }) => {
            effects.forEach((effect) => {
                const name = effect.name;
                const inst = sideEffectInstances[name];

                if (inst) {
                    inst.sourceInfo(() => unit.getSourceInfo());
                    inst.layers(() => unit.layers());
                    inst.plotPointsFromIdentifiers((...params) =>
                        unit.getPlotPointsFromIdentifiers(...params));
                    inst instanceof SpawnableSideEffect &&
                        inst.drawingContext(() => unit.getDrawingContext());
                    inst.valueParser(unit.valueParser());
                }
            });
        });
        super.dispatchBehaviour(action, payload, propagationInf);
    }
}
