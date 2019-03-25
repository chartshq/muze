import SimpleLegend from './simple-legend';
import {
    getScaleInfo,
    getInterpolatedData,
    getDomainBounds
} from './legend-helper';
import {
    createLegendSkeleton,
    createItemSkeleton,
    renderStepItem
} from './renderer';
import { STEP, RECT, LEFT, SIZE, UPPER, LOWER } from '../enums/constants';
import { stepData } from './position-config';
import '../styles.scss';

/**
 * Creates a Legend from the axes of a canvas
 *
 * @param {Object} dependencies : legend data
 * @class Legend
 */
export default class StepLegend extends SimpleLegend {

    /**
     * Initializes an instance of the class
     *
     * @static
     * @param {Object} dependencies Set of dependencies required by the legend
     * @return {Instance} returns a new instance of Legend
     * @memberof Legend
     */
    static create (dependencies) {
        return new StepLegend(dependencies);
    }

    /**
     *
     *
     * @static
     *
     * @memberof StepLegend
     */
    static type () {
        return STEP;
    }

    /**
     *
     *
     * @param {*} scale
     *
     * @memberof StepLegend
     */
    dataFromScale () {
        let domainLeg = [];
        const scale = this.scale();
        const { scaleType, domain, steps, scaleFn } = getScaleInfo(scale);

        const { formatter } = this.config();
        const domainBounds = {
            lower: null, upper: null
        };

        // defining scaleParams
        const scaleParams = {
            smartLabel: this.labelManager(),
            measures: this.measurement(),
            alignment: this.config().position,
            minTickDistance: this.minTickDistance()
        };

        if (steps instanceof Array) {
            if (domain[0] < steps[0]) {
                domainBounds.lower = [`${formatter.bounds.lower} ${steps[0]}`];
            }
            domainLeg = [...domainLeg, ...steps];
            if (domain[domain.length - 1] > steps[steps.length - 1]) {
                domainBounds.upper = [`${formatter.bounds.upper} ${steps[steps.length - 1]}`];
            }
        } else {
            domainLeg = getInterpolatedData(domain, steps, scaleParams);
        }

        domainLeg = [...new Set(domainLeg)].sort((a, b) => a - b);
        domainLeg = domainLeg.map((ele, i) => {
            let value = null;
            if (i < domainLeg.length - 1) {
                value = `${(ele.toFixed(1))} - ${(+domainLeg[i + 1].toFixed(1))}`;
            }
            return {
                [scaleType]: scaleType === SIZE ? scale[scaleFn](ele) * scale.getScaleFactor() : scale[scaleFn](ele),
                value,
                id: i + 1,
                range: [ele, domainLeg[i + 1]]
            };
        }).filter(d => d.value !== null);

        if (domainBounds.lower) {
            const lowerBounds = getDomainBounds(LOWER, { scale, scaleFn, scaleType },
                { domain, steps, domainBounds });
            domainLeg = [lowerBounds, ...domainLeg];
        }
        if (domainBounds.upper) {
            const upperBounds = getDomainBounds(UPPER, { scale, scaleFn, scaleType },
            { domain, steps, domainBounds, domainLeg });
            domainLeg = [...domainLeg, upperBounds];
        }
        return domainLeg;
    }

     /**
     *
     *
     * @param {*} effPadding
     * @param {*} align
     *
     * @memberof Legend
     */
    getLabelSpaces (effPadding, align) {
        this.config({
            item: {
                text: {
                    orientation: this.config().position
                }
            }
        });
        return super.getLabelSpaces(effPadding, align);
    }

    /**
     *
     *
     *
     * @memberof Legend
     */
    elemType () {
        return RECT;
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
        const { classPrefix, position } = this.config();
        const data = stepData(this.data())[position];

        const legendContainer = super.render(this.mount());

        // create Legend
        const { legendItem } = createLegendSkeleton(this, legendContainer, classPrefix, data);
        const { itemSkeleton } = createItemSkeleton(this, legendItem);

        renderStepItem(this, itemSkeleton);
        legendContainer.selectAll('div').style('float', LEFT);
        firebolt.mapActionsAndBehaviour();
        firebolt.createSelectionSet(this.data().map(d => d.id));
        return legendContainer;
    }

    /**
     *
     *
     * @param {*} data
     *
     * @memberof StepLegend
     */
    getCriteriaFromData (data) {
        const fieldName = this.fieldName();
        return {
            [fieldName]: data.range
        };
    }
}
