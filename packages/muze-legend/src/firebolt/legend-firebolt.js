import { Firebolt } from '@chartshq/muze-firebolt';
import { propagate, payloadGenerator } from './helper';
import { STEP, GRADIENT } from '../enums/constants';
import { HIGHLIGHT, SELECT } from '../enums/behaviours';
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
            values = criteria;
            if (values instanceof Array) {
                values = values.slice(1, criteria.length);
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
            const payloadFn = payloadGenerator[config.action] || payloadGenerator.__default;
            const payload = payloadFn(data, config);
            const { propagationSourceId } = config;
            const propagationInf = {
                propagate: false,
                data,
                sourceId: propagationSourceId
            };
            const isActionSourceSame = config.sourceId === this.id();
            if (!isActionSourceSame && config.action === HIGHLIGHT) {
                // @todo make it configurable
                this.dispatchBehaviour(HIGHLIGHT, payload, propagationInf);
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

    shouldApplySideEffects () {
        return true;
    }

    /**
     * Finds out if a deselected legend item is hovered
     * @param {string} behaviour type of interaction
     * @return {bool} true if highlight should work on the legend item, false otherwise
     */
    shouldApplyHighlightEffect (behaviour) {
        const highlightedSet = this.getEntryExitSet(HIGHLIGHT);
        const selectionSet = this.getEntryExitSet(SELECT);

        if (highlightedSet && selectionSet) {
            const currentHighlightedSet = highlightedSet.mergedEnter.uids;
            const deselectedLegendItemsSet = selectionSet.mergedExit.uids;

            // Find out if the currently highlighted item is also the deselected item
            if (behaviour === HIGHLIGHT) {
                const disabledLegendItems = [].concat(...currentHighlightedSet).filter(
                    id => [].concat(...deselectedLegendItemsSet).includes(id)
                );
                if (disabledLegendItems.length) {
                    return false;
                }
            }
        }
        return true;
    }
}
