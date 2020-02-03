import {
    getQualifiedClassName,
    selectElement,
    createElements,
    clipElement,
    FieldType,
    Scales,
    getObjProp,
    makeElement,
    appendElement,
    RTree
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import { drawRects } from './renderer';
import { defaultConfig } from './default-config';
import { getPlotMeasurement, getValidTransformForAggFn, getDataFromEvent } from '../../helpers';
import './styles.scss';
import { getTranslatedPoints, strokeWidthPositionMap } from './bar-helper';

const { MEASURE } = FieldType;

export const BarLayerMixin = superclass => class extends superclass {
    /**
     * Creates an instance of bar layer
     */
    constructor (...params) {
        super(...params);
        this._bandScale = Scales.band();
        this._plotPadding = {
            x: 0,
            y: 0
        };
        this._plotSpan = {
            x: 0,
            y: 0
        };
        this._pointMap = {};
        this._overlayPath = {};
        this._rtree = new RTree();
    }

    elemType () {
        return 'rect';
    }

    /**
     * Returns the default configuration of the bar layer
     * @return {Object} Default configuration of the bar layer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    static defaultPolicy (conf, userConf) {
        const config = BaseLayer.defaultPolicy(conf, userConf);
        const encoding = config.encoding;
        const colorField = encoding.color.field;
        const transform = config.transform;

        if (colorField) {
            transform.groupBy = colorField;
        }
        return config;
    }

    calculateDomainFromData (data, encodingFieldInf, fieldsConfig) {
        const domain = super.calculateDomainFromData(data, encodingFieldInf, fieldsConfig);
        ['x', 'y'].forEach((d) => {
            if (encodingFieldInf[`${d}FieldType`] === MEASURE && getObjProp(domain[d], 'length')) {
                if (encodingFieldInf[`${d}0Field`]) {
                    domain[d] = domain[d].sort((a, b) => a - b);
                } else {
                    domain[d][0] = Math.min(domain[d][0], 0);
                    domain[d][1] = Math.max(0, domain[d][1]);
                }
            }
        });
        return domain;
    }

    /**
     * Generates an array of objects containing x, y, width and height of the bars from the data
     * @param  {Array.<Array>} data Data Array
     * @param  {Object} encoding  Config
     * @param  {Object} axes     Axes object
     * @param {Object} conf config object for point generation
     * @return {Array.<Object>}  Array of points
     */
    translatePoints (data, sizeConfig) {
        return getTranslatedPoints(this, data, sizeConfig);
    }

    /**
     * Renders the plot in the given container
     * @param  {SVGGroup} container SVGGroup where plot will be rendered.
     * @return {BarLayer} Instance of bar layer.
     */
    render (container) {
        const config = this.config();
        const transition = config.transition;
        const normalizedDataArr = this._normalizedData;
        const transformedData = this._transformedData;
        const keys = transformedData.map(d => d.key);
        const fieldsConfig = this.data().getFieldsConfig();
        const axes = this.axes();
        const height = axes.y && axes.y.scale().range()[0];
        const width = axes.x && axes.x.scale().range()[1];
        const defClassName = config.defClassName;
        const qualifiedClassName = getQualifiedClassName(defClassName, this.id(), config.classPrefix);
        const className = config.className;
        const containerSelection = selectElement(container);
        const dimensions = Object.values(fieldsConfig).filter(e => e.def.type === FieldType.DIMENSION)
            .map(e => e.index);
        containerSelection.classed(qualifiedClassName.join(' '), true);
        containerSelection.classed(className, true);
        clipElement(container, {
            x: 0,
            y: 0,
            width,
            height
        }, `id-${this.id()}`);

        this._points = this.generateDataPoints(normalizedDataArr, keys);
        this._graphicElems = {};
        const paths = Object.keys(this._overlayPath);
        paths.forEach(path => this._overlayPath[path].remove());
        this._overlayPath = {};

        const barContainer = makeElement(containerSelection, 'g', [1], 'muze-layer-bars', {}, null);
        makeElement(containerSelection, 'g', [1], 'muze-overlay-paths', {}, null);
        createElements({
            data: this._points,
            container: barContainer.node(),
            selector: 'g',
            append: 'g',
            each: (points, group, i) => {
                const seriesClassName = `${qualifiedClassName[0]}-${keys[i] || i}`.toLowerCase();
                group.style('display', 'block');
                drawRects({
                    layer: this,
                    container: group.node(),
                    points,
                    className: seriesClassName,
                    transition,
                    style: {},
                    keyFn: d => dimensions.map(key => d.source[key]).join('-')
                });
            }
        });
        const elements = this.getBoundBoxes().flat().filter(d => d !== null);
        this._rtree = new RTree();
        this._rtree.load(elements);
        return this;
    }

    generateDataPoints (normalizedData, keys) {
        const [barWidthMetrics, barHeightMetrics] = getPlotMeasurement(this, keys);
        const barWidthOffsets = barWidthMetrics.offsetValues || [];
        const barHeightOffsets = barHeightMetrics.offsetValues || [];
        this._plotSpan = {
            x: barWidthMetrics.groupSpan || 0,
            y: barHeightMetrics.groupSpan || 0
        };
        this._plotPadding = {
            x: barWidthMetrics.padding || 0,
            y: barHeightMetrics.padding || 0
        };

        this._pointMap = {};
        return normalizedData.map((data, i) => this.translatePoints(data,
            {
                barWidth: barWidthMetrics.span,
                barWidthOffset: barWidthOffsets[i] || 0,
                barHeight: barHeightMetrics.span,
                barHeightOffset: barHeightOffsets[i] || 0
            }));
    }

    getPlotPadding () {
        return this._plotPadding;
    }

    resolveTransformType () {
        this._transformType = getValidTransformForAggFn(this);
    }

    /**
     * Gets the nearest point of the position passed.
     * @param {number} x x position
     * @param {number} y y position
     * @return {Object} Nearest point.
     */
    getNearestPoint (x, y) {
        if (!this.data()) {
            return null;
        }
        const data = this._rtree.search({
            minX: Math.max(x - 1, 0),
            minY: Math.max(y - 1, 0),
            maxX: x + 1,
            maxY: y + 1
        });

        if (data.length) {
            return this.getDataFromEvent(null, data[0].point);
        }
        return null;
    }

    getDataFromEvent (event, data) {
        return getDataFromEvent(this, event, data);
    }

    getPlotSpan () {
        return this._plotSpan;
    }

    hasPlotSpan () {
        return true;
    }

    addOverlayPath (refElement, data, style, strokePosition, mountPoint) {
        let pathElement;

        if (this._overlayPath[data.rowId]) {
            pathElement = this._overlayPath[data.rowId];
        } else {
            const pathGroup = makeElement(mountPoint, 'g', [1], null, {}, d => `${d.x} ${data.rowId}`);
            pathElement = makeElement(pathGroup, 'path', [data], null, {}, d => `${d.update.x} ${data.rowId}`);

            pathElement.style('fill', 'none');
            pathElement.style('fill-opacity', 0);
            pathElement.attr('id', data.rowId);
            this._overlayPath[data.rowId] = pathElement;
        }

        if (style.type === 'stroke-width') {
            const { L1, L2, L3, M } = strokeWidthPositionMap({
                width: parseInt(style.value, 10),
                position: strokePosition
            });

            pathElement.attr('d', d => `M ${d.update.x + M.x} ${d.update.y + M.y}
            L ${d.update.x + d.update.width + L1.x} ${d.update.y + L1.y}
            L ${d.update.x + d.update.width + L2.x} ${d.update.y + d.update.height + L2.y}
            L${d.update.x + L3.x} ${d.update.y + d.update.height + L3.y} Z`);
        }

        let styleVal = style.value;
        if (typeof styleVal === 'function') {
            const currentStyle = pathElement.style(style.type);
            styleVal = styleVal(currentStyle);
        }
        pathElement.style(style.type, styleVal);
        appendElement(mountPoint, pathElement.node());
    }

    removeOverlayPath (data, style) {
        const currentPath = this._overlayPath[data.rowId];
        if (currentPath) {
            currentPath.node().removeAttribute('style');
            Object.keys(style).forEach(s => currentPath.style(s, style[s]));
            currentPath.style('fill-opacity', 0);

            // Apply the path shape get the correct path position
            currentPath.attr('d', d => `M ${d.update.x} ${d.update.y}
            L ${d.update.x + d.update.width} ${d.update.y}
            L ${d.update.x + d.update.width} ${d.update.y + d.update.height}
            L${d.update.x} ${d.update.y + d.update.height} Z`);
        }
    }

    getBoundBoxes () {
        const points = this._points.flat();

        return points.map((point) => {
            const { x, y, width, height } = point.update;
            const data = point.data;
            return {
                minX: x,
                maxX: x + width,
                minY: y,
                maxY: y + height,
                data,
                point
            };
        });
    }
};

