import { FieldType } from 'muze-utils';
import { PointLayer } from '../point';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import drawTicks from './renderer';
import './styles.scss';
import { getAxesScales, positionPoints, getIndividualClassName,
    getColorMetaInf, resolveEncodingValues, toCartesianCoordinates } from '../../helpers';

const pointTranslators = {
    polar: (data, config = {}, layerInst) => {
        const axes = layerInst.axes();
        let points = [];
        const { radius: radiusAxis, angle: angleAxis, angle0: angle0Axis } = axes;
        const measurement = layerInst.measurement();

        const colorAxis = axes.color;
        const angleV = {};
        const angle0V = {};
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const color = colorAxis.getColor(d.color);
            const angles = angleAxis.getScaleValue(d.angle);
            !angleV[d.angle] && (angleV[d.angle] = 0);
            const { startAngle, endAngle } = angles[angleV[d.angle]++];
            const angles0 = angle0Axis.getScaleValue(d.angle0);
            !angle0V[d.angle0] && (angle0V[d.angle0] = 0);
            const { startAngle: startAngle0, endAngle: endAngle0 } = angles0[angle0V[d.angle0]++];
            const radius = radiusAxis.getOuterRadius(d.radius);
            const angle = (startAngle + endAngle) / 2;
            const angle0 = (startAngle0 + endAngle0) / 2;
            const resolvedVal = resolveEncodingValues({
                values: {
                    radius,
                    radius0: radiusAxis.getInnerRadius(d.radius0),
                    color,
                    angle,
                    angle0,
                    startAngle,
                    endAngle,
                    startAngle0,
                    endAngle0
                },
                data: d
            }, i, data, layerInst);
            const point = {
                enter: {},
                update: {
                    radius: resolvedVal.radius,
                    radius0: resolvedVal.radius0,
                    angle: resolvedVal.angle,
                    angle0: resolvedVal.angle0
                },
                style: {
                    stroke: resolvedVal.color
                },
                source: d.source,
                rowId: d.rowId,
                meta: getColorMetaInf(resolvedVal.color, colorAxis)
            };
            point.className = getIndividualClassName(d, i, data, layerInst);
            points.push(point);
        }
        points = toCartesianCoordinates(positionPoints(layerInst, points), measurement, true);
        return points;
    },
    cartesian: (data, config = {}, layerInst) => {
        const axes = layerInst.axes();
        let points = [];
        const {
                xAxis,
                yAxis
            } = getAxesScales(axes);
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
            const row = d.source;
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
            const color = colorAxis.getColor(d.color);
            const resolvedEncodings = resolveEncodingValues({
                values: {
                    x: xPx,
                    y: yPx,
                    x0: x0Px,
                    y0: y0Px,
                    color
                },
                data: d
            }, i, data, layerInst);

            if (!isNaN(xPx) && !isNaN(yPx)) {
                const point = {
                    enter: {},
                    update: {
                        x: resolvedEncodings.x,
                        y: resolvedEncodings.y,
                        x0: resolvedEncodings.x0,
                        y0: resolvedEncodings.y0
                    },
                    style: {
                        stroke: resolvedEncodings.color
                    },
                    source: row,
                    rowId: d.rowId,
                    meta: getColorMetaInf(resolvedEncodings.color, colorAxis)
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
        return defaultConfig();
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
    translatePoints (data, config) {
        return pointTranslators[this.coord()](data, config, this);
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
