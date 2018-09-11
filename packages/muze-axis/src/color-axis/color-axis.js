/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, generateGetterSetters, rgbToHsv } from 'muze-utils';
import { createScale, getScheme, getSchemeType } from '../scale-creator';
import { CONTINOUS, DISCRETE, COLOR } from '../enums/constants';
import { strategyGetter } from './color-strategy';
import { DEFAULT_CONFIG } from './defaults';
import { PROPS, getHslString } from './props';

/**
* This class is used to instantiate a SimpleAxis.
* @class SimpleAxis
*/
export default class ColorAxis {

    /**
    * Creates an instance of SimpleAxis.
    * @param {Object} config input parameters.
    * @param {Object | undefined} params.range Type of color range.
    * @param {string} params.name the label to show on axis.
    * @param {string} params.type The type of scale to handle.
    * @memberof ColorAxis
    */
    constructor (config) {
        generateGetterSetters(this, PROPS);
        this.config(config);

        this._domainType = this._config.type === 'linear' ? CONTINOUS : DISCRETE;
        this._rangeType = (this._config.type === 'linear' && !this._config.step) ? CONTINOUS : DISCRETE;

        this._schemeType = getSchemeType(this._config.range);

        this._colorStrategy = this.setColorStrategy(this._domainType, this._rangeType, this._schemeType);
        this._scale = this.createScale(this._colorStrategy);

        this._id = getUniqueId();

        this.updateDomain(config.domain);
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
        return COLOR;
    }

    /**
     *
     *
     * @param {*} colorStrategy
     * @returns
     * @memberof ColorAxis
     */
    createScale (colorStrategy) {
        const { range } = this.config();
        if (range && typeof (range) === 'string') {
            return getScheme(range);
        }
        return createScale({
            type: colorStrategy.scale,
            range
        });
    }

    /**
     *
     *
     * @param {*} domainType
     * @param {*} rangeType
     * @param {*} schemeType
     * @returns
     * @memberof ColorAxis
     */
    setColorStrategy (domainType, rangeType, schemeType) {
        const { stops } = this.config();

        return strategyGetter(domainType, rangeType, schemeType, stops);
    }

    /**
     *
     *
     * @param {*} domainVal
     * @returns
     * @memberof ColorAxis
     */
    getHslString (hslColorArray) {
        return getHslString(hslColorArray);
    }
    /**
     *
     *
     * @param {*} domainVal
     * @returns
     * @memberof ColorAxis
     */
    getColor (domainVal) {
        return this.getHslString(this.getRawColor(domainVal));
    }
    /**
     *
     *
     * @param {*} domainVal
     * @returns
     * @memberof ColorAxis
     */
    getRawColor (domainVal) {
        if (this.domain() && domainVal !== undefined) {
            const scale = this.scale();
            const range = scale.range ? scale.range() : null;
            const color = this._colorStrategy.value(range)(domainVal, scale, this.domain(), this.uniqueValues());

            if (typeof color === 'string') {
                const rgbArr = color.substring(4, color.length - 1)
                            .replace(/ /g, '')
                            .split(',');
                return rgbToHsv(...rgbArr);
            }
            return [...color];
        }
        return [...this.config().value];
    }

    /**
     *
     *
     * @param {*} [domain=[]]
     * @returns
     * @memberof ColorAxis
     */
    updateDomain (domain = []) {
        if (domain.length) {
            const scale = this.scale();
            const range = scale.range ? scale.range() : null;
            const domainRangeFn = this._colorStrategy.domainRange();
            const scaleInfo = domainRangeFn(domain, this.config().stops, range);

            this.domain(scaleInfo.domain);
            scaleInfo.range && this.scale().range(scaleInfo.range);
            this.uniqueValues(scaleInfo.uniqueVals);
            this.scale().domain(scaleInfo.scaleDomain || this.domain());
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
            config: this.config()
        };
    }

    transformColor (color, transformationArr) {
        let h = color[0] * 360;
        let s = color[1] * 100;
        let l = color[2] * 100;
        let a = color[3] || 1;
        const newH = h + transformationArr[0];
        const newS = s + transformationArr[1];
        const newL = l + transformationArr[2];
        const newA = a + transformationArr[3] || 0;
        h = newH > 360 ? newH - 360 : (newH < 0 ? newH + 360 : newH);
        s = newS > 100 ? newS - 100 : (newS < 0 ? newS + 100 : newS);
        l = newL > 100 ? newL - 100 : (newL < 0 ? newL + 100 : newL);
        a = newA > 1 ? newA - 1 : (newA < 0 ? newA + 1 : newA);

        return { color: `hsla(${h},${s}%,${l}%,${a})`, hsla: [h / 360, s / 100, l / 100, a] };
    }

    /**
     * Returns the id of the axis.
     * @return {string} Unique identifier of the axis.
     */
    id () {
        return this._id;
    }

}
