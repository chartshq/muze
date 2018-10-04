import { mergeRecursive } from 'muze-utils';
import {
    extraCellsRemover,
    getDistributedWidth,
    spaceTakenByRow
  } from '../utils';
import { COLUMN_ROOT } from '../enums/constants';
import VisualMatrix from './visual-matrix';

/**
 * This class used to create column / row matrix for GridLayout
 *
 * @class VisualMatrix
 */
export default class ColumnVisualMatrix extends VisualMatrix {

    /**
     *Creates an instance of VisualMatrix.
     * @param {any} matrix Two set of matrices
     * @param {any} [config={}] Configuration for VisualMatrix
     * @memberof VisualMatrix
     */
    constructor (matrix, config = {}) {
        super(matrix, config);

        this._breakPointer = matrix[0].length;

        // Create Tree
        this._tree = {
            key: COLUMN_ROOT,
            values: this.createTree()
        };
        this._logicalSpace = this.setLogicalSpace();
    }

    /**
     * Redistributes the provied space to all cells
     *
     * @param {*} viewableMatrix current viewport matrix
     * @param {*} width provied width
     * @param {*} height provied height
     * @return {Object} current viewports matrixes with measures
     * @memberof VisualMatrix
     */
    redistribute (viewableMatrix, width, height) {
        let maxHeights = [];
        let maxWidths = [];
        const {
            isTransposed
        } = this.config();

        viewableMatrix.forEach((matrixInst) => {
            const matrix = matrixInst.matrix;
            const mWidth = 0;
            const mHeight = 0;
            const options = { mWidth, mHeight, matrix, width, height, maxHeights, maxWidths };
            const maxMeasures = this.redistributeColumnWise(options);
            maxWidths = maxMeasures.maxWidths;
            maxHeights = maxMeasures.maxHeights;
        });

        const measurements = viewableMatrix.map((matrixInst, i) => {
            let heightMeasures;
            let columnMeasures;
            const cellDimOptions = { matrixInst, maxWidths, maxHeights, matrixIndex: i };
            const { heights, widths, rowHeights, columnWidths } = this.getCellDimensions(cellDimOptions);

            if (!isTransposed) {
                heightMeasures = [height, height];
                columnMeasures = widths;
            } else {
                heightMeasures = heights;
                columnMeasures = [width, width];
            }
            return {
                rowHeights: {
                    primary: rowHeights[0],
                    secondary: rowHeights[1]
                },
                columnWidths: {
                    primary: columnWidths[0],
                    secondary: columnWidths[1]
                },
                height: {
                    primary: heightMeasures[0],
                    secondary: heightMeasures[1]
                },
                width: {
                    primary: columnMeasures[0],
                    secondary: columnMeasures[1]
                }
            };
        });

        return measurements;
    }

    /**
     *
     *
     * @return
     * @memberof VisualMatrix
     */
    removeExtraCells () {
        const {
            isTransposed,
            extraCellLengths
        } = this.config();
        const matrix = this._layoutMatrix;
        const tree = mergeRecursive({}, this.tree());
        const begCellLen = extraCellLengths[0];
        const endCellLen = extraCellLengths[1] || Number.NEGATIVE_INFINITY;
        const layoutMatrix = !isTransposed ? extraCellsRemover(matrix, begCellLen, endCellLen) :
        matrix.slice(0).map(e => extraCellsRemover(e, begCellLen, endCellLen));

        tree.values = extraCellsRemover(tree.values, begCellLen, endCellLen);

        tree.matrix = tree.matrix.map(e => extraCellsRemover(e, begCellLen, endCellLen));

        return {
            tree,
            layoutMatrix
        };
    }

    /**
     * Distibutes the given space column wisely
     *
     * @param {Object} options Redistribution information
     * @memberof VisualMatrix
     */
    redistributeColumnWise (options) {
        let rHeights = [];
        const { matrix, width, height, maxHeights, maxWidths } = options;
        const borderWidth = this.config().unitMeasures.border;
        const priority = this.config().priority;
        const mWidth = spaceTakenByRow(matrix[this._lastLevelKey]).width;
        const cWidths = getDistributedWidth({
            row: matrix[this._lastLevelKey],
            width: mWidth,
            availableWidth: width
        }, this.config());

        matrix.forEach((row, rIdx) => row.forEach((col, cIdx) => {
            const oldLogicalSpace = col.getLogicalSpace().height;
            col.setAvailableSpace(cWidths[cIdx] - borderWidth, oldLogicalSpace);
            rHeights[rIdx] = Math.max(rHeights[rIdx] || 0, col.getLogicalSpace().height);
        }));

        if (maxHeights.length > 0) {
            rHeights = rHeights.map((e, i) => Math.max(e, maxHeights[0][i]));
        }

        maxHeights.push(rHeights);

        for (let x = 0; x < maxHeights.length; x++) {
            maxHeights[x] = rHeights;
        }
        maxWidths.push(cWidths);
        return { maxHeights, maxWidths };
    }

    /**
     * Dispatch the calculated cell dimensions to all the cells
     *
     * @param {Object} options cell dimension information
     * @return {Object} row and column heights / widths
     * @memberof VisualMatrix
     */
    getCellDimensions (options) {
        const {
            unitMeasures: measures
        } = this.config();
        const borderWidth = measures.border;
        const { matrixInst, maxWidths, maxHeights, matrixIndex } = options;
        const matrix = matrixInst.matrix;
        const rowHeights = [[0], [0]];
        const columnWidths = [[0], [0]];
        const heights = [0, 0];
        const widths = [0, 0];
        const breakPointer = this._breakPointer;

        matrix.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                const colHeight = maxHeights[matrixIndex][rIdx] || 0;
                const colWidth = maxWidths[matrixIndex][cIdx];

                cell.setAvailableSpace(colWidth - borderWidth, colHeight);
                if (cIdx === 0 && rIdx < breakPointer) {
                    rowHeights[0][rIdx] = colHeight;
                    heights[0] = (heights[0] || 0) + colHeight;
                } else if (cIdx === 0 && rIdx >= breakPointer) {
                    rowHeights[1][rIdx - breakPointer] = colHeight;
                    heights[1] = (heights[1] || 0) + colHeight;
                }
                if (rIdx === this._lastLevelKey) {
                    columnWidths[0][cIdx] = colWidth;
                    columnWidths[1][cIdx] = colWidth;
                }
            });
        });
        return {
            heights,
            widths,
            rowHeights,
            columnWidths
        };
    }
}

