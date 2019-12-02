import {
    makeElement,
    selectElement,
    getQualifiedClassName,
    isSimpleObject,
    Symbols,
    FieldType,
    ReservedFields
} from 'muze-utils';
import { defaultConfig } from './default-config';
import { getIndividualClassName, resolveEncodingValues, getColorMetaInf } from '../../helpers';
import { tweenPie, tweenExitPie, getPreviousPoint } from './arc-helper';
import './styles.scss';

const arc = Symbols.arc;

export const ArcLayerMixin = superclass => class extends superclass {
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

    static formalName () {
        return 'arc';
    }

    elemType () {
        return 'path';
    }

    getNearestPoint (x, y, config = {}) {
        return this.getDataFromEvent(config.event);
    }

    getDataFromEvent (event) {
        const dataPoint = selectElement(event.target).data()[0];
        if (isSimpleObject(dataPoint)) {
            const { source, rowId } = dataPoint;
            return {
                id: this.getIdentifiersFromData(source, rowId),
                layerId: this.id()
            };
        }
        return null;
    }

    translatePoints (data) {
        const { angle, color: colorAxis, radius: radiusAxis } = this.axes();
        const pieIndex = {};
        const prevData = this._points[0] || [];
        const points = [];
        const angleV = {};

        this._prevPieData = {};
        prevData.forEach((e, index) => {
            this._prevPieData[e.rowId] = [e, index];
            pieIndex[e.index] = e;
        });
        data.forEach((d, i) => {
            const angles = angle.getScaleValue(d.angle);
            if (angles) {
                !angleV[d.angle] && (angleV[d.angle] = 0);
                const { startAngle, endAngle } = angles[angleV[d.angle]++];
                const uid = d.rowId;
                const resolvedEncodings = resolveEncodingValues({
                    values: {
                        radius: radiusAxis.getOuterRadius(d.radius),
                        radius0: radiusAxis.getInnerRadius(d.radius0),
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
                    enter: {},
                    update: {
                        angle0: resolvedEncodings.angle0,
                        angle: resolvedEncodings.angle,
                        radius0: resolvedEncodings.radius0,
                        radius: resolvedEncodings.radius
                    },
                    color,
                    meta: getColorMetaInf({
                        fill: color
                    }),
                    rowId: uid,
                    _previousInfo: this._prevPieData[uid] ? this._prevPieData[uid][0] :
                        getPreviousPoint(pieIndex, i, this)
                });
            }
        });
        return points;
    }

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
                .startAngle(d => d.update.angle0 + Math.PI / 2)
                .endAngle(d => d.update.angle + Math.PI / 2)
                .padAngle(padAngle)
                .padRadius(padRadius)
                .outerRadius(d => d.update.radius)
                .innerRadius(d => d.update.radius0);

        this._points = this._normalizedData.map(arr => this.translatePoints(arr));
        const graphicElems = this._graphicElems = {};
        // Creating the group that holds all the arcs
        const g = makeElement(selectElement(container), 'g', this._points, `${qualClassName[0]}-group`)
                .classed(`${qualClassName[1]}-group`, true)
                .attr('transform', `translate(${measurement.width / 2},
                    ${measurement.height / 2})`);
        const tween = (elem) => {
            makeElement(elem, 'path', d => [d], `${qualClassName[0]}-path`)
                .style('fill', d => d.color)
                .each(function (d) {
                    graphicElems[d.rowId] = selectElement(this);
                })
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
        makeElement(g, 'g', d => d, `${qualClassName[0]}`,
            {
                update: tween,
                exit: tweenExit
            })
                        .attr('class', (d, i) => `${qualClassName[0]} ${qualClassName[1]}-${i}`);
        tweenExitPie(consecutiveExits, transition, path);
        return this;
    }

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
};

