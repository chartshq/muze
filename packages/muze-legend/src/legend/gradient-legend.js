import SimpleLegend from './simple-legend';
import { getScaleInfo, getInterpolatedData, getInterpolatedArrayData } from './legend-helper';
import { GRADIENT, LEFT, SIZE } from '../enums/constants';
import { HIGHLIGHT } from '../enums/behaviours';
import { Marker } from '../enums/side-effects';
import { renderGradient, createAxis } from './gradient-helper';
import '../styles.scss';

/**
 * Creates a Legend from the axes of a canvas
 *
 * @param {Object} dependencies : legend data
 * @class Legend
 */
export default class GradientLegend extends SimpleLegend {

    /**
     * Initializes an instance of the class
     *
     * @static
     * @param {Object} dependencies Set of dependencies required by the legend
     * @return {Instance} returns a new instance of Legend
     * @memberof Legend
     */
    static create (dependencies) {
        return new GradientLegend(dependencies);
    }

    /**
     *
     *
     * @static
     *
     * @memberof GradientLegend
     */
    static type () {
        return GRADIENT;
    }

    /**
     *
     *
     * @param {*} axis
     *
     * @memberof GradientLegend
     */
    axis (...axis) {
        if (axis.length) {
            this._axis = axis[0];
            return this;
        }
        return this._axis;
    }

    /**
     *
     *
     * @param {*} scale
     *
     * @memberof GradientLegend
     */
    dataFromScale () {
        let domainForLegend = [];
        const scale = this.scale();
        const { scaleType, domain, steps, scaleFn } = getScaleInfo(scale);

        // defining scaleParams
        const scaleParams = {
            smartLabel: this.labelManager(),
            measures: this.measurement(),
            alignment: this.config().position,
            minTickDistance: this.minTickDistance()
        };

        if (steps instanceof Array) {
            if (domain[0] < steps[0]) {
                domainForLegend[0] = domain[0];
            }
            domainForLegend = [...domainForLegend, ...steps];
            if (domain[domain.length - 1] > steps[steps.length - 1]) {
                domainForLegend.push(domain[1]);
            }
            // Sorting the domain Array
            domainForLegend = [...new Set(domainForLegend)].sort((a, b) => a - b);

            domainForLegend = getInterpolatedArrayData(domainForLegend, scaleParams);
        } else {
            domainForLegend = getInterpolatedData(domain, steps - 1, scaleParams);
        }
        domainForLegend = [...new Set(domainForLegend)].sort((a, b) => a - b);

        return domainForLegend.map((ele, i) => {
            const value = domainForLegend[i];
            return {
                [scaleType]: scaleType === SIZE ? scale[scaleFn](ele) * scale.getScaleFactor()
                    : scale[scaleFn](ele),
                value: +value.toFixed(1),
                id: i
            };
        }).filter(d => d.value !== null);
    }

    /**
     *
     *
     * @param {*} effPadding
     * @param {*} align
     *
     * @memberof Legend
     */
    getLabelSpaces (effPadding) {
        this.config({
            item: {
                text: {
                    orientation: this.config().position
                }
            }
        });
        const axis = createAxis(this);
        const axisSpace = axis.getLogicalSpace();
        const space = { width: axisSpace.width - effPadding, height: axisSpace.height - effPadding };
        const axisDomainLength = axis.source().domain().length;
        const labelSpaces = new Array(axisDomainLength).fill(space);

        this.axis(axis);
        return labelSpaces;
    }

    /**
     *
     *
     *
     * @memberof GradientLegend
     */
    getDrawingContext () {
        return {
            svgContainer: this._legendGradientSvg
        };
    }

    /**
     * Render the legend with its title
     *
     * @param {DOM} mountPoint Point where the legend and title are to be appended
     * @return {Instance} Current instance of legend
     * @memberof Legend
     */
    render () {
        const firebolt = this.firebolt();
        const legendContainer = super.render(this.mount());
        // create Legend
        renderGradient(this, legendContainer);
        legendContainer.selectAll('div').style('float', LEFT);
        firebolt.mapActionsAndBehaviour();
        firebolt.mapSideEffects({
            [HIGHLIGHT]: [Marker]
        });
        return legendContainer;
    }

    /**
     *
     *
     * @param {*} data
     *
     * @memberof SimpleLegend
     */
    getCriteriaFromData (data) {
        return [[this.fieldName()], [data.value]];
    }

    getRangeFromIdentifiers ({ fields, criteria }) {
        return fields.reduce((range, v) => {
            range[v] = criteria[v];
            return range;
        }, {});
    }
}
