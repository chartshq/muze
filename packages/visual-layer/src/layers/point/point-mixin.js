import {
    Voronoi,
    Scales,
    makeElement,
    getQualifiedClassName,
    selectElement
} from 'muze-utils';
import drawSymbols from './renderer';
import { defaultConfig } from './default-config';
import {
    attachDataToVoronoi,
    getPlotMeasurement,
    getMarkId
} from '../../helpers';

import './styles.scss';
import { pointTranslators } from './helper';

export const PointLayerMixin = superclass => class extends superclass {
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
        const config = super.defaultPolicy(conf, userConf);
        const encoding = config.encoding;
        const transform = config.transform;
        const colorField = encoding.color && encoding.color.field;

        if (colorField) {
            transform.groupBy = colorField;
        }
        return config;
    }

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
    translatePoints (data, config = {}) {
        return pointTranslators[this.coord()](data, config, this);
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
        this._graphicElems = {};

        const schema = this.data().getSchema();
        makeElement(container, 'g', this._points, null, {
            update: (group, points) => {
                maxSize = Math.max(maxSize, ...points.map(d => d.size));
                seriesClassName = `${qualifiedClassName[0]}`;
                this.constructor.drawFn()({
                    layer: this,
                    container: group.node(),
                    points,
                    interpolate: config.interpolate,
                    className: seriesClassName,
                    transition,
                    keyFn: v => getMarkId(v.source, schema)
                });
            }
        }, data => data[0].rowId);
        this._maxSize = Math.sqrt(maxSize / Math.PI) * 2;
        attachDataToVoronoi(this._voronoi, this._points);
        return this;
    }

    generateDataPoints (normalizedData, keys) {
        const [widthMetrics, heightMetrics] = getPlotMeasurement(this, keys);
        const offsetXValues = widthMetrics.offsetValues || [];
        const offsetYValues = heightMetrics.offsetValues || [];
        return normalizedData.map((dataArr, i) => {
            const measurementConf = this.getMeasurementConfig(offsetXValues[i], offsetYValues[i], widthMetrics.span,
                    heightMetrics.span);
            return this.translatePoints(dataArr, measurementConf);
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
            const { source, rowId } = point.data.data;
            const identifiers = this.getIdentifiersFromData(source, rowId);
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

    };
