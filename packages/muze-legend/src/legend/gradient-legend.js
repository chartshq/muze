import SimpleLegend from './simple-legend';
import { getScaleInfo, getInterpolatedData, } from './legend-helper';
import { GRADIENT, LEFT, HORIZONTAL, BOTTOM, RIGHT, SIZE } from '../enums/constants';
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
     * @returns
     * @memberof GradientLegend
     */
    static type () {
        return GRADIENT;
    }

    /**
     *
     *
     * @param {*} axis
     * @returns
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
     * @returns
     * @memberof GradientLegend
     */
    dataFromScale (scale) {
        let domainForLegend = [];
        const { scaleType, domain, steps, scaleFn } = getScaleInfo(scale);

        if (steps instanceof Array) {
            if (domain[0] < steps[0]) {
                domainForLegend[0] = domain[0];
            }
            domainForLegend = [...domainForLegend, ...steps];
            if (domain[domain.length - 1] > steps[steps.length - 1]) {
                domainForLegend.push(domain[1]);
            }
        } else {
            domainForLegend = getInterpolatedData(domain, steps);
        }
        domainForLegend = [...new Set(domainForLegend)].sort((a, b) => a - b);

        return domainForLegend.map((ele, i) => {
            const value = domainForLegend[i];
            return {
                [scaleType]: scaleType === SIZE ? scale[scaleFn](ele) * scale.getScaleFactor() : scale[scaleFn](ele),
                value: +value.toFixed(2),
                id: i
            };
        }).filter(d => d.value !== null);
    }

    /**
     *
     *
     * @param {*} effPadding
     * @param {*} align
     * @return
     * @memberof Legend
     */
    getLabelSpaces (effPadding, align) {
        this.config({
            item: {
                text: {
                    position: align === HORIZONTAL ? BOTTOM : RIGHT
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
     * @returns
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
        firebolt.createSelectionSet(this.data().map(d => d.id));
        return legendContainer;
    }
}
