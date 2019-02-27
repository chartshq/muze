import { FieldType, getObjProp } from 'muze-utils';
import { PointLayer } from '../point';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import drawTicks from './renderer';
import './styles.scss';
import { getAxesScales, getLayerColor, positionPoints, getIndividualClassName } from '../../helpers';

const pointTranslators = {
    polar: (data, encoding, config = {}, layerInst) => {
        const axes = layerInst.axes();
        let points = [];
        const { radius: radiusAxis, angle: angleAxis, angle0: angle0Axis } = axes;
        const dm = layerInst.data();
        const fieldsConfig = dm.getFieldsConfig();
        const colorEncoding = encoding.color;
        const colorField = colorEncoding && colorEncoding.field;
        const colorFieldIndex = fieldsConfig[colorField] && fieldsConfig[colorField].index;
        const measurement = layerInst.measurement();
        const radius0Field = getObjProp(encoding, 'radius0', 'field');
        const angle0Field = getObjProp(encoding, 'angle0', 'field');
        const angle0Index = getObjProp(fieldsConfig, angle0Field, 'index');
        const radius0Index = getObjProp(fieldsConfig, radius0Field, 'index');
        const colorAxis = axes.color;
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];

            const style = {};
            const meta = {};
            const { color, rawColor } = getLayerColor({ _data: d._data, index: i },
                { colorEncoding, colorAxis, colorFieldIndex });

            style.stroke = color;
            meta.stateColor = {};
            meta.originalColor = rawColor;
            meta.colorTransform = {};
            const { startAngle, endAngle } = angleAxis.getScaleValue(d.angle);
            const angle = startAngle - (Math.PI / 2);
            let angle0 = angle;
            if (angle0Index !== undefined) {
                const { startAngle: startAngle0, endAngle: endAngle0 } = angle0Axis.getScaleValue(d.angle0);
                angle0 = angle0Index ? (startAngle0 + endAngle0) / 2 - (Math.PI / 2) : angle;
            }
            const r = radiusAxis.getScaleValue(d.radius);
            const point = {
                enter: {},
                update: {
                    radius: r,
                    radius0: radius0Index !== undefined ? radiusAxis.getScaleValue(d.radius0) : r,
                    angle,
                    angle0
                },
                style,
                source: d._data,
                rowId: d.uid,
                meta
            };
            point.className = getIndividualClassName({ _data: d }, i, data, layerInst);
            points.push(point);
        }
        points = positionPoints(layerInst, points);

        for (let i = 0, len = points.length; i < len; i++) {
            const point = points[i];
            const { angle, radius, radius0, angle0 } = point.update;
            point.update.x = (radius * Math.cos(angle)) + (measurement.width / 2);
            point.update.y = (radius * Math.sin(angle)) + (measurement.height / 2);
            point.update.y0 = (radius0 * Math.sin(angle0)) + (measurement.height / 2);
            point.update.x0 = (radius0 * Math.cos(angle0)) + (measurement.width / 2);
        }
        return points;
    },
    cartesian: (data, encoding, config = {}, layerInst) => {
        const axes = layerInst.axes();
        let points = [];
        const {
                xAxis,
                yAxis
            } = getAxesScales(axes);
        const fieldsConfig = layerInst.data().getFieldsConfig();
        const {
                xField,
                yField,
                x0Field,
                y0Field,
                xFieldType,
                yFieldType
            } = layerInst.encodingFieldsInf();
        const isXDim = xFieldType === FieldType.DIMENSION;
        const isYDim = yFieldType === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        const colorEncoding = encoding.color;
        const colorField = colorEncoding && colorEncoding.field;
        const colorFieldIndex = fieldsConfig[colorField] && fieldsConfig[colorField].index;
        const measurement = layerInst.measurement();
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
                point.className = getIndividualClassName(d, i, data, layerInst);
                points.push(point);
                layerInst.cachePoint(d[key], point);
            }
        }
        points = positionPoints(layerInst, points);
        return points;
    }
};

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
        return pointTranslators[this.coord()](data, encoding, config, this);
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
