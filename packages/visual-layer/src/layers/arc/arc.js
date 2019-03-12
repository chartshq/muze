import {
    makeElement,
    selectElement,
    getQualifiedClassName,
    isSimpleObject,
    Symbols,
    FieldType,
    ReservedFields,
    getObjProp
} from 'muze-utils';
import { defaultConfig } from './default-config';
import { BaseLayer } from '../../base-layer';
import { getIndividualClassName, resolveEncodingValues, getColorMetaInf } from '../../helpers';
import { tweenPie, tweenExitPie, getFieldIndices, getPreviousPoint, getSizeMultiplier } from './arc-helper';
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
        if (isSimpleObject(dataPoint)) {
            const { source, rowId } = dataPoint;
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
        return selectElement(this.mount()).selectAll(this.elemType()).filter(d => set.indexOf(d.rowId) !== -1);
    }

    translatePoints (data) {
        const config = this.config();
        const encoding = config.encoding;
        const fieldsConfig = this.data().getFieldsConfig();
        const { angle, color: colorAxis, radius: radiusAxis } = this.axes();
        const {
            sizeIndex
        } = getFieldIndices(encoding, fieldsConfig);
        const radius0Field = getObjProp(encoding.radius0, 'field');
        this._prevPieData = {};
        const pieIndex = {};
        const prevData = this._points;
        prevData.forEach((e, index) => {
            this._prevPieData[e.rowId] = [e, index];
            pieIndex[e.index] = e;
        });
        const sizeVal = data.reduce((acc, d) => acc + (d[sizeIndex] || 0), 1);
        const sizeMultiplier = getSizeMultiplier(sizeVal, this);
        const points = [];
        const angleV = {};
        data.forEach((d, i) => {
            const angles = angle.getScaleValue(d.angle);
            !angleV[d.angle] && (angleV[d.angle] = 0);
            const { startAngle, endAngle } = angles[angleV[d.angle]++];

            const uid = d.rowId;

            const resolvedEncodings = resolveEncodingValues({
                values: {
                    radius: radiusAxis.getScaleValue(d.radius) * sizeMultiplier,
                    radius0: radius0Field ? radiusAxis.getScaleValue(d.radius0) * sizeMultiplier :
                        radiusAxis.range()[0],
                    color: colorAxis.getColor(d.color),
                    angle0: startAngle,
                    angle: endAngle,
                    startAngle,
                    endAngle,
                    startAngle0: startAngle,
                    endAngle0: endAngle
                },
                data: d
            }, i, data, this);
            const color = resolvedEncodings.color;
            points.push({
                source: d.source,
                index: i,
                angle0: resolvedEncodings.angle0,
                angle: resolvedEncodings.angle,
                radius0: resolvedEncodings.radius0,
                radius: resolvedEncodings.radius,
                color,
                meta: getColorMetaInf(resolvedEncodings.color, colorAxis),
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
        const qualClassName = getQualifiedClassName(defClassName, this.id(), classPrefix);
        // This returns a function that generates the arc path based on the datum provided
        const path = this._arcFn = arc()
                .cornerRadius(cornerRadius)
                .startAngle(d => d.angle0 + Math.PI / 2)
                .endAngle(d => d.angle + Math.PI / 2)
                .padAngle(padAngle)
                .padRadius(padRadius)
                .outerRadius(d => d.radius)
                .innerRadius(d => d.radius0);

        this._points = this.translatePoints(this._normalizedData[0]);

        // Creating the group that holds all the arcs
        const g = makeElement(selectElement(container), 'g', [1], `${qualClassName[0]}-group`)
                .classed(`${qualClassName[1]}-group`, true)
                .attr('transform', `translate(${measurement.width / 2},
                    ${measurement.height / 2})`);
        const tween = (elem) => {
            makeElement(elem, 'path', d => [d], `${qualClassName[0]}-path`)
                            .style('fill', d => d.color)
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
            const { source, rowId } = tData;
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
            const centroid = this._arcFn.centroid(pieSliceInf);
            return [{
                x: centroid[0] + measurement.width / 2,
                y: centroid[1] + measurement.height / 2,
                width: 2,
                height: 2
            }];
        }
        return [];
    }
}
