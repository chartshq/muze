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
     * @returns
     * @memberof DiscreteLegend
     */
    static type () {
        return DISCRETE;
    }

    /**
     *
     *
     * @param {*} scale
     * @returns
     * @memberof DiscreteLegend
     */
    dataFromScale (scale) {
        const { scaleType, domain, scaleFn } = getScaleInfo(scale);
        let domainForLegend = [...new Set(domain)];

        domainForLegend = domainForLegend.map((ele, i) => ({
            [scaleType]: scale[scaleFn](ele),
            value: typeof +domainForLegend[i] === 'number' && !isNaN(+domainForLegend[i])
                ? (+domainForLegend[i]).toFixed(0) : domainForLegend[i],
            id: i
        })).filter(d => d.value !== null);

        domainForLegend = scaleType === SIZE ? domainForLegend.sort((a, b) => a[scaleType] - b[scaleType])
            : domainForLegend;
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
        legendContainer.selectAll('div').style('float', LEFT);
        firebolt.mapActionsAndBehaviour();
        firebolt.createSelectionSet(this.data().map(d => d.id));
        return legendContainer;
    }
}
