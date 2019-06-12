import {
    getDataModelFromIdentifiers,
    FieldType,
    mergeRecursive,
    isSimpleObject,
    CommonProps
} from 'muze-utils';
import { Firebolt } from '@chartshq/muze-firebolt';

import { applyInteractionPolicy } from '../helper';

const defaultInteractionPolicy = (valueMatrix, firebolt) => {
    const isMeasure = field => field.type() === FieldType.MEASURE;
    const canvas = firebolt.context;
    const visualGroup = canvas.composition().visualGroup;
    const xFields = [].concat(...visualGroup.getFieldsFromChannel('x'));
    const yFields = [].concat(...visualGroup.getFieldsFromChannel('y'));
    const colDim = xFields.every(field => field.type() === FieldType.DIMENSION);
    const fieldInf = visualGroup.resolver().getAllFields();
    const rowFacets = fieldInf.rowFacets;
    const colFacets = fieldInf.colFacets;
    valueMatrix.each((cell) => {
        const unitFireBolt = cell.valueOf().firebolt();
        if (!(xFields.every(isMeasure) && yFields.every(isMeasure))) {
            const facetFields = cell.valueOf().facetByFields()[0];
            const unitColFacets = facetFields.filter(d => colFacets.findIndex(v => v.equals(d)) !== -1);
            const unitRowFacets = facetFields.filter(d => rowFacets.findIndex(v => v.equals(d)) !== -1);
            let propFields;
            if (colDim) {
                propFields = unitColFacets.map(d => `${d}`);
            } else {
                propFields = unitRowFacets.map(d => `${d}`);
            }

            unitFireBolt.propagateWith('*', propFields, true);
        }
    });
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
        return defaultInteractionPolicy;
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
            const context = this.context;
            applyInteractionPolicy(this);
            context._throwback.registerImmediateListener([CommonProps.MATRIX_CREATED], () => {
                applyInteractionPolicy(this);
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
        const fieldsConfig = data.getFieldsConfig();
        const model = getDataModelFromIdentifiers(data, criteria);
        const behaviouralAction = this._actions.behavioural[behaviour];

        if (behaviouralAction) {
            const fields = isSimpleObject(criteria) ? Object.keys(criteria) : (criteria ? criteria[0] : []);
            const validFields = fields.filter(field => field in fieldsConfig);
            const mutates = behaviouralAction.constructor.mutates();
            const propConfig = {
                payload: propPayload,
                action: behaviour,
                criteria: model,
                sourceId: this.context.alias(),
                isMutableAction: mutates,
                propagateInterpolatedValues: validFields.every(field => fieldsConfig[field].def.type ===
                    FieldType.MEASURE)
            };
            data.propagate(model, propConfig, true);
        }
        return this;
    }

    registerSideEffects (sideEffects) {
        for (const key in sideEffects) {
            this._sideEffectDefinitions[sideEffects[key].formalName()] = sideEffects[key];
        }
        return this;
    }
}
