import { Firebolt } from '@chartshq/muze-firebolt';
import { propagate, payloadGenerator } from './helper';
import { STEP, GRADIENT } from '../enums/constants';
import { HIGHLIGHT, FILTER } from '../enums/behaviours';
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
            values = criteria.slice(1, criteria.length);
            if (values) {
                uniqueIds = [...new Set([].concat(...values))];
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
            const { propagationSourceId } = config;
            const propagationInf = {
                propagate: false,
                data,
                sourceId: propagationSourceId
            };
            const enabledFn = config.enabled;
            const isActionSourceSame = config.sourceId === this.id();
            const enabled = enabledFn ? enabledFn(config, this) : true;
            if (enabled && config.action !== FILTER) {
                if (isActionSourceSame) {
                    this.dispatchBehaviour(config.action, payload, propagationInf);
                } else {
                    // @todo make it configurable
                    this.dispatchBehaviour(HIGHLIGHT, payload, propagationInf);
                }
            }
        };
    }

    data () {
        return this.context.metaData();
    }

    id () {
        return `legend-${this.context._id}`;
    }

    sourceCanvas () {
        return this.context.canvasAlias();
    }

    shouldApplySideEffects (propInf) {
        return propInf.propagate === false;
    }
}
