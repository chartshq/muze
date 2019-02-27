import {
    makeElement,
    selectElement,
    getQualifiedClassName,
    isSimpleObject,
    Symbols,
    FieldType,
    ReservedFields,
    getDomainFromData
} from 'muze-utils';
import { defaultConfig } from './default-config';
import { BaseLayer } from '../../base-layer';
import { ASCENDING, ENCODING } from '../../enums/constants';
import { getIndividualClassName } from '../../helpers';
import { getRangeValue, tweenPie, tweenExitPie, getFieldIndices, getPreviousPoint } from './arc-helper';
import './styles.scss';

const arc = Symbols.arc;

/**
 * Arc Layer creates a plot with polar coordinates.
 *
 * @public
 *
 * @class
 * @module ArcLayer
 * @extends BaseLayer
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
     *
     * @memberof ArcLayer
     */
    static formalName () {
        return 'arc';
    }

    /**
     *
     *
     *
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
    // getTransformedData (dataModel, config) {
    //     // let pieData = [];
    //     // const pieIndex = {};
    //     // const {
    //     //     startAngle,
    //     //     endAngle,
    //     //     encoding,
    //     //     sort,
    //     //     minOuterRadius
    //     // } = config;
    //     // const prevData = this._transformedData || [];
    //     // const fieldsConfig = this.data().getFieldsConfig();
    //     // const {
    //     //     angleIndex,
    //     //     sizeIndex,
    //     //     radiusIndex,
    //     //     colorIndex
    //     // } = getFieldIndices(encoding, fieldsConfig);
    //     // const dataVal = dataModel.getData();
    //     // const data = dataVal.data;
    //     // const uids = dataVal.uids;

    //     // this._prevPieData = {};

    //     // prevData.forEach((e, index) => {
    //     //     this._prevPieData[e.uid] = [e, index];
    //     //     pieIndex[e.index] = e;
    //     // });
    //     // // Creating pie data using angle field provided. If the angle field is a dimension,
    //     // // all the angles will be equal(360/number of dimensions)

    //     // pieData = pie()
    //     //     .startAngle((startAngle / 180) * Math.PI)
    //     //     .endAngle(Math.PI * endAngle / 180)
    //     //     .value(d => d[angleIndex] || 1)
    //     //     .sortValues(null);

    //     // sort.length && radiusIndex && pieData.sort((a, b) => {
    //     //     if (sort === ASCENDING) {
    //     //         return a[radiusIndex] - b[radiusIndex];
    //     //     } return b[radiusIndex] - a[radiusIndex];
    //     // });
    //     // const sizeVal = data.reduce((acc, d) => acc + (d[sizeIndex] || 0), 1);

    //     // // Adding the radius field values to each data point in pie data
    //     // pieData = pieData(data).map((d, i) => {
    //     //     d.outerRadiusValue = data[i][radiusIndex] || minOuterRadius;
    //     //     d.innerRadius = config.innerRadius;
    //     //     d.colorVal = data[i][colorIndex];
    //     //     d.angleVal = data[i][angleIndex];
    //     //     d.sizeVal = sizeVal;
    //     //     d.uid = uids[i];
    //     //     d.rowId = d.uid;
    //     //     d.source = data[i];
    //     //     d._previousInfo = this._prevPieData[d.uid] ? this._prevPieData[d.uid][0] :
    //     //         getPreviousPoint(pieIndex, d.index, config);
    //     //     return d;
    //     // });
    //     // return pieData;
    //     return this.data();
    // }

    /**
     *
     *
     * @param {Object} x
     * @param {Object} y
     * @return {}
     * @memberof ArcLayer
     */
    getNearestPoint (x, y, config = {}) {
        const dataPoint = selectElement(config.event.target).data()[0];
        if (isSimpleObject(dataPoint) && dataPoint.datum) {
            const { source, rowId } = dataPoint.datum;
            return {
                id: this.getIdentifiersFromData(source, rowId),
                layerId: this.id()
            };
        }
        return null;
    }

    /**
     *
     *
     * @param {*} set
     *
     * @memberof ArcLayer
     */
    getPlotElementsFromSet (set) {
        return selectElement(this.mount()).selectAll(this.elemType()).filter(d => set.indexOf(d.datum.rowId) !== -1);
    }

    translatePoints (data) {
        const config = this.config();
        const encoding = config.encoding;
        const fieldsConfig = this.data().getFieldsConfig();
        const { angle } = this.axes();
        const {
            sizeIndex,
            colorIndex
        } = getFieldIndices(encoding, fieldsConfig);
        this._prevPieData = {};
        const pieIndex = {};
        const prevData = this._points;
        prevData.forEach((e, index) => {
            this._prevPieData[e.rowId] = [e, index];
            pieIndex[e.index] = e;
        });
        const sizeVal = data.reduce((acc, d) => acc + (d[sizeIndex] || 0), 1);
        const points = [];
        data.forEach((d, i) => {
            const { startAngle, endAngle } = angle.getScaleValue(d.angle);
            const outerRadiusValue = d.radius;

            const uid = d._id;
            points.push({
                startAngle,
                endAngle,
                source: d._data,
                index: i,
                angleVal: d.angle,
                outerRadius: getRangeValue({
                    sizeVal,
                    outerRadiusValue
                }, this),
                colorVal: d._data[colorIndex],
                rowId: uid,
                _previousInfo: this._prevPieData[uid] ? this._prevPieData[uid][0] :
                    getPreviousPoint(pieIndex, i, config)
            });
        });
        return points;
    }

    /**
     *
     *
     * @param {Object} container
     * @return {}
     * @memberof ArcLayer
     */
    render (container) {
        const measurement = this.measurement();
        const {
            classPrefix,
            defClassName,
            cornerRadius,
            padAngle,
            padRadius,
            transition
       } = this.config();
        const { radius: radiusAxis, color: colorAxis } = this.axes();
        const qualClassName = getQualifiedClassName(defClassName, this.id(), classPrefix);
        // This returns a function that generates the arc path based on the datum provided
        const radiusRange = radiusAxis.range();
        const path = arc()
                .innerRadius(radiusRange[0])
                .cornerRadius(cornerRadius)
                .padAngle(padAngle)
                .padRadius(padRadius);

        this._points = this.translatePoints(this._normalizedData[0]);
        const padding = radiusAxis.config().padding;
        // Creating the group that holds all the arcs
        const g = makeElement(selectElement(container), 'g', [1], `${qualClassName[0]}-group`)
                .classed(`${qualClassName[1]}-group`, true)
                .attr('transform', `translate(${(measurement.width - padding) / 2},
                    ${(measurement.height - padding) / 2})`);
        const tween = (elem) => {
            makeElement(elem, 'path', (d, i) => [{
                datum: d,
                index: i,
                arcFn: path,
                meta: {
                    originalColor: colorAxis.getRawColor(d.colorVal),
                    stateColor: {},
                    colorTransform: {}
                }
            }], `${qualClassName[0]}-path`)
                            .style('fill', d => colorAxis.getColor(d.datum.colorVal))
                            .transition()
                            .duration(transition.duration)
                            .on('end', this.registerAnimationDoneHook())
                            .attrTween('d', (...params) => tweenPie(path, params))
                            .attr('class', (d, i) => {
                                const individualClass = getIndividualClassName(d, i, this._points, this);
                                return `${qualClassName[0]}-path ${qualClassName[1]}-path-${d.index}
                                    ${individualClass}`;
                            });
        };
        const consecutiveExits = [];
        let exitCounter = 0;
        const tweenExit = (elem, d) => {
            let exitArr = consecutiveExits[exitCounter];
            const oldExitCounter = exitCounter;
            if (!exitArr) {
                exitArr = [{ elem, datum: d }];
            } else if (exitArr[exitArr.length - 1].datum.index === d.index - 1) {
                exitArr.push({ elem, datum: d });
            } else {
                exitCounter++;
            }
            consecutiveExits[oldExitCounter] = exitArr;
        };
        // Creating groups for all the arcs present individually
        makeElement(g, 'g', this._points, `${qualClassName[0]}`,
            {
                update: tween,
                exit: tweenExit
            })
                        .attr('class', (d, i) => `${qualClassName[0]} ${qualClassName[1]}-${i}`);
        tweenExitPie(consecutiveExits, transition, path);
        return this;
    }

    /**
     *
     *
     * @param {*} identifiers
     *
     * @memberof BaseLayer
     */
    getPointsFromIdentifiers (identifiers) {
        if (!this.data()) {
            return [];
        }
        const fieldNames = identifiers[0];
        const values = identifiers.slice(1, identifiers.length);
        const pieSlices = selectElement(this.mount()).selectAll('path').data();
        const fieldsConfig = this.data().getFieldsConfig();

        const filteredPies = pieSlices.filter((tData) => {
            const { source, rowId } = tData.datum;
            return fieldNames.every((field, idx) => {
                if (field in fieldsConfig && fieldsConfig[field].def.type === FieldType.DIMENSION) {
                    return values.findIndex(d => d[idx] === source[fieldsConfig[field].index]) !== -1;
                } else if (field === ReservedFields.ROW_ID) {
                    return values.findIndex(d => d[idx] === rowId) !== -1;
                } return true;
            });
        });

        const pieSliceInf = filteredPies[0];
        if (pieSliceInf) {
            const measurement = this.measurement();
            const padding = this.axes().radius.config().padding;
            const centroid = pieSliceInf.arcFn.centroid(pieSliceInf.datum);
            return [{
                x: centroid[0] + (measurement.width - padding) / 2,
                y: centroid[1] + (measurement.height - padding) / 2,
                width: 2,
                height: 2
            }];
        }
        return [];
    }
}
