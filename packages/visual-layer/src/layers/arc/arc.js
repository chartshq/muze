import {
    makeElement,
    selectElement,
    getQualifiedClassName,
    isSimpleObject,
    getDomainFromData,
    Symbols
} from 'muze-utils';
import { defaultConfig } from './default-config';
import { BaseLayer } from '../../base-layer';
import * as PROPS from '../../enums/props';
import { ASCENDING, OUTER_RADIUS_VALUE } from '../../enums/constants';
import { getRangeValue, getRadiusRange, tweenPie, getFieldIndices } from './arc-helper';
import './styles.scss';

const pie = Symbols.pie;
const arc = Symbols.arc;

/**
 * Arc Layer creates a plot with polar coordinates
 * Example :-
 * const config = {
 *  height: 100,
 *  width: 100,
 *  startAngle: 0,
 * endAngle: Math.PI,
 * cornerRadius: 10,
 * minOuterRadius: 10,
 * outerRadius: 10,
 * innerRadius: 5,
 * padAngle: 2,
 * padRadius: 2,
 * colors: []
 * padding: {top: 10, bottom: 10, left: 10, right: 10},
 *  encoding = {
 *      angle: {
 *          field: 'date' //Maps to angle of arc
 *      },
 *      radius: {
 *          field: 'sales' // Maps to radius of arc
 *      }
 *  }
 * };
 * @class
 */
export default class ArcLayer extends BaseLayer {

    constructor (data, axes, config, dependencies) {
        super(data, axes, config, dependencies);
        this._prevPieData = {};
    }

    /**
     * returns the default configuration of the layer
     *
     * @static
     * @return {Object} Default configuration for arc layer
     * @memberof ArcLayer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof ArcLayer
     */
    static formalName () {
        return 'arc';
    }

    /**
     *
     *
     * @returns
     * @memberof ArcLayer
     */
    elemType () {
        return 'path';
    }

    /**
     * Transforms data in the appropriate data structure to be consumed by the layer for rendering
     *
     * @param {Object} data data model associated with the layer
     * @param {Object} config configuration of the layer that contains encoding and other parameters
     * @return {Object} Transformed pie data
     * @memberof ArcLayer
     */
    getTransformedData (dataModel, config) {
        let pieData = [];

        const {
            startAngle,
            endAngle,
            encoding,
            sort,
            minOuterRadius
        } = config;
        const prevData = this._store.get(PROPS.TRANSFORMED_DATA) || [];
        const fieldsConfig = this.data().getFieldsConfig();
        const {
            angleIndex,
            sizeIndex,
            radiusIndex,
            colorIndex
        } = getFieldIndices(encoding, fieldsConfig);
        const dataVal = dataModel.getData();
        const data = dataVal.data;
        const uids = dataVal.uids;

        this._prevPieData = {};
        prevData.forEach((e, index) => {
            this._prevPieData[e.uid] = [e, index];
        });
        // Creating pie data using angle field provided. If the angle field is a dimension,
        // all the angles will be equal(360/number of dimensions)
        pieData = pie()
            .startAngle((startAngle / 180) * Math.PI)
            .endAngle(Math.PI * endAngle / 180)
            .value(d => d[angleIndex] || 1);

        sort.length && pieData.sort((a, b) => {
            if (sort === ASCENDING) {
                return a[radiusIndex] - b[radiusIndex];
            } return b[radiusIndex] - a[radiusIndex];
        });

        const sizeVal = data.reduce((acc, d) => acc + (d[sizeIndex] || 0), 1);
        // Adding the radius field values to each data point in pie data
        pieData = pieData(data).map((d, i) => {
            d.outerRadiusValue = data[i][radiusIndex] || minOuterRadius;
            d.colorVal = data[i][colorIndex];
            d.angleVal = data[i][angleIndex];
            d.sizeVal = sizeVal;
            d.uid = uids[i];
            return d;
        });
        return pieData;
    }

