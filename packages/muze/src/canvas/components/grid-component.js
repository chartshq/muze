import MuzeComponent from './muze-chart-component';
import MatrixComponent from './matrix-component';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../../layout/src/enums/constants';

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
