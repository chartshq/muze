import { FieldType } from 'muze-utils';
import { PointLayer } from '../point';
import { defaultConfig } from './default-config';
import * as PROPS from '../../enums/props';
import { ENCODING } from '../../enums/constants';
import drawTicks from './renderer';
import './styles.scss';
import { getAxesScales, getLayerColor, positionPoints } from '../../helpers';

export default class TickLayer extends PointLayer {

    /**
     *
     *
     * @static
     * @returns
     * @memberof TickLayer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof TickLayer
     */
    static formalName () {
        return 'tick';
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof TickLayer
     */
    static drawFn () {
        return drawTicks;
    }

    /**
     *
     *
     * @returns
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
    translatePoints (data, encoding, axes) {
        let points = [];
        const {
                xAxis,
                yAxis,
            } = getAxesScales(axes);
        const fieldsConfig = this.data().getFieldsConfig();
        const individualClassName = this.config().individualClassName;
        const {
                xField,
                yField,
                x0Field,
                y0Field,
                xFieldType,
                yFieldType,
            } = this.encodingFieldsInf();
        const isXDim = xFieldType === FieldType.DIMENSION;
        const isYDim = yFieldType === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        const colorEncoding = encoding.color;
        const colorField = colorEncoding && colorEncoding.field;
        const colorFieldIndex = fieldsConfig[colorField] && fieldsConfig[colorField].index;
        const measurement = this._store.get(PROPS.MEASUREMENT);
        const colorAxis = axes.color;
        const xbandwidth = xAxis ? xAxis.getUnitWidth() : 0;
        const ybandwidth = yAxis ? yAxis.getUnitWidth() : 0;

        for (let i = 0, len = data.length; i < len; i++) {
            let xPx;
            let x0Px;
            let y0Px;
            let yPx;
            const d = data[i];
            const row = d._data;
            if (xField) {
                xPx = xAxis.getScaleValue(d.x);
                x0Px = xPx + xbandwidth;
            }

            if (yField) {
                yPx = yAxis.getScaleValue(d.y);
                y0Px = yPx !== null ? yPx + ybandwidth : null;
            }

            if (!xField) {
                xPx = 0;
                x0Px = measurement.width;
                if (!isNaN(yPx)) {
                    yPx += ybandwidth / 2;
                    y0Px = yPx;
                }
            }

            if (!yField) {
                yPx = 0;
                y0Px = measurement.height;
                x0Px = xPx += xbandwidth / 2;
            }

            if (x0Field) {
                x0Px = xAxis.getScaleValue(d.x0) + xbandwidth;
                yPx += ybandwidth / 2;
                y0Px -= ybandwidth / 2;
            }

            if (y0Field) {
                y0Px = yAxis.getScaleValue(d.y0) + ybandwidth;
                xPx += xbandwidth / 2;
                x0Px -= xbandwidth / 2;
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
                    meta
                };
                if (individualClassName instanceof Function) {
                    point.className = individualClassName(d, i);
                }

                points.push(point);
                this.cachePoint(d[key], point);
            }
        }
        points = positionPoints(this, points);
        return points;
    }
}
