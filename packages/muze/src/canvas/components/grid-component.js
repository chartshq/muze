import { selectElement, getEvent } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import MatrixComponent from './matrix-component';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../../layout/src/enums/constants';

const scrollActionApplier = (movement, context) => ({
    horizontal: () => {
        [0, 1, 2].forEach((e) => {
            selectElement(`#${context.component[e][1].renderAt()}`)
                            .selectAll('.muze-grid')
                            .property('scrollLeft', movement);
        });
    },
    vertical: () => {
        [0, 1, 2].forEach((e) => {
            selectElement(`#${context.component[1][e].renderAt()}`)
                            .selectAll('.muze-grid')
                            .property('scrollTop', movement);
        });
    }
});

const bindScrollEvent = (context) => {
    let mouseHover = false;

    selectElement(`#${context.component[1][1].renderAt()}`)
                    .on('mouseenter', () => { mouseHover = true; })
                    .on('mouseleave', () => { mouseHover = false; })
                        // .selectAll('.muze-grid')
                    .on('mousewheel', () => {
                        const event = getEvent();
                        event.stopPropagation();
                        // const delta = event.wheelDelta;
                        const deltaX = event.wheelDeltaX;
                        const deltaY = event.wheelDeltaY;

                        if (deltaX > 0) {
                            context.scrollBarManager().triggerScrollBarAction('horizontal', { x: deltaX, y: deltaY });
                            // console.log('go up');
                        } else if (deltaX < 0) {
                            context.scrollBarManager().triggerScrollBarAction('horizontal', { x: deltaX, y: deltaY });
                            // console.log('go down');
                        } else if (deltaY > 0) {
                            context.scrollBarManager().triggerScrollBarAction('vertical', { x: deltaX, y: deltaY });
                            // console.log('go down');
                        } else {
                            context.scrollBarManager().triggerScrollBarAction('vertical', { x: deltaX, y: deltaY });
                            // console.log('go down');
                        }

                        // console.log(event);
                    });
    console.log(selectElement('body'));
    selectElement('body').on('scroll', () => {
        const e = getEvent();

        console.log(mouseHover);
        if (mouseHover) {
            if (e.preventDefault) { e.preventDefault(); }
            e.returnValue = false;
        }
        return false;
    });
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

        for (let i = 0; i < 3; i++) {
            if (!(this.gridComponents.length && this.gridComponents[i] instanceof Array)) {
                this.gridComponents[i] = [];
            }
            for (let j = 0; j < 3; j++) {
                const matrixDim = { height: layoutDimensions.viewHeight[i], width: layoutDimensions.viewWidth[j] };
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
                    this.gridComponents[i][j].updateWrapper({
                        name: matrixName,
                        component: matrix,
                        config: matrixConfig
                    });
                } else {
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

    registerScrollEvent () {
        bindScrollEvent(this);
        // .property('scrollLeft', movement);
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
    }
}
