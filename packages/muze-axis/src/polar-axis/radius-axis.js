/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, mergeRecursive, generateGetterSetters, sanitizeDomainWhenEqual } from 'muze-utils';
import { createScale } from '../scale-creator';
import { LINEAR } from '../../../visual-group/src/enums/constants';
import { PROPS } from './props';
import { resolveAxisConfig } from '../helper';

const adjustDomain = (context) => {
    const minOuterRadius = context.config().minOuterRadius;
    const domain = context._domain;
    if (context._range.length) {
        const scale = context._scale;
        const value = scale.invert(minOuterRadius) - scale.invert(0);
        context._domain = [domain[0] - value, domain[1]];
        scale.domain(context._domain);
    }
};

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
        this._scale = this.createScale({
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
            let domain = resolveAxisConfig(customDomain, domainVal[0], this);
            domain = sanitizeDomainWhenEqual(domain);
            this._scale.domain(domain);
            this._domain = domain;
            adjustDomain(this);
        }
        return this._domain;
    }

    getInnerRadius (domainVal) {
        if (domainVal === undefined) {
            return this.range()[0];
        }
        return this._scale(domainVal);
    }

    getOuterRadius (domainVal) {
        if (domainVal === undefined) {
            return this.range()[1];
        }
        const radius = this._scale(domainVal) * this._radiusFactor;
        return radius;
    }

    range (...range) {
        if (range.length) {
            const { padding, range: customRange } = this.config();
            const sanitizedRange = range[0].map((v, i) => v + (i ? -padding[i] : padding[i]));
            const rangeVal = resolveAxisConfig(customRange, sanitizedRange, this);
            this._range = rangeVal;
            this._scale.range(rangeVal);
            adjustDomain(this);
        }
        return this._range;
    }

    setRadiusFactor (val) {
        this._radiusFactor = val;
        return this;
    }
}
