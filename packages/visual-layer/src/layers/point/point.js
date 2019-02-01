import {
    Voronoi,
    selectElement,
    getQualifiedClassName,
    makeElement,
    FieldType,
    Scales
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import drawSymbols from './renderer';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import {
    attachDataToVoronoi,
    getLayerColor,
    positionPoints,
    getPlotMeasurement,
    getIndividualClassName,
    getMarkId
} from '../../helpers';

import './styles.scss';

/**
 * This layer is used to create various symbols for each data point. This is commonly used in
 * scatterplot visualizations. The mark type of this layer is ```point```.
 *
 * @public
 *
 * @class
 * @module PointLayer
 * @extends BaseLayer
 */
export default class PointLayer extends BaseLayer {

    /**
     * Creates an instance of PointLayer.
     * @param {*} args
     * @memberof PointLayer
     */
    constructor (...args) {
        super(...args);
        this._voronoi = new Voronoi();
        this._bandScale = Scales.band();
    }

    /**
     *
     *
     *
     * @memberof PointLayer
     */
    elemType () {
        return 'g';
    }

    /**
     * Returns the default configuration of the point layer
     * @return {Object} Default configuration of the point layer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    static defaultPolicy (conf, userConf) {
        const config = BaseLayer.defaultPolicy(conf, userConf);
        const encoding = config.encoding;
        const transform = config.transform;
        const colorField = encoding.color && encoding.color.field;

        if (colorField) {
            transform.groupBy = colorField;
        }
        return config;
    }

    /**
     *
     *
     * @static
     *
     * @memberof PointLayer
     */
    static formalName () {
        return 'point';
    }

    /**
     *
     *
     * @static
     *
     * @memberof PointLayer
     */
    static drawFn () {
        return drawSymbols;
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
            size: sizeEncoding,
            shape: shapeEncoding,
            color: colorEncoding,
            x,
            y
        } = encoding;
        const sizeField = sizeEncoding.field;
        const sizeValue = sizeEncoding.value;
        const shapeField = shapeEncoding.field;
        const xField = x.field;
        const yField = y.field;
        const { size: sizeAxis, shape: shapeAxis } = axes;
        const fieldsConfig = this.data().getFieldsConfig();
        const isXDim = fieldsConfig[xField] && fieldsConfig[xField].def.type === FieldType.DIMENSION;
        const isYDim = fieldsConfig[yField] && fieldsConfig[yField].def.type === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        const colorField = colorEncoding && colorEncoding.field;
        const colorFieldIndex = fieldsConfig[colorField] && fieldsConfig[colorField].index;
        const measurement = this.measurement();
        const shapeFieldIndex = fieldsConfig[shapeField] && fieldsConfig[shapeField].index;
        const sizeFieldIndex = fieldsConfig[sizeField] && fieldsConfig[sizeField].index;
        const colorAxis = axes.color;
        const { x: offsetX, y: offsetY } = config.offset;

        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const row = d._data;
            const size = sizeValue instanceof Function ? sizeValue(d, i) : sizeAxis.getSize(row[sizeFieldIndex]);
            const shape = shapeAxis.getShape(row[shapeFieldIndex]);

            let [xPx, yPx] = [ENCODING.X, ENCODING.Y].map((type) => {
                const value = d[type] === null ? undefined : d[type];
                const measure = type === ENCODING.X ? measurement.width : measurement.height;
                return !encoding[type].field ? measure / 2 : axes[type].getScaleValue(value);
            });

            xPx += offsetX;
            yPx += offsetY;

            const { color, rawColor } = getLayerColor({ datum: d, index: i },
                { colorEncoding, colorAxis, colorFieldIndex });

            const style = {
                fill: color,
                stroke: color
            };

            if (!isNaN(xPx) && !isNaN(yPx)) {
                const point = {
                    enter: {
                        x: xPx,
                        y: yPx
                    },
                    update: {
                        x: xPx,
                        y: yPx
                    },
                    shape,
                    size: Math.abs(size),
                    meta: {
                        stateColor: {},
                        originalColor: rawColor,
                        colorTransform: {}
                    },
                    style,
                    _data: row,
                    _id: d._id,
                    source: d._data,
                    rowId: d._id
                };
                point.className = getIndividualClassName(d, i, data, this);
                points.push(point);
                this.cachePoint(d[key], point);
            }
        }
        points = positionPoints(this, points);
        return points;
    }

    /**
     * Renders the plot in the given container.
     *
     * @param  {SVGElement} container SVGElement which will hold the plot
     * @return {BarLayer} Instance of bar layer
     */
    render (container) {
        let maxSize = 0;
        let seriesClassName;
        const config = this.config();
        const keys = this._transformedData.map(d => d.key);
        const { transition, className, defClassName, classPrefix } = config;
        const normalizedData = this._normalizedData;
        const containerSelection = selectElement(container);
        const qualifiedClassName = getQualifiedClassName(defClassName, this.id(), classPrefix);
        this._points = [];
        this._pointMap = {};

        containerSelection.classed(qualifiedClassName.join(' '), true).classed(className, true);

        this._points = this.generateDataPoints(normalizedData, keys);
        const schema = this.data().getSchema();
        makeElement(container, 'g', this._points, null, {
            update: (group, points) => {
                maxSize = Math.max(maxSize, ...points.map(d => d.size));
                seriesClassName = `${qualifiedClassName[0]}`;
                this.constructor.drawFn()({
                    layer: this,
                    container: group.node(),
                    points,
                    className: seriesClassName,
                    transition,
                    keyFn: v => getMarkId(v.source, schema)
                });
            }
        }, data => data[0]._id);
        this._maxSize = Math.sqrt(maxSize / Math.PI) * 2;
        attachDataToVoronoi(this._voronoi, this._points);
        return this;
    }

    generateDataPoints (normalizedData, keys) {
        const encoding = this.config().encoding;
        const axes = this.axes();
        const [widthMetrics, heightMetrics] = getPlotMeasurement(this, keys);
        const offsetXValues = widthMetrics.offsetValues || [];
        const offsetYValues = heightMetrics.offsetValues || [];
        return normalizedData.map((dataArr, i) => {
            const measurementConf = this.getMeasurementConfig(offsetXValues[i], offsetYValues[i], widthMetrics.span,
                heightMetrics.span);
            return this.translatePoints(dataArr, encoding, axes, measurementConf);
        }).filter(d => d.length);
    }

    getMeasurementConfig (offsetX, offsetY, widthSpan, heightSpan) {
        return {
            offset: {
                x: (offsetX || 0) + widthSpan / 2,
                y: (offsetY || 0) + heightSpan / 2
            },
            span: {
                x: widthSpan,
                y: heightSpan
            }
        };
    }

    /**
     * Gets the nearest point from a position.
     * @param {number} x x position
     * @param {number} y y position
     * @return {Object} Point details
     */
    getNearestPoint (x, y) {
        const distanceLimit = Math.max(this._maxSize, this.config().nearestPointThreshold);

        if (!this.data()) {
            return null;
        }

        const point = this._voronoi.find(x, y, distanceLimit);
        const dimensions = point && point.data.data.update;
        const radius = point ? Math.sqrt(point.data.data.size / Math.PI) : 0;

        if (point) {
            const { _data, _id } = point.data.data;
            const identifiers = this.getIdentifiersFromData(_data, _id);
            return {
                id: identifiers,
                dimensions: [{
                    x: dimensions.x,
                    y: dimensions.y,
                    width: radius,
                    height: radius
                }],
                layerId: this.id()
            };
        }
        return null;
    }
}
