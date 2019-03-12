/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, mergeRecursive, generateGetterSetters } from 'muze-utils';
import { createScale } from '../scale-creator';
import { LINEAR } from '../../../visual-group/src/enums/constants';
import { PROPS } from './props';

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
        generateGetterSetters(this, PROPS);
        this._range = [];
        this._config = mergeRecursive({}, this.constructor.defaultConfig());
        this.config(config);
        this._scale = this.createScale({
            scale: LINEAR
        });
    }

    static defaultConfig () {
        return {
            padding: [0, 1]
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
            const { domain } = this.config();
            this._domain = domain || domainVal[0];
            return this._scale.domain(this._domain);
        }
        return this._domain;
    }

    range (...range) {
        if (range.length) {
            const { padding, range: customRange } = this.config();
            this._range = customRange || range[0].map((v, i) => v + (i ? -padding[i] : padding[i]));

            return this._scale.range(this._range);
        }
        return this._range;
    }
}
