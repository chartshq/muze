import { mergeRecursive } from 'muze-utils';
import {
    extraCellsRemover,
    combineMatrices,
    spaceTakenByColumn,
    getDistributedHeight,
    computeLogicalSpace,
    createMatrixEachLevel
  } from '../utils';
import { ROW_ROOT } from '../enums/constants';
import VisualMatrix from './visual-matrix';

/**
 * This class used to create column / row matrix for GridLayout
 *
 * @class VisualMatrix
 */
export default class RowVisualMatrix extends VisualMatrix {

    /**
     *Creates an instance of VisualMatrix.
     * @param {any} matrix Two set of matrices
     * @param {any} [config={}] Configuration for VisualMatrix
     * @memberof VisualMatrix
     */
    constructor (matrix, config = {}) {
        super(matrix, config);

        this._breakPointer = (matrix[0].length > 0 ? matrix[0][0].length : 0);
        this._layoutMatrix = combineMatrices([matrix[0] || [], matrix[1] || []], this.config());

        // Create Tree
        this._tree = {
            key: ROW_ROOT,
            values: this.createTree()
        };
        this._logicalSpace = this.setLogicalSpace();
    }

    /**
     * Computes the logical space taken by the entire matrixTree
     *
     * @return {Object} Logical space taken
     * @memberof VisualMatrix
     */
    setLogicalSpace () {
        const matrixTree = this.tree();
        createMatrixEachLevel(matrixTree, false);
        return computeLogicalSpace(matrixTree, this.config(), this.maxMeasures());
    }

    computeViewableSpaces (measures) {
        const {
            maxHeights,
            maxWidths,
            height
        } = measures;
        return this.viewableMatrix.map((matrixInst, i) => {
            const cellDimOptions = { matrixInst, maxWidths, maxHeights, matrixIndex: i };
            const { widths, rowHeights, columnWidths } = this.getCellDimensions(cellDimOptions);
            const heightMeasures = [height, height];
            const columnMeasures = widths;

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
        tree.matrix = extraCellsRemover(tree.matrix, begCellLen, endCellLen);

        return {
            tree,
            layoutMatrix
        };
    }

    /**
     * Distibutes the given space row wisely
     *
     * @param {Object} options Redistribution information
     * @memberof VisualMatrix
     */
    redistributeViewSpaces (options) {
        let cWidths = [];
        let rHeights = [];
        let mHeight = 0;
        const maxMeasures = this.maxMeasures();
        const {
            isDistributionEqual,
            distribution,
            isTransposed,
            gutter
        } = this.config();
        const { matrix, width, height, maxHeights, maxWidths } = options;

        mHeight = spaceTakenByColumn(matrix, this._lastLevelKey).height;

        const maxWidth = maxMeasures.reduce((t, n) => {
            t += n;
            return t;
        });

        // if (maxWidth > 0) {
        //     const maxLastRowWidth = Math.min(maxMeasures[maxMeasures.length - 1], width / 2);
        //     const remainingAvailWidth = width - maxLastRowWidth;
        //     const remainingWidths = maxWidth - maxLastRowWidth;
        //     cWidths = maxMeasures.map(space => remainingAvailWidth * (space / remainingWidths));
        //     cWidths[cWidths.length - 1] = maxLastRowWidth;
        // }
        if (maxWidth > 0) {
            cWidths = maxMeasures.map(space => width * (space / maxWidth));
        } else {
            cWidths = maxMeasures.map(() => 0);
        }
        rHeights = getDistributedHeight({
            matrix,
            cIdx: this._lastLevelKey,
            height: mHeight,
            availableHeight: height,
            isDistributionEqual,
            distribution,
            isTransposed,
            gutter
        });
        maxWidths.push(cWidths);
        maxHeights.push(rHeights);
        return { maxWidths, maxHeights };
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

                cell.setAvailableSpace(colWidth, colHeight - borderWidth);

                if (rIdx === 0 && cIdx < breakPointer) {
                    columnWidths[0][cIdx] = colWidth;
                    widths[0] = (widths[0] || 0) + colWidth;
                } else if (rIdx === 0 && cIdx >= breakPointer) {
                    columnWidths[1][cIdx - breakPointer] = colWidth;
                    widths[1] = (widths[1] || 0) + colWidth;
                }
                if (cIdx === this._lastLevelKey) {
                    rowHeights[0][rIdx] = colHeight;
                    rowHeights[1][rIdx] = colHeight;
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

