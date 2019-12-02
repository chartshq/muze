import { selectElement, getEvent } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import MatrixComponent from './matrix-component';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../../layout/src/enums/constants';
import { WHEEL_DELTA_MODIFIER } from '../../enums/constants';

/**
 * Based on the type of scroll, it changes the scrollLeft/scrollTop property of the specific
 * elements based on the scroll distance provided
 *
 *
 */
const applyScrollAction = (elem, classPrefix, scollDistance, type) => {
    selectElement(elem)
                    .selectAll(`.${classPrefix}-grid`)
                    .property(type, scollDistance);
};

/**
 * Applies the action of the scroll by actually scrolling the respective matrices based on the
 * type of scroll. It returns a function which has both the scroll methods available
 *
 * @return {Object} contains the horizontal and vertical scroll actions on the grid component
 */
const scrollActionApplier = (movement, context) => {
    const classPrefix = context.params.config.classPrefix;

    return {
        horizontal: () => {
            [0, 1, 2].forEach(e =>
                applyScrollAction(`#${context.component[e][1].renderAt()}`, classPrefix, movement, 'scrollLeft'));
        },
        vertical: () => {
            [0, 1, 2].forEach(e =>
                applyScrollAction(`#${context.component[1][e].renderAt()}`, classPrefix, movement, 'scrollTop'));
        }
    };
};

export default class GridComponent extends MuzeComponent {

    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.gridComponents = [];
        this.setParams(params);
    }

    sanitizeGrid () {
        let height = 0;
        let width = 0;
        const { viewMatricesInfo, layoutDimensions } = this.component.viewInfo();
        const scrollInfo = this.component.scrollInfo();
        const {
            viewHeight,
            viewWidth,
            unitHeights,
            unitWidths
        } = layoutDimensions;

        for (let i = 0; i < 3; i++) {
            if (!(this.gridComponents.length && this.gridComponents[i] instanceof Array)) {
                this.gridComponents[i] = [];
            }
            for (let j = 0; j < 3; j++) {
                const matrixDim = {
                    height: viewHeight[i],
                    width: viewWidth[j],
                    unitHeights,
                    unitWidths
                };
                const matrix = viewMatricesInfo.matrices[`${ROW_MATRIX_INDEX[i]}`][j];
                const matrixName = `${ROW_MATRIX_INDEX[i]}-${COLUMN_MATRIX_INDEX[j]}`;
                const matrixConfig = {
                    dimensions: matrixDim,
                    border: layoutDimensions.border,
                    classPrefix: this.params.config.classPrefix,
                    scrollInfo,
                    row: ROW_MATRIX_INDEX[i],
                    column: j
                };
                if (this.gridComponents[i][j] instanceof MuzeComponent) {
                    const { isFacet, showHeaders } = this.params.component.config();
                    matrixConfig.isFacet = isFacet;
                    matrixConfig.showHeaders = showHeaders;
                    this.gridComponents[i][j].updateWrapper({
                        name: matrixName,
                        component: matrix,
                        config: matrixConfig
                    });
                } else {
                    const { isFacet, showHeaders } = this.params.component.config();
                    matrixConfig.isFacet = isFacet;
                    matrixConfig.showHeaders = showHeaders;
                    const matrixWrapper = new MatrixComponent({
                        name: matrixName,
                        component: matrix,
                        config: matrixConfig
                    });
                    this.gridComponents[i].push(matrixWrapper);
                }
                if (i === 0) {
                    width += matrixDim.width;
                }
                if (j === 0) {
                    height += matrixDim.height;
                }
            }
        }
        this.boundBox({ height, width });

        this.component = this.gridComponents;
        this.allComponents = this.gridComponents;
    }

    scrollBarManager (...manager) {
        if (manager.length) {
            this._scrollBarManager = manager[0];
            return this;
        }
        return this._scrollBarManager;
    }

    /**
     * Attaches a mousewheel listener to the center matrix, based on which the scrolling can occur.
     * It uses the scroll component to change the position of the scroller, which ultimately scrolls the center matrix
     *
     *
     * @return {GridComponent} Instance of the GridComponent
     */
    attachScrollListener () {
        const scrollBarManager = this.scrollBarManager();
        selectElement(`#${this.component[1][1].renderAt()}`)
            .on('wheel', () => {
                const event = getEvent();
                const {
                    wheelDeltaX,
                    wheelDeltaY
                } = event;

                // Scrolling horizontally
                if (wheelDeltaX !== 0 && Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
                    scrollBarManager.preventBrowserScroll('horizontal', event)
                        .triggerScrollBarAction('horizontal', wheelDeltaX / WHEEL_DELTA_MODIFIER);
                }

                // Scrolling Vertically
                if (wheelDeltaY !== 0 && Math.abs(wheelDeltaX) < Math.abs(wheelDeltaY)) {
                    scrollBarManager.preventBrowserScroll('vertical', event)
                        .triggerScrollBarAction('vertical', wheelDeltaY / WHEEL_DELTA_MODIFIER);
                }
            });
        return this;
    }

    performScrollAction (direction, movedView) {
        scrollActionApplier(movedView, this)[direction]();
        return this;
    }

    getBoundBox () {
        const { top, left } = this.component[0][0].boundBox();
        const { height, width } = this.boundBox();

        return {
            top,
            left,
            height,
            width
        };
    }

    updateWrapper (params) {
        this.name(params.name);
        this.boundBox(params.config.dimensions);
        this.setParams(params);
        return this;
    }

    setParams (params) {
        this.component = params.component;
        this.params = params;
        this.target(params.config.target);
        this.className(params.config.className);
        this.sanitizeGrid();
        return this;
    }

    attachListener () {
        this.attachScrollListener();
        return this;
    }
}
