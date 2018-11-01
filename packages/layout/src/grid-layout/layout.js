/**
 * This file declares a table that can be extended to create a Datagrid, crosstab
 * and man other visualzations that require a tabular structure.
 */

import { getUniqueId } from 'muze-utils';
import GenericLayout from '../generic-layout';
import { DEFAULT_CONFIGURATION, DEFAULT_MEASUREMENTS } from './defaults';
import {
    renderMatrices
} from './renderer';
import { generateVisualMatrices } from './layout-helper';
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
        this._viewInfo = this.constructor.defaultViewInfo();
    }

    static defaultViewInfo () {
        return {
            layoutDimensions: {
                border: this.defaultConfig().border,
                viewHeight: [0, 0, 0],
                viewWidth: [0, 0, 0]
            },
            viewMatricesInfo: {
                columnPages: 0,
                rowPages: 0,
                matrices: { top: [], center: [], bottom: [] }
            }
        };
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
        this.computeViewInformation();
        return this;
    }

    /**
     *
     *
     * @param {*} type
     * @param {*} pageNumber
     * @returns
     * @memberof GridLayout
     */
    gotoPage (type, pageNumber) {
        const pageType = type.toLowerCase();
        const { viewMatricesInfo } = this.viewInfo();
        const totalPages = viewMatricesInfo[`${pageType}Pages`];
        const pointer = Math.min(Math.max(1, pageNumber), totalPages);
        this.config({
            [`${pageType}Pointer`]: pointer - 1
        });
        this.computeViewInformation();
        this.renderGrid();
        return this;
    }

    /**
     *
     *
     * @param {*} type
     * @returns
     * @memberof GridLayout
     */
    pages (type) {
        const { viewMatricesInfo } = this.viewInfo();
        const pageType = type.toLowerCase();
        return {
            totalPages: viewMatricesInfo[`${pageType}Pages`],
            currentPage: this.config()[`${pageType}Pointer`] + 1
        };
    }

    viewInfo (...viewInfo) {
        if (viewInfo.length) {
            this._viewInfo = viewInfo[0];
            return this;
        }
        return this._viewInfo;
    }

    /**
     *
     *
     * @returns
     * @memberof GridLayout
     */
    computeViewInformation () {
        const {
            rowPointer,
            columnPointer,
            border
        } = this.config();
        const viewMatricesInfo = getViewMatrices(this, rowPointer, columnPointer);
        const layoutDimensions = getViewMeasurements(this);
        layoutDimensions.border = border;
        this.viewInfo({
            viewMatricesInfo,
            layoutDimensions
        });
        return this;
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
        const viewInfo = this.viewInfo();
        const {
                viewMatricesInfo,
                layoutDimensions
            } = viewInfo;
            // Render matrices
        renderMatrices(this, viewMatricesInfo.matrices, layoutDimensions);
        return this;
    }
}
