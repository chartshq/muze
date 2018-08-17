/**
 * This file declares a table that can be extended to create a Datagrid, crosstab
 * and man other visualzations that require a tabular structure.
 */

import { getUniqueId } from 'muze-utils';
import GenericLayout from '../generic-layout';
import { DEFAULT_CONFIGURATION, DEFAULT_MEASUREMENTS } from './defaults';
import {
    renderArrows,
    renderMatrices
} from './renderer';
import { generateVisualMatrices } from './layout-helper';
import { TOP, LEFT, RIGHT, BOTTOM, CLICK } from '../enums/constants';
import { computeLayoutMeasurements, getViewMeasurements, getViewMatrices } from './computations';
/**
 * This class is used to create a tabular structure that
 * can house charts and values.
 *
 * @class GridLayout
 */
export default class GridLayout extends GenericLayout {

    /**
     * Creates an instance of TableLayout.
     * @param {HTMLElement} matrices Set of upto 9 matrices containing the cells to be rendered
     * @param {HTMLElement} mountPoint DOM element/d3 selection where the layout is to be mounted
     * @param {Object} measurement The dimensions of the layout
     * @param {Object} config external configurations.
     * @memberof GenericLayout
     *
     * measurement : {
     *      width : number => width of the container
     *      height : number => height of the container
     *      unitHeight : number => height of unit of the cells
     *      unitWidth : number => width of unit of the cells
     * }
     *
     */
    constructor (matrices, mountPoint, measurement, config) {
        super(mountPoint, measurement, config);
        this.matrices(matrices);
        this.config(this.constructor.defaultConfig());
        this._layoutId = getUniqueId();
    }

    /**
     * Returns initial set of measurements for the grid layout
     *
     * @static
     * @return {Object} Returns initial set of measurements
     * @memberof GridLayout
     */
    static defaultMeasurement () {
        return DEFAULT_MEASUREMENTS;
    }

    /**
     * Returns initialconfiguration for grid layout
     *
     * @static
     * @return {Object} Returns initial configuration for grid layout
     * @memberof GridLayout
     */
    static defaultConfig () {
        return DEFAULT_CONFIGURATION;
    }

    /**
     * This function is used to return an instance of GridLayout
     *
     * @return {GridLayout} Instance of grid layout.
     * @static
     * @memberof GridLayout
     */
    static create () {
        return new GridLayout(null, null, this.defaultMeasurement(), this.defaultConfig());
    }

    /**
     * Sets/Gets the matrices for the layout
     *
     * @param {Array} matrices Set of matrices
     * @return {Object} Getter/Setter
     * @memberof GridLayout
     */
    matrices (matrices) {
        if (matrices) {
            this._matrices = generateVisualMatrices(this, matrices);
            return this;
        }
        return super.matrices(matrices);
    }

    /**
     * Triggers the computations for the layout based on the matrices available
     * This causes a reflow in the entire layout system.
     *
     * @return {Object} Layout instance
     * @memberof GridLayout
     */
    triggerReflow () {
        computeLayoutMeasurements(this);
        this.setViewInformation();
        return this;
    }

    /**
     * Registers events on clicks of the arrows in the layout
     *
     * @param {string} type type of arrow
     * @param {Function} callback event function to be attached
     * @return {Object} current instance
     * @memberof GridLayout
     */
    arrowClick (type, callback) {
        let {
            columnPointer,
             rowPointer
        } = this.config();
        switch (type) {
        case TOP:
            rowPointer--;
            break;
        case BOTTOM:
            rowPointer++;
            break;
        case LEFT:
            columnPointer--;
            break;
        case RIGHT:
            columnPointer++;
            break;
        default:
            break;
        }
        this.config({
            rowPointer,
            columnPointer
        });
        callback && callback();
        this.setViewInformation();
        this.renderGrid();
        this.renderArrows();
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof GridLayout
     */
    setViewInformation () {
        const {
            rowPointer,
            columnPointer,
            border
        } = this.config();
        const viewMatricesInfo = getViewMatrices(this, rowPointer, columnPointer);
        const layoutDimensions = getViewMeasurements(this);
        layoutDimensions.border = border;
        this.viewInfo = {
            viewMatricesInfo,
            layoutDimensions
        };
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof GridLayout
     */
    getViewInformation () {
        return this.viewInfo;
    }

    /**
     * Renders the layout
     *
     * @return {Object} current instance
     * @memberof GridLayout
     */
    renderGrid (mountPoint) {
        this.mountPoint(mountPoint);
        if (!this.mountPoint()) {
            return this;
        }
        const {
            viewMatricesInfo,
            layoutDimensions
        } = this.getViewInformation();
        // Render matrices
        renderMatrices(this, viewMatricesInfo.matrices, layoutDimensions);
        return this;
    }

    /**
     *
     *
     * @param {*} container
     * @memberof GridLayout
     */
    renderArrows (container) {
        if (!this._arrowContainer) {
            this._arrowContainer = container;
        }
        const arrows = renderArrows(this, this._arrowContainer, this.getViewInformation().viewMatricesInfo);
        Object.entries(arrows).forEach((arrowInfo) => {
            const arrowType = arrowInfo[0];
            arrowInfo[1].on(CLICK, () => this.arrowClick(arrowType));
        });
        return this;
    }
}
