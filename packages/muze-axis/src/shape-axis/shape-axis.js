/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, getSymbol, generateGetterSetters, mergeRecursive, InvalidAwareTypes } from 'muze-utils';
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
    * @memberof ShapeAxis
    */
    constructor (config) {
        generateGetterSetters(this, PROPS);

        this._id = getUniqueId();
        this._config = Object.assign({}, this.constructor.defaultConfig());
        this._config = mergeRecursive(this._config, config);

        this._scale = createScale({
            type: 'ordinal',
            range: this._config.range
        });
        this.updateDomain(config.domain);
    }

     /**
     *
     *
     * @static
     *
     * @memberof ColorAxis
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

     /**
     *
     *
     * @static
     *
     * @memberof ColorAxis
     */
    static type () {
        return SHAPE;
    }

    /**
     *
     *
     * @param {*} value
     *
     * @memberof ShapeAxis
     */
    getShape (value) {
        if (!this.scale() || !this.domain() || !value || value instanceof InvalidAwareTypes) {
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
    updateDomain (domain = []) {
        if (domain.length) {
            this.uniqueValues(domain);
            this.domain(domain);
            this.scale().domain(domain);

            if (this.config().generator) {
                this._generatedShapes = shapeGenerator(domain, this.config().generator);
            }
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
            range: this.config().range,
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
