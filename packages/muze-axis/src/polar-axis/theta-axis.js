/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, Symbols } from 'muze-utils';
import { createScale } from '../scale-creator';
import { DEFAULT_ANGLE_DOMAIN } from '../enums/constants';

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
        this._config = Object.assign({}, this.constructor.defaultConfig(), config);
        this._range = [0, 360];
        this._pie = pie()
                .value(d => (typeof d === 'string' ? 1 : d))
                .sortValues(null);
    }

    static defaultConfig () {
        return {};
    }

    config () {
        return this._config;
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
            this._range = range[0];
            const [startAngle, endAngle] = this._range;
            this._pie
                    .startAngle((startAngle / 180) * Math.PI)
                    .endAngle(Math.PI * endAngle / 180);
            this._pieData = this._pie(this._domain);
            this._pieData.forEach((v) => {
                v.startAngle -= Math.PI / 2;
                v.endAngle -= Math.PI / 2;
            });
            return this;
        }
        return this._range;
    }
}
