import {
    Voronoi,
    getQualifiedClassName,
    selectElement,
    makeElement,
    FieldType,
    InvalidAwareTypes,
    getObjProp
} from 'muze-utils';
import { drawLine } from './renderer';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import {
    attachDataToVoronoi,
    animateGroup,
    positionPoints,
    getIndividualClassName,
    getColorMetaInf,
    resolveEncodingValues,
    sortData,
    getBoundBoxes
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
export const LineLayerMixin = superclass => class extends superclass {
    /**
     * Creates an instance of LineLayer.
     *
     * @param {*} args
     * @memberof LineLayer
     */
    constructor (...args) {
        super(...args);
        this._voronoi = new Voronoi();
    }

    static formalName () {
        return 'line';
    }

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

    static defaultPolicy (conf, userConf) {
        const config = super.defaultPolicy(conf, userConf);
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
    translatePoints (data) {
        let points = [];
        const axes = this.axes();
        const encoding = this.config().encoding;
        const xAxis = axes.x;
        const yAxis = axes.y;
        const colorAxis = axes.color;
        const { xFieldType, yFieldType } = this.encodingFieldsInf();
        const isXDim = xFieldType === FieldType.DIMENSION;
        const isYDim = yFieldType === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        sortData(data, axes);
        points = data.map((d, i) => {
            const xPx = xAxis.getScaleValue(d.x) + xAxis.getUnitWidth() / 2;
            const yPx = yAxis.getScaleValue(d.y) + yAxis.getUnitWidth() / 2;
            const color = colorAxis.getColor(d.color);

            const resolvedEncodings = resolveEncodingValues({
                values: {
                    x: xPx,
                    y: yPx,
                    color
                },
                data: d
            }, i, data, this);

            const style = {
                stroke: resolvedEncodings.color,
                'fill-opacity': encoding.fillOpacity.value,
                'stroke-width': encoding.strokeWidth.value
            };

            const point = {
                enter: {},
                update: {
                    x: d.x instanceof InvalidAwareTypes ? null : resolvedEncodings.x,
                    y: d.y instanceof InvalidAwareTypes ? null : resolvedEncodings.y
                },
                style,
                rowId: d.rowId,
                source: d.source,
                data: d.dataObj,
                meta: getColorMetaInf(style)
            };
            point.className = getIndividualClassName(d, i, data, this);
            this.cachePoint(d[key], point);
            return point;
        });
        points = positionPoints(this, points);

        points = points.filter((point) => {
            const { update } = point;
            return !isNaN(update.x) && !isNaN(update.y);
        });
        return points;
    }

    getTranslatedData (normalizedData, colorValFn, colorFieldIndex, axes) {
        return normalizedData.map((data, i) => {
            let color;
            const colorVal = data.find(d => d.source[colorFieldIndex] !== null &&
                    d.source[colorFieldIndex] !== undefined);

            if (colorValFn) {
                color = colorValFn(data, i, normalizedData);
            } else {
                color = axes.color.getColor(colorVal && colorVal.source[colorFieldIndex]);
            }

            return {
                data: this.translatePoints(data),
                style: this.getPathStyle(color)
            };
        });
    }

    /**
     * Renders the line plot
     * @param {SVGElement} container svg element
     * @return {LineLayer} instance of line layer
     */
    render (container) {
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
        containerSelection.attr('class', `${qualifiedClassName.join(' ')} ${className}`);

        const colorValFn = encoding.color.value;
        const translatedPoints = this.getTranslatedData(normalizedData, colorValFn, colorFieldIndex, axes);

        makeElement(container, 'g', translatedPoints, null, {
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
                const points = dataArr.data;
                const seriesClassName = `${qualifiedClassName[0]}-${keys[i] || i}`.toLowerCase();
                const style = dataArr.style;

                this._points.push(points);
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
        }, d => d.data[0].source[colorFieldIndex] || d.data[0].rowId);

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
            const { source, rowId } = point.data.data;
            const identifiers = this.getIdentifiersFromData(source, rowId);
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

    applyStyles ({ strokeStyles, otherStyles, styleObj, elem }) {
        [...otherStyles, ...strokeStyles].forEach((type) => {
            elem.style(type, styleObj[type]);
        });
    }

    getBoundBoxes () {
        return getBoundBoxes(this._points.flat());
    }
};
