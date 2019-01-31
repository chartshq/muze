import { sanitizeIP, mergeRecursive } from 'muze-utils';
import { TOP, CENTER, BOTTOM } from '../enums/constants';

/*
 * This is the abstract implementation of the root layout. This takes care of common work which all the layouts
 * has to handle. The common work includes sanitizaion of inputs, update, rerender, dispose etc. This class can't be
 * used directly (as ofcourse this is an abstract implementaiton), the class which is implementing it has to implement
 * the necessary methods and gives its on visual.
 */

/**
 * This class is used to create a generic layout. It can be extended to create layouts
 * of different types
 * @class GenericLayout
 */
export default class GenericLayout {

    /**
     * Creates an instance of TableLayout.
     * @param {HTMLElement} mountPoint DOM element/d3 selection where the layout is to be mounted
     * @param {Object} measurement The dimensions of the layout
     * @param {Object} config configuration to be given for the layout
     * @param {Object} dependencies external dependencies.
     *
     * @memberof GenericLayout
     *
     */
    constructor (mountPoint, measurement, config, dependencies) {
        this._config = {};
        this._measurement = {};
        this._matrices = [];
        // External dependencies to be included for the layout. This includes the ext global dependencies like
        // smartlabel which has one single implementation of throughout the page or per isntance
        this._dependencies = dependencies;

        this.measurement(measurement);
        this.mountPoint(mountPoint);
        this.config(config);
    }

    /**
     * Returns an object which is used to recreate the layout.
     * @return {Object} the serialized components
     */
    serialize () {
        return {
            measurement: this.measurement(),
            config: this.config(),
            matrices: this.matrices()
        };
    }

     /**
     * Sets/Gets the config for the layout
     * @param {Object} config configuration for the layout
     * @return {Layout|Object} Gets the Config/ Returns this instance when set
     */
    config (config) {
        if (config) {
            this._config = mergeRecursive(this._config || {}, config);
            this._config.border.width = Math.max(0, this._config.border.width);
            return this;
        }
        return this._config;
    }

    /**
     * Sets/Gets the measurement for the layout
     * @param {Object} measurement measurement for the layout
     * @return {Layout|Object} Gets the measurement/ Returns this instance when set
     */
    measurement (measurement) {
        if (measurement) {
            this._measurement = mergeRecursive(this._measurement || {}, measurement);

            return this;
        }
        return this._measurement;
    }

    /**
     * Sets/Gets the matrices for the layout
     * @param {Object} matrices matrices for the layout
     * @return {Layout|Object} Gets the matrices/ Returns this instance when set
     */
    matrices (matrices) {
        if (matrices) {
            this._matrices = sanitizeIP.typeObj([TOP, CENTER, BOTTOM], matrices);

            return this;
        }
        return this._matrices;
    }

    /**
     * Sets/Gets the matrix for row
     * @param {Object} matrix matrices for the layout
     * @return {Layout|Object} Gets the matrix/ Returns this instance when set
     */
    rowMatrix (matrix) {
        if (matrix) {
            this._rowMatrix = matrix;
            return this;
        }
        return this._rowMatrix;
    }

    /**
     * Sets/Gets the matrix for columns
     * @param {Object} matrix matrices for the layout
     * @return {Layout|Object} Gets the matrix/ Returns this instance when set
     */
    columnMatrix (matrix) {
        if (matrix) {
            this._columnMatrix = matrix;
            return this;
        }
        return this._columnMatrix;
    }

   /**
     * Sets/Gets the matrix for value
     * @param {Object} matrix matrices for the layout
     * @return {Layout|Object} Gets the matrix/ Returns this instance when set
     */
    centerMatrix (matrix) {
        if (matrix) {
            this._centerMatrix = matrix;
            return this;
        }
        return this._centerMatrix;
    }

    /**
     * Sets/Gets the mountPoint for the layout
     * @param {Object} mountPoint mountPoint for the layout
     * @return {Layout|Object} Gets the mountPoint/ Returns this instance when set
     */
    mountPoint (mountPoint) {
        if (mountPoint) {
            this._mountPoint = mountPoint;

            return this;
        }
        return this._mountPoint;
    }
}
