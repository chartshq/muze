import SimpleLegend from './simple-legend';
import {
    getScaleInfo,
    getInterpolatedData,
    getDomainBounds,
    getItemMeasures
} from './legend-helper';
import {
    createLegendSkeleton,
    createItemSkeleton,
    renderStepItem
} from './renderer';
import { STEP, RECT, LEFT, SIZE, UPPER, LOWER, HORIZONTAL } from '../enums/constants';
import { stepData } from './position-config';
import '../styles.scss';
import { STEP_DEFAULT_CONFIG, DEFAULT_MEASUREMENT } from './defaults';

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
     * @static
     *
     * @memberof StepLegend
     */
    static defaultConfig () {
        STEP_DEFAULT_CONFIG.buffer[HORIZONTAL] = 0;
        return STEP_DEFAULT_CONFIG;
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
            } else if (domainLeg.length === 1) {
                value = ele.toFixed(1);
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
    getLabelSpaces () {
        this.config({
            item: {
                text: {
                    orientation: this.config().position
                }
            }
        });
        const {
            item
        } = this.config();
        super.getLabelSpaces();
        const stepItemBuffer = DEFAULT_MEASUREMENT.padding * 2;
        return getItemMeasures(this, 'range', item.text.formatter, stepItemBuffer);
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
        return legendContainer;
    }

    getCriteriaFromData (data) {
        const fieldName = this.fieldName();
        return {
            [fieldName]: data.range
        };
    }
}
