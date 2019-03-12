/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, Symbols, mergeRecursive, generateGetterSetters } from 'muze-utils';
import { createScale } from '../scale-creator';
import { DEFAULT_ANGLE_DOMAIN } from '../enums/constants';
import { PROPS } from './props';

const { pie } = Symbols;

/**
* This class is used to instantiate a SimpleAxis.
* @class SimpleAxis
*/
export default class ThetaAxis {

    /**
     * Creates an instance of SimpleAxis.
     * @param {Object} config input parameters.
     * @memberof SizeAxis
     */
    constructor (config = {}) {
        this._id = getUniqueId();
        generateGetterSetters(this, PROPS);
        this._config = mergeRecursive({}, this.constructor.defaultConfig());
        this.config(config);
        this._range = [0, 360];
        this._pie = pie()
                .value(d => (typeof d === 'string' ? 1 : d))
                .sortValues(null);
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
        return this._pieData.filter(d => d.data === domainVal);
    }

    padAngle (angle) {
        this._pie = this._pie.padAngle(angle);
    }

    domain (...domainVal) {
        if (domainVal.length) {
            this._domain = domainVal[0].length ? domainVal[0] : DEFAULT_ANGLE_DOMAIN;
            this._pieData = this._pie(this._domain);
            this._pieData.forEach((v) => {
                v.startAngle -= Math.PI / 2;
                v.endAngle -= Math.PI / 2;
            });
            return this;
        }
        return this._domain;
    }

    range (...range) {
        if (range.length) {
            const { range: customRange } = this.config();
            this._range = customRange || range[0];
            const domain = this.domain();
            const [startAngle, endAngle] = this._range;
            this._pie
                    .startAngle((startAngle / 180) * Math.PI)
                    .endAngle(Math.PI * endAngle / 180);
            if (domain && domain.length) {
                this._pieData = this._pie(domain);
                this._pieData.forEach((v) => {
                    v.startAngle -= Math.PI / 2;
                    v.endAngle -= Math.PI / 2;
                });
            }

            return this;
        }
        return this._range;
    }
}
