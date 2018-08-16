import {
    Voronoi,
    selectElement,
    getQualifiedClassName,
    makeElement,
    FieldType
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import drawSymbols from './renderer';
import { defaultConfig } from './default-config';
import { ENCODING } from '../../enums/constants';
import * as PROPS from '../../enums/props';
import { attachDataToVoronoi, getLayerColor, positionPoints } from '../../helpers';

import './styles.scss';

/**
 * Point Layer creates point. Itt needs to be passed a data table, axes and configuration
 * of the layer.
 * Example :-
 * const pointLayer = layerFactory.getLayer('point', [data, axes, config]);
 * pointLayer.render(container);
 * @class
 */
export default class PointLayer extends BaseLayer {

    /**
     *Creates an instance of PointLayer.
     * @param {*} args
     * @memberof PointLayer
     */
    constructor (...args) {
        super(...args);
        this._voronoi = new Voronoi();
    }

    /**
     *
     *
     * @returns
     * @memberof PointLayer
     */
    elemType () {
        return 'g';
    }

    /**
     * Returns the default configuration of the point layer
     * @return {Object} Default configuration of the point layer
     */
    static defaultConfig() {
        return defaultConfig;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof PointLayer
     */
    static formalName () {
        return 'point';
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof PointLayer
     */
    static drawFn() {
        return drawSymbols;
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
            size: sizeEncoding,
            shape: shapeEncoding,
            color: colorEncoding,
            x,
            y
        } = encoding;
        const sizeField = sizeEncoding.field;
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
        const measurement = this._store.get(PROPS.MEASUREMENT);
        const shapeFieldIndex = fieldsConfig[shapeField] && fieldsConfig[shapeField].index;
        const sizeFieldIndex = fieldsConfig[sizeField] && fieldsConfig[sizeField].index;
        const colorAxis = axes.color;


        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const row = d._data;
            const size = sizeAxis.getSize(row[sizeFieldIndex]);
            const shape = shapeAxis.getShape(row[shapeFieldIndex]);

            const [xPx, yPx] = [ENCODING.X, ENCODING.Y].map((type) => {
                let bandwidth = axes[type].getUnitWidth() / 2,
                    value = d[type] === null ? undefined : d[type],
                    measure = type === ENCODING.X ? measurement.width : measurement.height;
                return !encoding[type].field ? measure / 2 : axes[type].getScaleValue(value) + bandwidth;
            });

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
                        stateColor: rawColor,
                        originalColor: rawColor,
                        colorTransform: {}
                    },
                    style,
                    _data: row,
                    _id: d._id
                };
                points.push(point);
                this.cachePoint(d[key], point);
            }
        }
        points = positionPoints(this, points);
        return points;
    }

    /**
     * Renders the plot in the given container
     * @param  {SVGElement} container SVGElement which will hold the plot
     * @return {BarLayer} Instance of bar layer
     */
    render (container) {
        let points;
        let maxSize = 0;
        let seriesClassName;
        const config = this.config();
        const { transition, encoding, className, defClassName, classPrefix } = config;
        const axes = this.axes();
        const normalizedData = this._store.get(PROPS.NORMALIZED_DATA);
        const containerSelection = selectElement(container);
        const qualifiedClassName = getQualifiedClassName(defClassName, this.id(), classPrefix);
        this._points = [];
        this._pointMap = {};

        containerSelection.classed(qualifiedClassName.join(' '), true).classed(className, true);
        makeElement(container, 'g', normalizedData, null, {
            update: (group, dataArr, i) => {
                points = this.translatePoints(dataArr, encoding, axes, i);
                this._points.push(points);
                maxSize = Math.max(maxSize, ...points.map(d => d.size));
                seriesClassName = `${qualifiedClassName[0]}`;
                this.constructor.drawFn()({
                    container: group.node(),
                    points,
                    className: seriesClassName,
                    transition,
                    keyFn: d => d._id
                });
            }
        });
        this._maxSize = Math.sqrt(maxSize / Math.PI) * 2;
        attachDataToVoronoi(this._voronoi, this._points);
        return this;
    }

    /**
     * Gets the nearest point from a position.
     * @param {number} x x position
     * @param {number} y y position
     * @return {Object} Point details
     */
    getNearestPoint (x, y) {
        let point;
        let dimensions;
        let radius;
        const distanceLimit = this._maxSize;

        if (!this.data()) {
            return null;
        }

        point = this._voronoi.find(x, y, distanceLimit);
        dimensions = point && point.data.data.update;
        radius = point ? Math.sqrt(point.data.data.size / Math.PI) : 0;

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