    /**
     * Returns normalized data after transformation (it is the same in the case of pie layer)
     *
     * @param {Object} data transformed data
     * @return {Object} normalized data
     * @memberof ArcLayer
     */
    getNormalizedData (data) {
        return data;
    }

    /**
     *
     *
     * @param {Object} data
     * @return {}
     * @memberof ArcLayer
     */
    calculateDomainFromData (data) {
        const domainKey = OUTER_RADIUS_VALUE;
        return {
            radius: getDomainFromData([data], [domainKey, domainKey])
        };
    }

    /**
     *
     *
     * @param {Object} x
     * @param {Object} y
     * @return {}
     * @memberof ArcLayer
     */
    getNearestPoint (x, y, config = {}) {
        const dataPoint = config.data;
        if (isSimpleObject(dataPoint)) {
            const { data, uid } = dataPoint.datum;
            return {
                id: this.getIdentifiersFromData(data, uid),
                layerId: this.id(),
                showInPosition: true
            };
        }
        return null;
    }

    /**
     *
     *
     * @param {*} set
     * @returns
     * @memberof ArcLayer
     */
    getPlotElementsFromSet (set) {
        return selectElement(this.mount()).selectAll(this.elemType()).filter(d => set.indexOf(d.datum.uid) !== -1);
    }

    /**
     *
     *
     * @param {Object} container
     * @return {}
     * @memberof ArcLayer
     */
    render (container) {
        const {
            height,
            width
        } = this.measurement();
        const {
            classPrefix,
            defClassName,
            minOuterRadius,
            innerRadius,
            outerRadius,
            cornerRadius,
            padAngle,
            padRadius,
            padding,
            transition,
            innerRadiusFixer
       } = this.config();
        const sizeAxis = this.axes().size;
        const store = this._store;
        const chartHeight = height - padding.top - padding.bottom;
        const chartWidth = width - padding.left - padding.right;
        const qualClassName = getQualifiedClassName(defClassName, this.id(), classPrefix);
        // Sets range for radius
        const range = getRadiusRange(chartWidth, chartHeight, {
            minOuterRadius,
            innerRadius,
            outerRadius,
            innerRadiusFixer
        });
        const colorAxis = this.axes().color;
        const defaultRadius = outerRadius || Math.min(chartHeight, chartWidth) / 2;
        const radiusDomain = store.get(PROPS.DOMAIN).radius;
        // This returns a function that generates the arc path based on the datum provided
        const path = arc()
                .outerRadius(d => getRangeValue(d, range, radiusDomain, defaultRadius, sizeAxis))
                .innerRadius(innerRadius ? Math.min(chartHeight / 2, chartWidth / 2, innerRadius) : 0)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle)
                .padRadius(padRadius);
        // Creating the group that holds all the arcs
        const g = makeElement(selectElement(container), 'g', [1], `${qualClassName[0]}-group`)
                .classed(`${qualClassName[1]}-group`, true)
                .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);
        const tween = (elem) => {
            makeElement(elem, 'path', (d, i) => [{
                datum: d,
                index: i,
                meta: {
                    originalColor: colorAxis.getRawColor(d.colorVal),
                    stateColor: {},
                    colorTransform: {}
                }
            }], `${qualClassName[0]}-path`)
                            .attr('fill', d => colorAxis.getColor(d.datum.colorVal))
                            .transition()
                            .duration(transition.duration)
                            .attrTween('d', (...params) => tweenPie(path, params, this._prevPieData))
                            .attr('class', d => `${qualClassName[0]}-path ${qualClassName[1]}-path-${d.index}`);
        };
        // Creating groups for all the arcs present individually
        makeElement(g, 'g', store.get(PROPS.TRANSFORMED_DATA), `${qualClassName[0]}`,
            { update: tween }, d => d.uid)
                        .attr('class', (d, i) => `${qualClassName[0]} ${qualClassName[1]}-${i}`)
                        .call(tween);
        return this;
    }
}

