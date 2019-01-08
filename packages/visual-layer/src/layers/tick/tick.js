import { FieldType } from 'muze-utils';
import { PointLayer } from '../point';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import drawTicks from './renderer';
import './styles.scss';
import { getAxesScales, getLayerColor, positionPoints, getIndividualClassName } from '../../helpers';

/**
 * This layer is used to create small lines. The orientation of the line is determined by the positional
 * encoding properties x0 and y0. The mark type of the layer is ```tick```.
 *
 * @public
 *
 * @class
 * @module TickLayer
 * @extends BaseLayer
 */
export default class TickLayer extends PointLayer {

    /**
     *
     *
     * @staticg
     *
     * @memberof TickLayer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    /**
     *
     *
     * @static
     *
     * @memberof TickLayer
     */
    static formalName () {
        return 'tick';
    }

    /**
     *
     *
     * @static
     *
     * @memberof TickLayer
     */
    static drawFn () {
        return drawTicks;
    }

    /**
     *
     *
     *
     * @memberof TickLayer
     */
    elemType () {
        return 'path';
    }

    /**
     * Generates an array of objects containing x, y, width and height of the points from the data
     * @param  {Array.<Array>} data Data Array
     * @param  {Object} encoding  Config
     * @param  {Object} axes     Axes object
     * @return {Array.<Object>}  Array of points
     */
    translatePoints (data, encoding, axes, config = {}) {
        let points = [];
        const {
                xAxis,
                yAxis
            } = getAxesScales(axes);
        const fieldsConfig = this.data().getFieldsConfig();
        const {
                xField,
                yField,
                x0Field,
                y0Field,
                xFieldType,
                yFieldType
            } = this.encodingFieldsInf();
        const isXDim = xFieldType === FieldType.DIMENSION;
        const isYDim = yFieldType === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        const colorEncoding = encoding.color;
        const colorField = colorEncoding && colorEncoding.field;
        const colorFieldIndex = fieldsConfig[colorField] && fieldsConfig[colorField].index;
        const measurement = this.measurement();
        const colorAxis = axes.color;
        const { x: offsetX, y: offsetY } = config.offset;
        const { x: xSpan, y: ySpan } = config.span;
        for (let i = 0, len = data.length; i < len; i++) {
            let xPx;
            let x0Px;
            let y0Px;
            let yPx;
            const d = data[i];
            const row = d._data;
            if (xField) {
                xPx = xAxis.getScaleValue(d.x) + offsetX;
                x0Px = xPx + xSpan;
            }

            if (yField) {
                yPx = yAxis.getScaleValue(d.y) + offsetY;
                y0Px = yPx !== null ? yPx + ySpan : null;
            }

            if (!xField) {
                xPx = 0;
                x0Px = measurement.width;
                if (!isNaN(yPx)) {
                    yPx += ySpan / 2;
                    y0Px = yPx;
                }
            }

            if (!yField) {
                yPx = 0;
                y0Px = measurement.height;
                x0Px = xPx += xSpan / 2;
            }

            if (x0Field) {
                x0Px = xAxis.getScaleValue(d.x0) + xSpan;
                yPx += ySpan / 2;
                y0Px -= ySpan / 2;
            }

            if (y0Field) {
                y0Px = yAxis.getScaleValue(d.y0) + ySpan;
                xPx += xSpan / 2;
                x0Px -= xSpan / 2;
            }
            const style = {};
            const meta = {};
            const { color, rawColor } = getLayerColor({ datum: d, index: i },
                { colorEncoding, colorAxis, colorFieldIndex });

            style.stroke = color;
            meta.stateColor = {};
            meta.originalColor = rawColor;
            meta.colorTransform = {};
            if (!isNaN(xPx) && !isNaN(yPx)) {
                const point = {
                    enter: {},
                    update: {
                        x: xPx,
                        y: yPx,
                        x0: x0Px,
                        y0: y0Px
                    },
                    style,
                    _data: row,
                    _id: d._id,
                    source: row,
                    rowId: d._id,
                    meta
                };
                point.className = getIndividualClassName(d, i, data, this);
                points.push(point);
                this.cachePoint(d[key], point);
            }
        }
        points = positionPoints(this, points);
        return points;
    }

    getMeasurementConfig (offsetX, offsetY, widthSpan, heightSpan) {
        return {
            offset: {
                x: (offsetX || 0),
                y: (offsetY || 0)
            },
            span: {
                x: widthSpan,
                y: heightSpan
            }
        };
    }
}
