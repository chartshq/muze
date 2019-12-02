import { FieldType, makeElement, appendElement } from 'muze-utils';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import drawTicks from './renderer';
import './styles.scss';
import { positionPoints, getIndividualClassName,
    getColorMetaInf, resolveEncodingValues, toCartesianCoordinates, attachDataToVoronoi } from '../../helpers';
import { strokeWidthPositionMap } from './helper';

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
            const style = {
                stroke: resolvedVal.color
            };

            const point = {
                enter: {},
                update: {
                    radius: resolvedVal.radius,
                    radius0: resolvedVal.radius0,
                    angle: resolvedVal.angle,
                    angle0: resolvedVal.angle0
                },
                style,
                source: d.source,
                rowId: d.rowId,
                data: d,
                meta: { ...{ layerId: layerInst.id() }, ...getColorMetaInf(style) }
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
        const { x: xAxis, y: yAxis } = axes;
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
            const style = {
                stroke: resolvedEncodings.color
            };

            if (!isNaN(xPx) && !isNaN(yPx)) {
                const point = {
                    enter: {},
                    update: {
                        x: resolvedEncodings.x,
                        y: resolvedEncodings.y,
                        x0: resolvedEncodings.x0,
                        y0: resolvedEncodings.y0
                    },
                    style,
                    source: row,
                    rowId: d.rowId,
                    data: d.dataObj,
                    meta: { ...{ layerId: layerInst.id() }, ...getColorMetaInf(style) }
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
export const TickLayerMixin = superclass => class extends superclass {
    static defaultConfig () {
        return defaultConfig;
    }

    static formalName () {
        return 'tick';
    }

    static drawFn () {
        return drawTicks;
    }

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

    attachDataToVoronoi (points) {
        attachDataToVoronoi(this._voronoi, points, (d) => {
            const { x, x0, y, y0 } = d.update;

            return {
                x: x + (x0 - x) / 2,
                y: y + (y0 - y) / 2
            };
        });
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

    addOverlayPath (refElement, data, style, strokePosition) {
        let pathElement;

        if (this._overlayPath[data.rowId]) {
            pathElement = this._overlayPath[data.rowId];
        } else {
            pathElement = makeElement(refElement, 'path', [data.update], null, {}, d => `${d.x} ${data.rowId}`);
            pathElement.style('fill', 'none');
            pathElement.style('fill-opacity', 0);
            pathElement.attr('id', data.rowId);
            this._overlayPath[data.rowId] = pathElement;
        }

        let offsetM = { x: 0, y: 0 };
        let offsetL = { x: 0, y: 0 };

        if (style.type === 'stroke-width') {
            const { L, M } = strokeWidthPositionMap({
                width: parseInt(style.value, 10),
                position: strokePosition
            });
            offsetM = M;
            offsetL = L;
        }

        pathElement.attr('d', (d) => {
            if (d.update) {
                return `M ${d.update.x + offsetM.x} ${d.update.y + offsetM.y}
                    L ${d.update.x0 + offsetL.x} ${d.update.y0 + offsetL.y}`;
            }
            return `M ${d.x + offsetM.x} ${d.y + offsetM.y}
                L ${d.x0 + offsetL.x} ${d.y0 + offsetL.y}`;
        });

        let styleVal = style.value;
        if (typeof styleVal === 'function') {
            const currentStyle = pathElement.style(style.type);
            styleVal = styleVal(currentStyle);
        }
        pathElement.style(style.type, styleVal);
        appendElement(refElement, pathElement.node());
    }

    removeOverlayPath (data, style) {
        const currentPath = this._overlayPath[data.rowId];
        if (currentPath) {
            currentPath.node().removeAttribute('style');
            Object.keys(style).forEach(s => currentPath.style(s, style[s]));
            currentPath.style('fill-opacity', 0);
        }
    }
};
