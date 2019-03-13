/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, mergeRecursive, generateGetterSetters } from 'muze-utils';
import { createScale } from '../scale-creator';
import { LINEAR } from '../../../visual-group/src/enums/constants';
import { PROPS } from './props';
import { resolveAxisConfig } from '../helper';

/**
* This class is used to instantiate a RadiusAxis.
* @class RadiusAxis
*/
export default class RadiusAxis {

    /**
     * Creates an instance of RadiusAxis.
     * @param {Object} config input parameters.
     * @memberof RadiusAxis
     */
    constructor (config = {}) {
        this._id = getUniqueId();
        generateGetterSetters(this, PROPS);
        this._range = [];
        this._radiusFactor = 1;
        this._config = mergeRecursive({}, this.constructor.defaultConfig());
        this.config(config);
        this._innerRadiusScale = this.createScale({
            scale: LINEAR
        });
        this._outerRadiusScale = this.createScale({
            scale: LINEAR
        });
    }

    static defaultConfig () {
        return {
            padding: [0, 1],
            minOuterRadius: 10
        };
    }

    config (...params) {
        if (params.length) {
            const config = mergeRecursive(this.config(), params[0]);
            this._config = config;
            return this;
        }
        return this._config;
    }

    createScale (strategy) {
        return createScale({
            type: strategy.scale,
            range: this.range()
        });
    }

    domain (...domainVal) {
        if (domainVal.length) {
            const { domain: customDomain } = this.config();
            this._domain = resolveAxisConfig(customDomain, domainVal[0], this);
            this._innerRadiusScale.domain(this._domain);
            this._outerRadiusScale.domain(this._domain);
        }
        return this._domain;
    }

    getInnerRadius (domainVal) {
        if (domainVal === undefined) {
            return this.range()[0][0];
        }
        return this._innerRadiusScale(domainVal);
    }

    getOuterRadius (domainVal) {
        if (domainVal === undefined) {
            return this.range()[1][1];
        }
        const radius = this._outerRadiusScale(domainVal) * this._radiusFactor;
        return radius;
    }

    range (...range) {
        if (range.length) {
            const { padding, range: customRange, minOuterRadius } = this.config();
            const sanitizedRange = range[0].map((v, i) => v + (i ? -padding[i] : padding[i]));
            const rangeVal = resolveAxisConfig(customRange, sanitizedRange, this);
            this._innerRadiusRange = rangeVal;
            this._innerRadiusScale.range(this._innerRadiusRange);
            this._outerRadiusRange = [rangeVal[0] + minOuterRadius, rangeVal[1]];
            this._outerRadiusScale.range(this._outerRadiusRange);
        }
        return [this._innerRadiusRange, this._outerRadiusRange];
    }

    setRadiusFactor (val) {
        this._radiusFactor = val;
        return this;
    }
}
