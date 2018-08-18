import { FieldType } from 'muze-utils';
import { defaultConfig } from './default-config';
import { LineLayer } from '../line';
import drawArea from './renderer';
import './styles.scss';
import { STACK, ENCODING } from '../../enums/constants';
import { getAxesScales, positionPoints, getLayerColor } from '../../helpers';

/**
 * Area Layer creates a area plot.
 * @example
 * const config = {
 *  encoding = {
 *      x: {
 *          field: 'date'
 *      },
 *      // Top y value
 *      y: {
 *          field: 'maxTemp'
 *      },
 *      // Base y value
 *      y0: {
 *          field: 'minTemp
 *      }
 *  }
 * };
 * const areaLayer = layerFactory.getLayer('area', [dataModel, axes, config]);
 * areaLayer.render(container);
 * @class
 */
export default class AreaLayer extends LineLayer {
    /** oation of line layer
     * @return {Object} Default configuration of layer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof AreaLayer
     */
    static formalName () {
        return 'area';
    }

    /**
     * Calculates the domain from data. It calls its parent class's method which is line layer
     * to get the domain and overwrites the domain according to its need.
     * @return {Array} Domain values
     */
    calculateDomainFromData (data, encodingFieldsInf, fieldsConfig) {
        const domains = super.calculateDomainFromData(data, fieldsConfig);
        [ENCODING.X, ENCODING.Y].forEach((type) => {
            const { [`${type}FieldType`]: fieldType } = encodingFieldsInf;
            if (fieldType === FieldType.MEASURE) {
                domains[type][0] = Math.min(domains[type][0], 0);
            }
        });
        return domains;
    }

    /**
     * Returns the drawing method of this layer
     * @return {Function} Draw method
     */
    getDrawFn () {
        return drawArea;
    }

    /**
     * Generates the x and y positions for each point
     * @param {Array} data Data Array
     * @param {Object} encoding Visual Encodings of the layer
     * @param {Object} axes Contains the axis
     * @return {Array} Array of points
     */
    translatePoints (data, encodingFieldsInf, axes) {
        let points = [];
        const transformType = this.transformType();
        const colorAxis = axes.color;
        const encoding = this.config().encoding;
        const colorEncoding = encoding.color;
        const colorField = colorEncoding.field;
        const fieldsConfig = this.data().getFieldsConfig();
        const colorFieldIndex = colorField && fieldsConfig[colorField].index;
        const { xField, yField, y0Field } = encodingFieldsInf;
        const {
            xAxis,
            yAxis
       } = getAxesScales(axes);

        const isXDim = fieldsConfig[xField] && fieldsConfig[xField].def.type === FieldType.DIMENSION;
        const isYDim = fieldsConfig[yField] && fieldsConfig[yField].def.type === FieldType.DIMENSION;
        const key = isXDim ? 'x' : (isYDim ? 'y' : null);
        points = data.map((d, i) => {
            const xPx = xAxis.getScaleValue(d.x) + xAxis.getUnitWidth() / 2;
            const yPx = yAxis.getScaleValue(d.y);
            const y0Px = (y0Field || transformType === STACK) ? yAxis.getScaleValue(d.y0) : yAxis.getScaleValue(0);
            const { color, rawColor } = getLayerColor({ datum: d, index: i }, {
                colorEncoding, colorAxis, colorFieldIndex });
            const style = {};
            const meta = {};
            style.fill = color;
            // style['fill-opacity'] = 0;
            meta.stateColor = {};
            meta.originalColor = rawColor;
            meta.colorTransform = {};
            const point = {
                enter: {
                    x: xPx,
                    y: d.y === null ? d.y : yAxis.getScaleValue(0),
                    y0: d.y0 === null ? d.y0 : yAxis.getScaleValue(0)
                },
                update: {
                    x: xPx,
                    y: d.y === null ? d.y : yPx,
                    y0: d.y0 === null ? d.y0 : y0Px
                },
                _id: d._id,
                _data: d._data,
                style,
                meta
            };
            this.cachePoint(d[key], point);
            return point;
        });
        points = positionPoints(this, points);
        return points;
    }

    /**
     * Get the css styles need to be applied on the line path
     * @param {string} color Color value
     * @return {Object} Path styles
     */
    getPathStyle (color) {
        return {
            fill: color
        };
    }
}

