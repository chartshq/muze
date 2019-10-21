import { Firebolt } from '@chartshq/muze-firebolt';
import { propagate } from './helper';
import { STEP, GRADIENT } from '../enums/constants';
import { HIGHLIGHT } from '../enums/behaviours';
import { payloadGenerator } from './payload-generator';
/**
 * This class manages the interactions of legend.
 * @export
 * @class LegendFireBolt
 * @extends {Firebolt}
 */
export class LegendFireBolt extends Firebolt {
    constructor (...params) {
        super(...params);
        this.initializeSideEffects();
    }

    getPropagationSelectionSet (selectionSet) {
        return selectionSet[0];
    }

    propagate (behaviourName, payload, selectionSet) {
        propagate(this, behaviourName, selectionSet, {
            payload
        });
    }

    getAddSetFromCriteria (criteria) {
        let values;
        let uniqueIds;
        const type = this.context.constructor.type();

        if (criteria === null) {
            uniqueIds = null;
        } else if (type === STEP) {
            values = Object.values(criteria);
            uniqueIds = this.context.data().filter(d => values.indexOf(d.range) !== -1).map(d => d.id);
        } else if (type === GRADIENT) {
            uniqueIds = [];
        } else {
            values = criteria[1];
            if (values) {
                uniqueIds = this.context.data().filter(d => values.indexOf(d.rawVal) !== -1).map(d => d.id);
            } else {
                values = Object.values(criteria);
                uniqueIds = this.context.data().filter(d => values.indexOf(d.range) !== -1).map(d => d.id);
            }
        }
        return {
            uids: uniqueIds,
            model: null
        };
    }

    getFullData () {
        return null;
    }

    onDataModelPropagation () {
        return (data, config) => {
            const context = this.context;
            if (!context.mount()) {
                return;
            }
            const payload = payloadGenerator(data, config);
            const propagationInf = {
                propagate: false,
                data,
                sourceId: config.propagationSourceId
            };
            this.dispatchBehaviour(HIGHLIGHT, payload, propagationInf);
        };
    }

}
