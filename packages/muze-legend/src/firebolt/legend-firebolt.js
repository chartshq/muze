import { Firebolt } from 'muze-firebolt';
import { propagate } from './helper';
import { STEP, GRADIENT } from '../enums/constants';

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

    /**
     * Dispatches behavioural action on legend with a payload
     * It also propagates the selection to other datatables.
     * @param {string} behaviourName name of behaviour
     * @param {Object} payload Information about behaviour
     * @memberof LegendFireBolt
     */
    dispatchBehaviour (behaviourName, payload) {
        const action = this._actions.behavioural[behaviourName];

        if (action) {
            const sideEffects = this._behaviourEffectMap[behaviourName];
            const selectionSet = action.dispatch(payload, {})();
            const propagationSelectionSet = selectionSet[0];
            this.applySideEffects(sideEffects, propagationSelectionSet, payload);
            propagate(this, behaviourName, propagationSelectionSet, {
                payload
            });
        }
    }

    getAddSetFromCriteria (criteria) {
        let values;
        let uniqueIds;
        const type = this.context.constructor.type();

        if (criteria === null) {
            uniqueIds = null;
        }
        else if (type === STEP) {
            values = Object.values(criteria);
            uniqueIds = this.context.data().filter(d => values.indexOf(d.range) !== -1).map(d => d.id);
        } else if (type === GRADIENT) {
            uniqueIds = [];
        } else {
            values = criteria[1];
            uniqueIds = this.context.data().filter(d => values.indexOf(d.value) !== -1).map(d => d.id);
        }
        return {
            uids: uniqueIds,
            model: null
        };
    }

    getFullData () {
        return null;
    }
}
