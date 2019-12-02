import { FieldType, InvalidAwareTypes, getObjProp } from 'muze-utils';
import { defaultConfig } from './default-config';
import drawArea from './renderer';
import './styles.scss';
import { STACK, ENCODING } from '../../enums/constants';
import {
    positionPoints,
    getIndividualClassName,
    getValidTransformForAggFn,
    getColorMetaInf,
    resolveEncodingValues,
    sortData
} from '../../helpers';

/**
 * Area layer renders a closed path. The mark type of this layer is ```area```. This layer can be used
 * to create stacked or multi-series areas and vertical range area plots by using the encoding properties.
 *
 * To create this layer using layer configuration from canvas,
 * ```
 *      canvas.layers([{
 *          mark: 'area',
 *          transform: {
 *              type: 'stack' // Produces a stacked area.
 *          }
 *      }]);
 * ```
 *
 * @public
 *
 * @class
 * @module AreaLayer
 * @extends LineLayer
 */
export const AreaLayerMixin = superclass => class extends superclass {

    /** Default configuration of area layer
     *
     * @return {Object} Default configuration of layer
    */
    static defaultConfig () {
        return defaultConfig;
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
            if (fieldType === FieldType.MEASURE && getObjProp(domains[type], 'length')) {
                domains[type][0] = Math.min(domains[type][0], 0);
                domains[type][1] = Math.max(0, domains[type][1]);
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

    getNearestPoint (x, y, config) {
        let searchRadius = config.searchRadius;
        const data = this.data();

        if (!data || (data && data.isEmpty())) {
            return null;
        }

        searchRadius = searchRadius !== undefined ? searchRadius : this.config().nearestPointThreshold;
        let point = this._voronoi.find(x, y, searchRadius);
        let index;
        let nearestPoint = null;

        if (!point && config.dimValue && this._pointMap) {
            const pointArr = this._pointMap[config.dimValue[1][0]] || [];

            for (let i = 0, len = pointArr.length; i < len; i++) {
                const { y: pointY, y0: pointY0 } = pointArr[i].update;
                if (pointY < y && y < pointY0) {
                    index = i;
                    nearestPoint = pointArr[i];
                    break;
                }
            }

            // Index is a number(0 or more)
            if (index !== undefined) {
                point = {
                    index,
                    data: {
                        x,
                        y,
                        data: nearestPoint
                    }
                };
            }
        }

        const dimensions = getObjProp(point, 'data', 'data', 'update');

        if (point) {
            const { source, rowId } = point.data.data;
            const identifiers = this.getIdentifiersFromData(source, rowId);
            return {
                id: identifiers,
                dimensions: [{
                    x: dimensions.x,
                    y0: dimensions.y0,
                    y: dimensions.y,
                    width: 2,
                    height: 2
                }],
                layerId: this.id()
            };
        }
        return null;
    }

    /**
     * Generates the x and y positions for each point
     * @param {Array} data Data Array
     * @param {Object} encoding Visual Encodings of the layer
     * @param {Object} axes Contains the axis
     * @return {Array} Array of points
     */
    translatePoints (data) {
        let points = [];
        const transformType = this.transformType();
        const axes = this.axes();
        const colorAxis = axes.color;
        const config = this.config();
        const encoding = config.encoding;
        const fieldsConfig = this.data().getFieldsConfig();
        const { xField, yField, y0Field } = this.encodingFieldsInf();
        const { x: xAxis, y: yAxis } = axes;
        const classNameFn = config.individualClassName;
        const isXDim = fieldsConfig[xField] && fieldsConfig[xField].def.type === FieldType.DIMENSION;
        const isYDim = fieldsConfig[yField] && fieldsConfig[yField].def.type === FieldType.DIMENSION;
        const key = isXDim ? 'x' : (isYDim ? 'y' : null);
        const minYVal = yAxis.domain()[0];
        const basePos = minYVal < 0 ? yAxis.getScaleValue(0) : yAxis.getScaleValue(minYVal);
        sortData(data, axes);
        points = data.map((d, i) => {
            let color;
            const xPx = xAxis.getScaleValue(d.x) + xAxis.getUnitWidth() / 2;
            const yPx = yAxis.getScaleValue(d.y);
            const y0Px = (y0Field || transformType === STACK) ? yAxis.getScaleValue(d.y0) : basePos;
            color = colorAxis.getColor(d.color);
            const invalidY = d.y instanceof InvalidAwareTypes;
            const invalidY0 = d.y0 instanceof InvalidAwareTypes;
            const resolvedValues = resolveEncodingValues({
                values: {
                    x: xPx,
                    y: yPx,
                    y0: y0Px,
                    color
                },
                data: d
            }, i, data, this);
            color = resolvedValues.color;
            const style = {
                fill: color,
                'fill-opacity': encoding.fillOpacity.value
            };

            const point = {
                enter: {
                    x: xPx,
                    y: invalidY ? null : basePos,
                    y0: invalidY0 ? null : basePos
                },
                update: {
                    x: xPx,
                    y: invalidY ? null : resolvedValues.y,
                    y0: invalidY0 ? null : resolvedValues.y0
                },
                source: d.source,
                rowId: d.rowId,
                data: d.dataObj,
                className: classNameFn ? classNameFn(d, i, data, this) : '',
                style,
                meta: getColorMetaInf(style)
            };
            point.className = getIndividualClassName(d, i, data, this);
            this.cachePoint(d[key], point);
            return point;
        });
        points = positionPoints(this, points);
        points = points.filter((point) => {
            const update = point.update;
            return !isNaN(update.x);
        });
        return points;
    }

    resolveTransformType () {
        this._transformType = getValidTransformForAggFn(this);
    }

    /**
     * Get the css styles need to be applied on the line path
     * @param {string} color Color value
     * @return {Object} Path styles
     */
    getPathStyle (color) {
        return {
            fill: color,
            'fill-opacity': 0.30
        };
    }
};
