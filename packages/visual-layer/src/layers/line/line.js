import {
    Voronoi,
    getQualifiedClassName,
    selectElement,
    makeElement,
    FieldType,
    getObjProp
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import { drawLine } from './renderer';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import {
    attachDataToVoronoi,
    animateGroup,
    getLayerColor,
    positionPoints,
    getIndividualClassName
} from '../../helpers';

import './styles.scss';

/**
 * This layer is used to render straight or smoothed line paths. The mark type of this layer is ```line```.
 *
 * @public
 *
 * @class
 * @module LineLayer
 * @extends BaseLayer
 */
export default class LineLayer extends BaseLayer {

    /**
     * Creates an instance of LineLayer.
     * @param {*} args
     * @memberof LineLayer
     */
    constructor (...args) {
        super(...args);
        this._voronoi = new Voronoi();
    }

    /**
     *
     *
     * @static
     *
     * @memberof LineLayer
     */
    static formalName () {
        return 'line';
    }

    /**
     *
     *
     *
     * @memberof LineLayer
     */
    elemType () {
        return 'path';
    }

    /**
     * Default configuration of line layer
     * @return {Object} Default configuration of layer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    /**
     *
     *
     * @static
     * @param {*} conf
     * @param {*} userConf
     *
     * @memberof LineLayer
     */
    static defaultPolicy (conf, userConf) {
        const config = BaseLayer.defaultPolicy(conf, userConf);
        const encoding = config.encoding;
        const transform = config.transform;
        const colorField = encoding.color && encoding.color.field;

        if (colorField && !transform.groupBy) {
            transform.groupBy = colorField;
        }
        return config;
    }

    /**
     * Returns the draw method for line
     * @return {Function} Draw method of line layer
     */
    getDrawFn () {
        return drawLine;
    }

    static shouldDrawAnchors () {
        return true;
    }

    /**
     * Generates the x and y positions for each point
     * @param {Array} data Data Array
     * @param {Object} encoding Visual Encodings of the layer
     * @param {Object} axes Contains the axis
     * @param {number} seriesIndex index of series
     * @return {Array} Array of points
     */
    translatePoints (data, encodingFieldsInf, axes) {
        let points = [];
        const xAxis = axes.x;
        const yAxis = axes.y;
        const colorAxis = axes.color;
        const encoding = this.config().encoding;
        const { xFieldType, yFieldType } = encodingFieldsInf;
        const isXDim = xFieldType === FieldType.DIMENSION;
        const isYDim = yFieldType === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        const colorEncoding = encoding.color;
        const colorField = colorEncoding.field;
        const fieldsConfig = this.data().getFieldsConfig();
        const colorFieldIndex = colorField && fieldsConfig[colorField].index;
        const style = {};
        const meta = {};

        points = data.map((d, i) => {
            const xPx = xAxis.getScaleValue(d.x) + xAxis.getUnitWidth() / 2;
            const yPx = yAxis.getScaleValue(d.y);
            const { color, rawColor } = getLayerColor({ datum: d, index: i }, {
                colorEncoding, colorAxis, colorFieldIndex });

            style.stroke = color;
            style['fill-opacity'] = 0;
            meta.stateColor = {};
            meta.originalColor = rawColor;
            meta.colorTransform = {};

            const point = {
                enter: {},
                update: {
                    x: xPx,
                    y: d.y === null ? null : yPx
                },
                style,
                _data: d._data,
                _id: d._id,
                rowId: d._id,
                source: d._data,
                meta
            };
            point.className = getIndividualClassName(d, i, data, this);
            this.cachePoint(d[key], point);
            return point;
        });
        points = positionPoints(this, points);
        return points;
    }

    /**
     * Renders the line plot
     * @param {SVGElement} container svg element
     * @return {LineLayer} instance of line layer
     */
    render (container) {
        let points;
        let seriesClassName;
        let style;

        const config = this.config();
        const {
            encoding,
            interpolate,
            className,
            defClassName,
            transition
        } = config;
        const normalizedData = this._normalizedData;
        const transformedData = this._transformedData;
        const fieldsConfig = this.data().getFieldsConfig();
        const axes = this.axes();
        const keys = transformedData.map(d => d.key);
        const qualifiedClassName = getQualifiedClassName(defClassName, this.id(), config.classPrefix);
        const containerSelection = selectElement(container);
        const colorField = encoding.color.field;
        const colorFieldIndex = fieldsConfig[colorField] && fieldsConfig[colorField].index;

        this._points = [];
        this._pointMap = {};
        containerSelection.classed(qualifiedClassName.join(' '), true);
        containerSelection.classed(className, true);
        makeElement(container, 'g', normalizedData, null, {
            enter: (group) => {
                animateGroup(group, {
                    transition,
                    groupAnimateStyle: {
                        enter: {
                            'stroke-opacity': 0,
                            'fill-opacity': this.getPathStyle()['fill-opacity']
                        },
                        update: {
                            'stroke-opacity': encoding.strokeOpacity.value
                        }
                    }
                });
            },
            update: (group, dataArr, i) => {
                points = this.translatePoints(dataArr, this.encodingFieldsInf(), axes, i);
                this._points.push(points);
                seriesClassName = `${qualifiedClassName[0]}-${keys[i] || i}`.toLowerCase();

                let color;
                const colorValFn = encoding.color.value;
                const colorVal = points.find(d => d._data[colorFieldIndex] !== null &&
                        d._data[colorFieldIndex] !== undefined);

                if (colorValFn) {
                    color = colorValFn(dataArr, i, normalizedData);
                } else {
                    color = axes.color.getColor(colorVal && colorVal._data[colorFieldIndex]);
                }

                style = this.getPathStyle(color);
                this.getDrawFn()({
                    layer: this,
                    container: group.node(),
                    interpolate,
                    points,
                    className: seriesClassName,
                    transition,
                    style: style || {},
                    connectNullData: config.connectNullData
                });
            }
        }, d => d[0]._data[colorFieldIndex] || d[0]._id);

        attachDataToVoronoi(this._voronoi, this._points);
        return this;
    }

    /**
     * Get the css styles need to be applied on the line path
     * @param {string} color Color value
     * @return {Object} Path styles
     */
    getPathStyle (color) {
        return {
            stroke: color,
            'fill-opacity': '0'
        };
    }

    /**
     * Gets the nearest point closest to the given position
     * @param {number} x x position
     * @param {number} y y position
     * @return {Object} Nearest point information
     */
    getNearestPoint (x, y, config) {
        let searchRadius = config.searchRadius;
        const data = this.data();

        if (!data || (data && data.isEmpty())) {
            return null;
        }

        searchRadius = searchRadius !== undefined ? searchRadius : this.config().nearestPointThreshold;
        const point = this._voronoi.find(x, y, searchRadius);
        const dimensions = getObjProp(point, 'data', 'data', 'update');

        if (point) {
            const { _data, _id } = point.data.data;
            const identifiers = this.getIdentifiersFromData(_data, _id);
            return {
                id: identifiers,
                dimensions: [{
                    x: dimensions.x,
                    y: dimensions.y,
                    width: 2,
                    height: 2
                }],
                layerId: this.id()
            };
        }
        return null;
    }
}
