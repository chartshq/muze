import {
    getClosestIndexOf,
    getQualifiedClassName,
    selectElement,
    createElements,
    clipElement,
    DimensionSubtype,
    FieldType,
    MeasureSubtype,
    Scales
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import { drawRects } from './renderer';
import { defaultConfig } from './default-config';
import { getPlotMeasurement } from '../../helpers';
import './styles.scss';
import { getTranslatedPoints } from './bar-helper';

const MEASURE = FieldType.MEASURE;
const scaleBand = Scales.band;

/**
 * Bar layer creates rectangle marks. The mark type of this layer is ```bar```. This layer can be used
 * to create stacked or grouped bars, range bars, heatmap plots and also reference bands by using
 * the encoding properties.
 *
 * @public
 *
 * @class
 * @module BarLayer
 * @extends BaseLayer
 */
export default class BarLayer extends BaseLayer {
    /**
     * Creates an instance of bar layer
     */
    constructor (...params) {
        super(...params);
        this._bandScale = scaleBand();
        this._plotPadding = {
            x: 0,
            y: 0
        };
        this._plotSpan = {
            x: 0,
            y: 0
        };
        this._pointMap = {};
    }

    /**
     *
     *
     *
     * @memberof BarLayer
     */
    elemType () {
        return 'rect';
    }

    /**
     *
     *
     * @static
     *
     * @memberof BarLayer
     */
    static formalName () {
        return 'bar';
    }

    /**
     * Returns the default configuration of the bar layer
     * @return {Object} Default configuration of the bar layer
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
     * @memberof BarLayer
     */
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

    /**
     *
     *
     * @param {*} data
     * @param {*} fieldsConfig
     *
     * @memberof BarLayer
     */
    calculateDomainFromData (data, encodingFieldInf, fieldsConfig) {
        const domain = super.calculateDomainFromData(data, encodingFieldInf, fieldsConfig);
        ['x', 'y'].forEach((d) => {
            if (encodingFieldInf[`${d}FieldType`] === MEASURE && domain[d]) {
                encodingFieldInf[`${d}0Field}`] ? domain[d] = domain[d].sort((a, b) => a - b) :
                    (domain[d][0] = Math.min(domain[d][0], 0));
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
                    keyFn: d => dimensions.map(key => d._data[key]).join('-')
                });
            }
        });
        return this;
    }

    /**
     *
     *
     * @param {*} normalizedData
     * @param {*} keys
     *
     * @memberof BarLayer
     */
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
        let axis;
        let value;
        let index;
        let points;
        let uniqueFieldType;
        let uniqueFieldIndex;
        let filterData;
        let identifiers;
        let pointFound = null;
        const dataModel = this.data();
        const dataObj = dataModel.getData();
        const fieldsConfig = dataModel.getFieldsConfig();
        const axes = this.axes();
        const data = dataObj.data;
        const pointMap = this._pointMap;
        const {
                xField,
                yField,
                xFieldSubType,
                yFieldSubType
            } = this.encodingFieldsInf();

        if (xFieldSubType === MeasureSubtype.CONTINUOUS) {
            axis = axes.y;
            value = axis.invert(y);
            uniqueFieldIndex = fieldsConfig[yField].index;
            uniqueFieldType = yFieldSubType;
        } else {
            axis = axes.x;
            value = axis.invert(x);
            uniqueFieldIndex = fieldsConfig[xField].index;
            uniqueFieldType = xFieldSubType;
        }

        if (uniqueFieldType === DimensionSubtype.CATEGORICAL) {
            points = pointMap[value];
        }

        if (uniqueFieldType === DimensionSubtype.TEMPORAL) {
            filterData = [...new Set(data.map(d => d[uniqueFieldIndex]))];
            index = getClosestIndexOf(filterData, value);
            value = filterData[index];
            points = pointMap[value];
        }
        const len = points && points.length;
        points && points.sort((p1, p2) => p1.update.y - p2.update.y);
        for (let i = 0; i < len; i++) {
            const point = points[i];
            const update = point.update;
            if (x >= update.x && x <= (update.width + update.x) && y >= update.y && y <= (update.height + update.y)) {
                pointFound = point;
                break;
            }
            pointFound = null;
        }

        const values = pointFound && pointFound._data;
        if (values) {
            identifiers = this.getIdentifiersFromData(values, pointFound._id);
        }
        return pointFound ? {
            dimensions: [pointFound.update],
            id: identifiers,
            layerId: this.id()
        } : pointFound;
    }

    getPlotSpan () {
        return this._plotSpan;
    }
}
