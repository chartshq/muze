/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { interpolateArray, getUniqueId, generateGetterSetters } from 'muze-utils';
import { createScale, } from '../scale-creator';
import { DEFAULT_CONFIG } from './defaults';
import { SIZE, ORDINAL, QUANTILE } from '../enums/constants';
import { PROPS } from './props';

/**
* This class is used to instantiate a SimpleAxis.
* @class SimpleAxis
*/
export default class SizeAxis {

    /**
     * Creates an instance of SimpleAxis.
     * @param {Object} config input parameters.
     * @memberof SizeAxis
     */
    constructor (config) {
        generateGetterSetters(this, PROPS);

        this._id = getUniqueId();
        this._config = Object.assign({}, this.constructor.defaultConfig(), config);
        this._scale = this.createScale();
        this._range = this._config.range;

        this.updateDomain(config.domain);
    }

    /**
     *
     *
     * @returns
     * @memberof SizeAxis
     */
    createScale () {
        const {
            interpolate,
            type
        } = this.config();
        return createScale({
            type: interpolate ? type : QUANTILE,
            range: this.range() || [],
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
        return SIZE;
    }

    /**
     *
     *
     * @param {*} rangeValues
     * @returns
     * @memberof SizeAxis
     */
    getComputedRange (rangeValues) {
        const {
            type,
            interpolate
        } = this.config();

        if ((type === ORDINAL || interpolate) && this.domain()) {
            const domainLength = this.domain().length;
            return interpolateArray(rangeValues, domainLength);
        }
        return rangeValues;
    }

    /**
     *
     *
     * @param {*} domainVal
     * @returns
     * @memberof SizeAxis
     */
    getSize (domainVal = 0) {
        let sizeVal = 1;
        const {
            type,
            interpolate,
            scaleFactor,
            value
        } = this.config();
        const scale = this.scale();
        const domain = this.domain() || [1, 1];
        const range = this.range();

        if (!scale || domain[0] === domain[1]) {
            sizeVal = value;
        } else if (!interpolate && type === ORDINAL) {
            const rangeVal = scale(domainVal);
            sizeVal = (rangeVal / range[range.length - 1]);
        } else if (type === ORDINAL) {
            sizeVal = scale(this.uniqueValues().indexOf(domainVal)) || range[1];
        } else {
            sizeVal = scale(domainVal);
        }
        return sizeVal * scaleFactor;
    }

    /**
     * This method is used to assign a domain to the axis.
     *
     * @param {Array} domain the domain of the scale
     * @memberof SizeAxis
     */
    updateDomain (domain) {
      /* istanbul ignore next */
        this.uniqueValues(domain);
        if (domain) {
            this.domain(domain);
            this.scale().domain(domain);
        }
        this.updateRange();
        return this;
    }

    /**
     *
     *
     * @param {*} range
     * @memberof SizeAxis
     */
    updateRange (range) {
        const updatedRange = range || this.range();

        this.range(this.getComputedRange(updatedRange));

        this.scale().range(this.range());

        this._rangeSum = this.range().reduce((total, num) => {
            total += num;
            return total;
        }, 0);
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof SizeAxis
     */
    getScaleFactor () {
        return this.config().scaleFactor;
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
