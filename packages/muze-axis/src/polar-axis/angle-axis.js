/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, Symbols, mergeRecursive, generateGetterSetters } from 'muze-utils';
import { createScale } from '../scale-creator';
import { DEFAULT_ANGLE_DOMAIN } from '../enums/constants';
import { PROPS } from './props';
import { resolveAxisConfig } from '../helper';

const { pie } = Symbols;

const createAngleValues = (context) => {
    const angleData = context._angleFn(context._domain);
    angleData.forEach((v) => {
        v.startAngle -= Math.PI / 2;
        v.endAngle -= Math.PI / 2;
    });
    context._angleValues = angleData.reduce((values, d) => {
        const key = d.data;
        !values[key] && (values[key] = []);
        values[key].push(d);
        return values;
    }, {});
};

/**
* This class is used to instantiate a AngleAxis.
* @class AngleAxis
*/
export default class AngleAxis {

    /**
     * Creates an instance of AngleAxis.
     * @param {Object} config input parameters.
     * @memberof AngleAxis
     */
    constructor (config = {}) {
        this._id = getUniqueId();
        generateGetterSetters(this, PROPS);
        this._config = mergeRecursive({}, this.constructor.defaultConfig());
        this.config(config);
        this._range = [0, 360];
        this._angleFn = pie()
                .value(d => (typeof d === 'string' ? 1 : d))
                .sortValues(null);
        this._angleValues = {};
    }

    static defaultConfig () {
        return {};
    }

    createScale (strategy) {
        const {
            range
        } = this.config();
        return createScale({
            type: strategy.scale,
            range
        });
    }

    getScaleValue (domainVal) {
        return this._angleValues[domainVal];
    }

    padAngle (angle) {
        this._angleFn = this._angleFn.padAngle(angle);
    }

    domain (...domainVal) {
        if (domainVal.length) {
            const { domain: customDomain } = this.config();
            const domain = domainVal[0].length ? domainVal[0] : DEFAULT_ANGLE_DOMAIN;
            this._domain = resolveAxisConfig(customDomain, domain, this);
            createAngleValues(this);
            return this;
        }
        return this._domain;
    }

    range (...range) {
        if (range.length) {
            const { range: customRange } = this.config();
            this._range = resolveAxisConfig(customRange, range[0], this);
            const domain = this.domain();
            const [startAngle, endAngle] = this._range;
            this._angleFn
                    .startAngle((startAngle / 180) * Math.PI)
                    .endAngle(Math.PI * endAngle / 180);
            if (domain && domain.length) {
                createAngleValues(this);
            }
            return this;
        }
        return this._range;
    }
}
