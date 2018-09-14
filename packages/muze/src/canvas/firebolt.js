import {
    getDataModelFromIdentifiers,
    FieldType
} from 'muze-utils';

import { applyInteractionPolicy } from './helper';

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
        unitFireBolt.enableSideEffectOnPropagation('tooltip', (propagationPayload) => {
            const propagationCanvasAlias = propagationPayload.sourceCanvas;
            const canvasAlias = canvas.alias();
            return canvasAlias !== propagationCanvasAlias;
        });
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

export default class GroupFireBolt {
    constructor (context) {
        this.context = context;
        this._interactionPolicy = this.constructor.defaultInteractionPolicy();
        this.context.once('canvas.updated').then(() => {
            const policy = this._interactionPolicy;
            applyInteractionPolicy(policy, this);
        });
    }

    static defaultInteractionPolicy () {
        return defaultInteractionPolicy;
    }

    interactionPolicy (...policy) {
        if (policy.length) {
            this._interactionPolicy = policy[0] || this.constructor.defaultInteractionPolicy();
            return this;
        }
        return this._interactionPolicy;
    }

    dispatchBehaviour (behaviour, payload) {
        const propPayload = Object.assign(payload);
        const criteria = propPayload.criteria;
        const data = this.context.data();

        propPayload.action = behaviour;
        const model = getDataModelFromIdentifiers(data, criteria);
        data.propagate(model, propPayload, {
            sourceId: this.context.alias()
        });
        return this;
    }
}
