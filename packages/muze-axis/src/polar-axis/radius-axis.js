/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId } from 'muze-utils';
import { createScale } from '../scale-creator';
import { LINEAR } from '../../../visual-group/src/enums/constants';

/**
* This class is used to instantiate a SimpleAxis.
* @class SimpleAxis
*/
export default class RadiusAxis {

    /**
     * Creates an instance of SimpleAxis.
     * @param {Object} config input parameters.
     * @memberof SizeAxis
     */
    constructor (config = {}) {
        this._id = getUniqueId();
        this._config = Object.assign({}, this.constructor.defaultConfig(), config);
        this._range = [];
        this._scale = this.createScale({
            scale: LINEAR
        });
    }

    static defaultConfig () {
        return {
            padding: 1
        };
    }

    config () {
        return this._config;
    }

    /**
     *
     *
     *
     * @memberof SizeAxis
     */
    createScale (strategy) {
        return createScale({
            type: strategy.scale,
            range: this.range()
        });
    }

    getScaleValue (domainVal) {
        if (domainVal === undefined) {
            return this.range()[1];
        }
        return this._scale(domainVal);
    }

    domain (...domainVal) {
        if (domainVal.length) {
            this._domain = domainVal[0];
            return this._scale.domain(domainVal[0]);
        }
        return this._domain;
    }

    range (...range) {
        if (range.length) {
            this._range = range[0];
            return this._scale.range(range[0]);
        }
        return this._range;
    }
}
