import MuzeComponent from './muze-chart-component';
import MatrixComponent from './matrix-component';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../../layout/src/enums/constants';
export default class GridComponent extends MuzeComponent {

    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.component = params.component;
        this.params = params;
        this.target = params.config.target;
        this.className = params.config.className
        this.sanitizeGrid()
    }

    sanitizeGrid(){
    const { viewMatricesInfo, layoutDimensions } = this.component.getViewInformation();
    const gridComponents = [];
    for (let i = 0; i < 3; i++) {
            gridComponents[i] = [];
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
                const matrixWrapper = new MatrixComponent({
                    name: matrixName,
                    component: matrix,
                    config: matrixConfig
                });
                gridComponents[i].push(matrixWrapper);
            }
        }
    this.component = gridComponents
    }
}
