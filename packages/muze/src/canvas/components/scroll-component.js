import MuzeComponent from './muze-chart-component';
import { HorizontalScrollMaker } from './scroll-bar-maker/horizontal-scroll-maker';
import { VerticalScrollMaker } from './scroll-bar-maker/vertical-scroll-maker';

const scrollMakerMap = {
    horizontal: HorizontalScrollMaker,
    vertical: VerticalScrollMaker
};

/**
 * Scroll Component acts as a wrapper over the scoll bars created using the respective Scroll Makers
 * This provides a consistent API for layouting using the tree layout system.
 *
 *
 * @class
 * @public
 * @module ScrollComponent
 */
export default class ScrollComponent extends MuzeComponent {

    constructor (params) {
        const ScrollMaker = scrollMakerMap[params.config.type];

        params.component = new ScrollMaker();
        params.component.config(params.config.scrollBarComponentConfig);
        params.component.logicalSpace(params.dimensions);
        super(params.name, params.component.getLogicalSpace(), 0);
        this.setParams(params);
    }

    manager (...manager) {
        if (manager.length) {
            this.component.manager(manager[0]);
            return this;
        }
        return this.component.manager();
    }

    /**
     * Scrolls based on the actual pixel value provided. Since it's a delta change, the input will be
     * a delta between (-Infinity, Infinity), based on which the scroll will occur. Only a delta movement in
     * scroll occurs
     *
     * @public
     *
     * @param {number} delta Based on which the scroll will have a delta change in position
     * @return {ScrollComponent} Instance of the ScrollComponent
     */
    scrollDeltaTo (delta) {
        this.component.scrollDeltaTo(delta);
        return this;
    }

    /**
     * Scrolls to the specific point in the page. The input is provided as a percentage (0 - 100)
     *
     * @public
     *
     * @param {number} scrollPercentage Its the percentage based on which the scroll action will occur
     * @return {ScrollComponent} Instance of the ScrollComponent
     */
    scrollTo (scrollPercentage) {
        this.component.scrollTo(scrollPercentage);
        return this;
    }

    /**
     * Scrolls to the specific point in the page based on the unit index.
     * The input is provided as a number represting the index for the unit.
     * For vertical scroll, it's the row index that will be required.
     * For horizontal scroll, it's the column index that will be required
     *
     * @public
     *
     * @param {number} unitIndex Index of the unit appearing in the grid
     * @return {ScrollComponent} Instance of the ScrollComponent
     */
    scrollToUnitIndex (unitIndex) {
        const unitPositions = this.component.unitPositions();
        const sanitizedUnitIndex = Math.min(Math.max(0, unitIndex), unitPositions.length - 1);
        this.component.scrollTo(unitPositions[sanitizedUnitIndex]);
        return this;
    }

    /**
     * Provides the positions of the units(either horizontal or vertical based on the type
     * of scroll bar it wraps) relative to it's container. The position of the first unit starts at 0
     *
     *
     * @public
     *
     * @return {Array} Positions of units either horizontal or vertical
     */
    getScrollPositionsForUnits () {
        return this.component.unitPositions();
    }

    draw (container) {
        this.component.createScroll(container || document.getElementById(this.renderAt()));
        return this;
    }

    /**
     * Can be used to attach a scroll action whenever scrolling occurs in the canvas
     *
     * @public
     * @param {number} externalAction Action to be attached during scroll
     * @return {ScrollComponent} Instance of the ScrollComponent
     */
    attachScrollAction (externalAction) {
        this.component.attachScrollAction(externalAction);
        return this;
    }

    /**
     * Can be used to detach the scroll action already bound to the scroll bar
     *
     * @public
     * @return {ScrollComponent} Instance of the ScrollComponent
     */
    detachScrollAction () {
        this.component.detachScrollAction();
        return this;
    }

    updateWrapper (params) {
        this.name(params.name);
        this.component.config(params.config.scrollBarComponentConfig);
        this.component.logicalSpace(params.dimensions);
        this.boundBox(this.component.getLogicalSpace());
        this.setParams(params);
        return this;
    }

    setParams (params) {
        this.component = params.component || this.component;
        this.params = params;
        this.target(params.config.target);
        this.position(params.config.position);
        this.className(params.config.className);
        this.alignWith(params.config.alignWith);
        this.alignment(params.config.alignment);
    }

    remove () {
        this.component.remove();
    }
}
