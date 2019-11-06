import {
    getDataModelFromIdentifiers,
    FieldType,
    mergeRecursive,
    CommonProps,
    concatModels,
    DataModel,
    retrieveNearestGroupByReducers
} from 'muze-utils';
import { Firebolt, getSideEffects } from '@chartshq/muze-firebolt';

import { applyInteractionPolicy } from '../helper';
import { addFacetData } from '../../../../visual-unit/src';
import { COMMON_INTERACTION } from '../../constants';

const unionData = (d1, d2) => {
    const dataMap = {};
    const dataArr = [];

    const prepareData = (data) => {
        const fields = data[0];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const key = `${fields.map((d, idx) => row[idx])}`;

            if (!dataMap[key]) {
                dataArr.push(row);
                dataMap[key] = row;
            }
        }
    };

    prepareData(d1);
    prepareData(d2);

    return [d1[0], ...dataArr];
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
            });
            throwback.registerChangeListener(['propagationInfo'], ([, propagationInfo]) => {
                const { action, payload } = propagationInfo;
                const behaviourEffectMap = this._behaviourEffectMap;
                const sideEffects = getSideEffects(action, behaviourEffectMap);
                const sideEffectInstances = this.sideEffects();
                const { sideEffects: sideEffectConf } = this.context.config().interaction;
                let selectionSet;
                let unit = this.context.composition().visualGroup.matrixInstance()
                    .value.findPlaceHolderById(payload.sourceUnit);
                if (unit) {
                    unit = unit.instance;
                    sideEffects.forEach(({ effects }) => {
                        effects.filter(effect => sideEffectConf[effect.name || effect] === COMMON_INTERACTION)
                            .forEach((effect) => {
                                let name;
                                let options;
                                if (typeof effect === 'object') {
                                    name = effect.name;
                                    options = effect.options;
                                } else {
                                    name = effect;
                                }
                                selectionSet = selectionSet || this.unionDataModels(action);
                                const inst = sideEffectInstances[name];
                                inst.sourceInfo(() => unit.getSourceInfo());
                                inst.plotPointsFromIdentifiers((...params) =>
                                    unit.getPlotPointsFromIdentifiers(...params));
                                inst.drawingContext(() =>
                                    unit.getDrawingContext()).apply(selectionSet, payload, options);
                            });
                    });
                }
            });

            return this;
        }
        return this._crossInteractionPolicy;
    }

    /**
     * Dispatches a behavioural action with a payload. It takes the name of the behavioural action and a payload
     * object which contains the criteria aend an array of side effects which determines what side effects are
     * going to be shown in each visual unit of the canvas. It prepares the datamodel from the given criteria
     * and initiates a propagation from the datamodel of canvas. Then all the visual units of canvas which listens
     * to the propagation gets informed on which rows got selected and dispatches the behavioural action sent during
     * propagation.
     *
     * To dispatch a behavioural action on the canvas
     * ```
     *  // Get the firebolt instance of the canvas
     *  const firebolt = canvas.firebolt();
     *  // Dispatch a brush behaviour
     *  firebolt.dispatchBehaviour('brush', {
     *      // Selects all the rows with Horsepower having range between 100 and 200.
     *      criteria: {
     *          Horsepower: [100, 200]
     *      }
     *  });
     * // On dispatch of this behavioural action, a selection box gets created and plots gets faded out which are the
     * // default side effects mapped to this behavioural action.
     * ```
     *
     * ```
     * Additionally, it can also be passed an array of side effects in the payload.
     *  // Dispatch a select behaviour with only crossline as side effect.
     *  firebolt.dispatchBehaviour('select', {
     *      criteria: {
     *          Cylinders: ['8']
     *      },
     *      sideEffects: ['crossline']
     *  });
     * ```
     *
     * @public
     *
     * @param {string} behaviour Name of the behavioural action
     * @param {Object} payload Object which contains the interaction information.
     * @param {Object | Array.<Array>} payload.criteria Identifiers by which the selection happens.
     * @param {Array.<string|Object>} payload.sideEffects Side effects which needs to be shown.
     *
     * @return {GroupFireBolt} Instance of firebolt.
     */
    dispatchBehaviour (behaviour, payload) {
        const propPayload = Object.assign(payload);
        const criteria = propPayload.criteria;
        const data = this.context.composition().visualGroup.getGroupByData();
        const model = getDataModelFromIdentifiers(data, criteria);
        const behaviouralAction = this._actions.behavioural[behaviour];

        if (behaviouralAction) {
            const mutates = behaviouralAction.constructor.mutates();
            const propConfig = {
                payload: propPayload,
                action: behaviour,
                criteria: model,
                sourceId: this.context.alias(),
                isMutableAction: mutates
            };

            data.propagate(model, propConfig, true);
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

    getUnionedSet (behaviour, sourceUnit) {
        let model = sourceUnit.firebolt()._actions.behavioural[behaviour].propagationIdentifiers();
        let unionedModel = model ? Object.assign(model, {
            identifiers: addFacetData(model, sourceUnit.facetByFields())
        }) : null;

        const unitMatrix = this.context.composition().visualGroup.matrixInstance().value;
        const sourceFacets = `${sourceUnit.facetByFields()[1]}`;

        unitMatrix.each((cell) => {
            const unit = cell.source();
            const facetVals = `${unit.facetByFields()[1]}`;

            model = unit.firebolt()._actions.behavioural[behaviour].propagationIdentifiers();

            if (model) {
                let { identifiers } = model;
                const { fields } = model;
                const hasMeasures = fields.some(field => field.type === FieldType.MEASURE);

                if (facetVals !== sourceFacets || hasMeasures) {
                    identifiers = addFacetData(model, unit.facetByFields());
                    unionedModel = {
                        identifiers: unionData(identifiers, unionedModel.identifiers),
                        fields: model.fields
                    };
                }
            }
        });

        return unionedModel;
    }

    unionDataModels (behaviour) {
        const unitMatrix = this.context.composition().visualGroup.matrixInstance().value;
        let unionedModel = null;
        unitMatrix.each((cell) => {
            const unit = cell.source();
            const selectionSet = unit.firebolt().getEntryExitSet(behaviour);
            const { mergedEnter: { model } } = selectionSet || {};
            if (model && !model.isEmpty()) {
                if (!unionedModel) {
                    unionedModel = model;
                } else {
                    const [data, schema] = concatModels(model, unionedModel);
                    unionedModel = new DataModel(data, schema);
                }
            }
        });
        return {
            mergedEnter: {
                model: unionedModel,
                aggFns: retrieveNearestGroupByReducers(unionedModel)
            }
        };
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
        const { interaction: { behaviours: behaviourConf } } = this.context.config();

        behaviours.forEach((action) => {
            let mergedModel = null;
            firebolt.dispatchBehaviour(action, payload, { propagate: false }, { applySideEffect: false });

            const identifiers = firebolt._actions.behavioural[action].propagationIdentifiers();

            if (identifiers !== null) {
                mergedModel = behaviourConf[action] === COMMON_INTERACTION ? this.getUnionedSet(action, unit) :
                    Object.assign(identifiers, {
                        identifiers: addFacetData(identifiers, unit.facetByFields())
                    });
            }
            firebolt.propagate(action, payload, mergedModel, getSideEffects(action, firebolt._behaviourEffectMap));
        });
    }
}
