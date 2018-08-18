/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, getSymbol, generateGetterSetters } from 'muze-utils';
import { createScale } from '../scale-creator';
import { DEFAULT_CONFIG } from './defaults';
import { SHAPE } from '../enums/constants';
import { shapeGenerator } from './helper';
import { PROPS } from './props';

/**
* This class is used to instantiate a SimpleAxis.
* @class SimpleAxis
*/
export default class ShapeAxis {
    /**
    * Creates an instance of SimpleAxis.
    * @param {Object} params input parameters.
    * @param {Object | undefined} params.range Type of color scheme.
    * @param {string} params.type The type of scale to handle.
    * @memberof ShapeAxis
    */
    constructor (config) {
        generateGetterSetters(this, PROPS);

        this._id = getUniqueId();
        this._config = Object.assign({}, this.constructor.defaultConfig(), config);
        this._range = config.range || ['circle', 'diamond', 'star', 'cross', 'square', 'wye', 'triangle'];
        this._generator = config.generator;

        this._scale = createScale({
            type: 'ordinal',
            range: this._range
        });
    }

     /**
     *
     *
     * @static
     * @returns
     * @memberof ColorAxis
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

     /**
     *
     *
     * @static
     * @returns
     * @memberof ColorAxis
     */
    static type () {
        return SHAPE;
    }

    /**
     *
     *
     * @param {*} value
     * @returns
     * @memberof ShapeAxis
     */
    getShape (value) {
        if (!this.scale() || !this.domain() || !value) {
            return this.config().value;
        }

        if (this._generatedShapes) {
            return this._generatedShapes[value];
        }

        const shapeType = this.scale()(value);
        if (shapeType === 'string') {
            return getSymbol(shapeType);
        }

        return shapeType;
    }

    /**
     * This method is used to assign a domain to the axis.
     *
     * @param {Array} domain the domain of the scale
     * @memberof ShapeAxis
     */
    updateDomain (domain) {
        this.uniqueValues(domain);
        this.domain(domain);
        this.scale().domain(domain);

        if (this.generator()) {
            this._generatedShapes = shapeGenerator(domain, this.generator());
        }
        return this;
    }

    /**
     * This method returns an object that can be used to
     * reconstruct this instance.
     *
     * @return {Object} the serializable props of axis
     * @memberof ShapeAxis
     */
    serialize () {
        return {
            type: this.constructor.type(),
            scale: this.scale(),
            domain: this.domain(),
            range: this.range(),
            config: this.config()
        };
    }

    /**
     * Returns the id of the axis.
     * @return {string} Unique identifier of the axis.
     */
    id () {
        return this._id;
    }
}
