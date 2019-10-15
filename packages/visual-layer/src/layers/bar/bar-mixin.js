import {
    getQualifiedClassName,
    selectElement,
    createElements,
    clipElement,
    FieldType,
    Scales,
    getObjProp,
    isSimpleObject,
    makeElement,
    appendElement
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import { drawRects } from './renderer';
import { defaultConfig } from './default-config';
import { getPlotMeasurement, getValidTransformForAggFn } from '../../helpers';
import './styles.scss';
import { getTranslatedPoints, strokeWidthPositionMap, interactionStyleMap } from './bar-helper';

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

        createElements({
            data: this._points,
            container,
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
    getNearestPoint (x, y, { event }) {
        if (!this.data()) {
            return null;
        }
        return this.getDataFromEvent(event);
    }

    getDataFromEvent (event) {
        const dataPoint = selectElement(event.target).data()[0];
        if (isSimpleObject(dataPoint)) {
            const values = dataPoint && dataPoint.source;
            let identifiers = null;
            if (values) {
                identifiers = this.getIdentifiersFromData(values, dataPoint.rowId);
            }
            return {
                dimensions: [dataPoint.update],
                id: identifiers,
                layerId: this.id()
            };
        }
        return null;
    }

    getPlotSpan () {
        return this._plotSpan;
    }

    hasPlotSpan () {
        return true;
    }

    getInteractionStyles (styleType) {
        return interactionStyleMap[styleType];
    }

    addOverlayPath (container, refElement, data, style) {
        let pathElement;

        if (this._overlayPath[data.rowId]) {
            pathElement = this._overlayPath[data.rowId];
        } else {
            pathElement = makeElement(container, 'path', [data.update], null, {}, d => `${d.x} ${data.rowId}`);
            pathElement.style('fill', 'none');
            pathElement.attr('id', data.rowId);
            this._overlayPath[data.rowId] = pathElement;
        }

        if (style.type === 'stroke-width') {
            const { L1, L2, L3, M } = strokeWidthPositionMap({
                width: style.props.value,
                position: style.props.position
            });

            pathElement.attr('d', d => `M ${d.x + M.x} ${d.y + M.y}
            L ${d.x + d.width + L1.x} ${d.y + L1.y}
            L ${d.x + d.width + L2.x} ${d.y + d.height + L2.y}
            L${d.x + L3.x} ${d.y + d.height + L3.y} Z`);
        }

        pathElement.style(style.type, style.props.value);
        appendElement(container, pathElement.node());
    }

    removeOverlayPath (data, style) {
        const currentPath = this._overlayPath[data.rowId];
        Object.keys(style).forEach(s => currentPath.style(s, style[s]));
    }
};

