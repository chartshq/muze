import {
    FieldType,
    DimensionSubtype,
    formatTemporal,
    getReadableTicks,
    InvalidAwareTypes
} from 'muze-utils';
import SimpleLegend from './simple-legend';
import { DISCRETE, LEFT, SIZE } from '../enums/constants';
import { getScaleInfo } from './legend-helper';
import { createLegendSkeleton, createItemSkeleton, renderDiscreteItem } from './renderer';
import '../styles.scss';

/**
 * Creates a Legend from the axes of a canvas
 *
 * @param {Object} dependencies : legend data
 * @class Legend
 */
export default class DiscreteLegend extends SimpleLegend {

    /**
     * Initializes an instance of the class
     *
     * @static
     * @param {Object} dependencies Set of dependencies required by the legend
     * @return {Instance} returns a new instance of Legend
     * @memberof Legend
     */
    static create (dependencies) {
        return new DiscreteLegend(dependencies);
    }

    /**
     *
     *
     * @static
     *
     * @memberof DiscreteLegend
     */
    static type () {
        return DISCRETE;
    }

    /**
     *
     *
     * @param {*} scale
     *
     * @memberof DiscreteLegend
     */
    dataFromScale () {
        const scale = this.scale();
        const { scaleType, domain, scaleFn, steps } = getScaleInfo(scale);
        const field = this.metaData().getFieldspace().fields[0];
        const { type, subtype } = field.schema();
        let domainForLegend = [];
        if (scaleType === SIZE && type === FieldType.MEASURE) {
            domainForLegend = steps instanceof Array ? steps : getReadableTicks(domain, domain.length);
        } else if (subtype === DimensionSubtype.TEMPORAL) {
            domainForLegend = [...new Set(field.data())];
        } else {
            domainForLegend = [...new Set(domain)];
        }

        const len = domainForLegend.length;
        domainForLegend = domainForLegend.map((ele, i) => {
            let value = 0;
            let range = 0;
            const rawVal = domainForLegend[i];
            if (type === FieldType.MEASURE) {
                value = (+domainForLegend[i]).toFixed(0);
                const nextVal = domainForLegend[i + 1] ? +domainForLegend[i + 1] : +value;
                range = [value, i === len - 1 ? nextVal.toFixed(0) : nextVal.toFixed(0) - 1];
            } else {
                let domainVal = rawVal;
                if (subtype === DimensionSubtype.TEMPORAL) {
                    domainVal = formatTemporal(domainForLegend[i], field.minimumConsecutiveDifference());
                }
                value = domainVal;
                range = [domainVal];
            }
            return {
                [scaleType]: scale[scaleFn](ele),
                value,
                id: i,
                range,
                rawVal
            };
        }).filter(d => d.value !== null);

        domainForLegend = scaleType === SIZE ? domainForLegend.sort((a, b) => a[scaleType] - b[scaleType])
            : domainForLegend.sort((a, b) => {
                const domainValue =
                                !(a.value instanceof InvalidAwareTypes || a.value instanceof InvalidAwareTypes)
                                ? a.value.localeCompare(b.value)
                                : 1;
                return domainValue;
            });
        return domainForLegend;
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
        const data = this.data();

        const { classPrefix } = this.config();
        const legendContainer = super.render(this.mount());
        // create Legend
        const { legendItem } = createLegendSkeleton(this, legendContainer, classPrefix, data);
        const { itemSkeleton } = createItemSkeleton(this, legendItem);
        renderDiscreteItem(this, itemSkeleton);

        legendContainer.selectAll('div')
        .filter((datum, i, allSelections) => !allSelections[i].classList.contains(`${classPrefix}-legend-body`))
        .style('float', LEFT);

        firebolt.mapActionsAndBehaviour();
        return legendContainer;
    }
}
