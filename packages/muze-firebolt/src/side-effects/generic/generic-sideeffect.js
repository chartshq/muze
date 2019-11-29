import { mergeRecursive, getUniqueId, generateGetterSetters } from 'muze-utils';
import { PROPS } from './props';

/**
 * This is the base class of all side effects. It contains all common methods like setting configuration, disabling,
 * enabling side effect, etc. Every new side effect has to inherit this class or {@link SpawnableSideEffect} or
 * {@link SurrogateSideEffect} class. All side effects are initialized by firebolt. The instance of firebolt is
 * passed on initialization. The firebolt instance contains ```context``` which is the instance of visual unit with
 * which the firebolt is attached.
 *
 * @public
 * @class
 * @module GenericSideEffect
 */
export default class GenericSideEffect {
    constructor (firebolt) {
        this.firebolt = firebolt;
        this._enabled = true;
        this._strategy = 'default';
        this._config = {};
        this._id = getUniqueId();
        this._strategies = {};
        generateGetterSetters(this, PROPS);
        this.config(this.constructor.defaultConfig());
        this.sourceInfo(() => this.firebolt.context.getSourceInfo());
        this.layers(() => this.firebolt.context.layers());
        this.plotPointsFromIdentifiers((...args) => this.firebolt.context.getPlotPointsFromIdentifiers(...args));
    }

    /**
     * Returns the default configuration of the side effect.
     *
     * @public
     * @return {Object} Default configuration of side effect.
     */
    static defaultConfig () {
        return {};
    }

    /**
     * Returns the formal name of a side effect. This method must be implemented by all side effects which changes
     * or adds any element in the visualization.
     *
     * @return {string} Formal name of side effect.
     */
    static formalName () {
        return 'generic';
    }

    static target () {
        return 'all';
    }

    /**
     * Returns true if the side effects mutates the data of chart.
     *
     * @public
     *
     * @return {boolean} If the side effect mutates the data of chart.
     */
    static mutates () {
        return false;
    }

    /**
     * Sets or gets the configuration of side effect.
     *
     * When setter,
     * @param {Object} config Configuration of side effect.
     * @return {GenericSideEffect} Side effect instance.
     *
     * When getter,
     * @return {Object} Side effect configuration.
     */
    config (...params) {
        if (params.length) {
            this._config = mergeRecursive(this._config, params[0]);
            return this;
        }
        return this._config;
    }

    disable () {
        this._enabled = false;
        return this;
    }

    enable () {
        this._enabled = true;
        return this;
    }

    isEnabled () {
        return this._enabled;
    }

    /**
     * Applies the interaction effect on the chart. This is where the implemntation of the side effect is defined.
     *
     * @param {Object} selectionSet Contains the entry and exit set of data which got affected during interaction.
     * @param {Object} selectionSet.mergedEnter Combined previous entry and new entry set.
     * @param {DataModel} selectionSet.mergedEnter.model Instance of data model containing all rows which got
     * affected during interaction.
     * @param {Array} selectionSet.mergedEnter.uids Ids of all rows which were affected during interaction.
     * @param {Object} selectionSet.mergedExit Combined previous exit and new exit set.
     * @param {DataModel} selectionSet.mergedExit.model Instance of data model containing rows which were not affected
     * during interaction.
     * @param {Array} selectionSet.mergedExit.uids Ids of all rows which were not affected during interaction.
     * @param {Object} selectionSet.entrySet Entry set information.
     * @param {Array} selectionSet.entrySet[0].uids All row ids which got affected during previous interaction.
     * @param {Array} selectionSet.entrySet[1].uids All row ids which got affected during current interaction.
     * @param {Array} selectionSet.exitSet[0].uids All row ids which were not affected during previous interaction.
     * @param {Array} selectionSet.exitSet[1].uids All row ids which were not affected during current interaction.
     * @param {Object} payload Payload information of the behavioural action on trigger of which this side effect
     * is applied.
     * @param {Object} options Optional information for side effect like strategy, etc.
     */
    apply () {
        return this;
    }

    /**
     * Adds a new strategy method for this side effect. The strategy method is implemented by side effect class.
     *
     * @param {string} name Name of the strategy.
     * @param {Function} fn Strategy method.
     *
     * @return {GenericSideEffect} Instance of side effect.
     */
    setStrategy (name, fn) {
        if (fn) {
            this._strategies[name] = fn;
        }
        return this;
    }

    sourceInfo (...sourceInfo) {
        if (sourceInfo.length) {
            this._sourceInfo = sourceInfo[0];
            return this;
        }
        return this._sourceInfo();
    }

    layers (...layers) {
        if (layers.length) {
            this._layers = layers[0];
            return this;
        }
        return this._layers();
    }

    plotPointsFromIdentifiers (...params) {
        if (params.length && params[0] instanceof Function) {
            this._plotPointsFromIdentifiers = params[0];
            return this;
        }
        return this._plotPointsFromIdentifiers(...params);
    }
}
