/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { getUniqueId, generateGetterSetters, rgbToHsv, defaultValue, colorInterpolator } from 'muze-utils';
import { createScale, getScheme, getSchemeType } from '../scale-creator';
import { CONTINOUS, DISCRETE, COLOR } from '../enums/constants';
import { strategyGetter } from './color-strategy';
import { DEFAULT_CONFIG } from './defaults';
import { PROPS, getHslString, getActualHslColor } from './props';

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
        return COLOR;
    }

    /**
     *
     *
     * @param {*} colorStrategy
     *
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
     *
     * @memberof ColorAxis
     */
    setColorStrategy (domainType, rangeType, schemeType) {
        return strategyGetter(domainType, rangeType, schemeType);
    }

    /**
     *
     *
     * @param {*} domainVal
     *
     * @memberof ColorAxis
     */
    getHslString (hslColorArray) {
        return getHslString(hslColorArray);
    }
    /**
     *
     *
     * @param {*} domainVal
     *
     * @memberof ColorAxis
     */
    getColor (domainVal) {
        return this.getHslString(this.getRawColor(domainVal));
    }

    /**
     *
     *
     * @param {*} domainVal
     *
     * @memberof ColorAxis
     */
    getRawColor (domainVal) {
        const domain = this.domain();

        if (this.domain() && domainVal !== undefined) {
            const scale = this.scale();
            const range = scale.range ? scale.range() : null;
            let color;

            if (domain.length > range.length) {
                console.log(range);
                debugger;
                // color = colorInterpolator()(this.getColor(range[10], this.getColor(range[1])))(0.5);
                // color = colorInterpolator()(range[10], range[1])(0.5);
                color = this._colorStrategy.value(range)(domainVal, scale, this.domain(), this.uniqueValues());
            } else {
                color = this._colorStrategy.value(range)(domainVal, scale, this.domain(), this.uniqueValues());
            }

            if (color && typeof color === 'string') {
                const col = color.substring(color.indexOf('(') + 1, color.lastIndexOf(')')).split(/,\s*/);
                return rgbToHsv(...col);
            }
            return [...color];
        }
        return [...this.config().value];
    }

    /**
     *
     *
     * @param {*} [domain=[]]
     *
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
        const h = color[0] * 360;
        const s = color[1] * 100;
        const l = color[2] * 100;
        const a = Math.min(defaultValue(color[3], 0), 1);
        const newH = h + transformationArr[0];
        const newS = s + transformationArr[1];
        const newL = l + transformationArr[2];
        const newA = Math.min(a + transformationArr[3] || 0, 1);

        return { color: `hsla(${newH},${newS}%,${newL}%,${newA})`, hsla: [newH / 360, newS / 100, newL / 100, newA] };
    }

    /**
     * Returns the id of the axis.
     * @return {string} Unique identifier of the axis.
     */
    id () {
        return this._id;
    }

    getHslArray (color) {
        return getActualHslColor(color);
    }

}
