import { mergeRecursive } from 'muze-utils';
import {
    extraCellsRemover,
    getDistributedWidth,
    spaceTakenByRow,
    createMatrixEachLevel,
    computeLogicalSpace
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
        this._logicalSpace = this.computeLogicalSpace();
    }

    /**
     * Computes the logical space taken by the entire matrixTree
     *
     * @return {Object} Logical space taken
     * @memberof VisualMatrix
     */
    computeLogicalSpace () {
        const matrixTree = this.tree();
        createMatrixEachLevel(matrixTree, true);
        return computeLogicalSpace(matrixTree, this.config(), this.maxMeasures());
    }

    computeViewableSpaces (measures) {
        const {
            maxHeights,
            maxWidths,
            height,
            width
        } = measures;

        return this.viewableMatrix.map((matrixInst, i) => {
            const cellDimOptions = { matrixInst, maxWidths, maxHeights, matrixIndex: i, height };
            const {
                heights,
                rowHeights,
                columnWidths
            } = this.getCellDimensions(cellDimOptions);
            const heightMeasures = heights;
            const columnMeasures = [width, width];

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

        tree.matrix = tree.matrix.map(e => extraCellsRemover(e, begCellLen, endCellLen));

        return {
            tree,
            layoutMatrix
        };
    }

    getPriorityDistribution (measures) {
        const {
            height,
            maxHeights
        } = measures;
        let remainingHeight = height;
        let heightDist = [];
        let conditions = [];
        let divider = 2;
        const priority = this.config().priority;
        const primaryMatrixLength = this.primaryMatrix().length;

        if (priority === 2) {
            conditions = [primaryMatrixLength - 1, primaryMatrixLength];
            divider = 2;
        } else {
            conditions = priority === 0 ? [primaryMatrixLength - 1] : [primaryMatrixLength];
            divider = 1;
        }
        maxHeights.forEach((heights, index) => {
            if (conditions.indexOf(index) === -1) {
                heightDist[index] = heights;
                remainingHeight -= heights;
            }
        });
        if (remainingHeight < 0) {
            heightDist = heightDist.map(() => 0);
        } else {
            conditions.forEach((condition) => {
                heightDist[condition] = Math.min(maxHeights[condition], (remainingHeight) / divider);
            });
        }
        return heightDist;
    }

    /**
     * Calculates the depth of the tree that can be viewed
     *
     * @param {Array} widthMeasures array of widths
     * @param {Array} heightMeasures array of heights
     * @return {number} depth of the tree
     * @memberof VisualMatrix
     */
    calculateDepth (widthMeasures) {
        let j;
        const { width } = this.availableSpace();

        for (j = 0; j < widthMeasures.length; j++) {
            if (widthMeasures[j] <= width) break;
        }
        return Math.min(widthMeasures.length - 1, j);
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
    redistributeSpaces (width, height) {
        let maxHeights = [];
        let maxWidths = [];

        this.viewableMatrix.forEach((matrixInst) => {
            const matrix = matrixInst.matrix;
            const mWidth = 0;
            const mHeight = 0;
            const options = { mWidth, mHeight, matrix, width, height, maxHeights, maxWidths };
            const maxMeasures = this.redistributeViewSpaces(options);
            maxWidths = maxMeasures.maxWidths;
            maxHeights = maxMeasures.maxHeights;
        });

        return this.computeViewableSpaces({ height, width, maxHeights, maxWidths });
    }

    /**
     * Distibutes the given space column wisely
     *
     * @param {Object} measures Redistribution information
     * @memberof VisualMatrix
     */
    redistributeViewSpaces (measures) {
        let rHeights = [];
        const {
            matrix,
            width,
            maxHeights,
            maxWidths
        } = measures;
        const borderWidth = this.config().unitMeasures.border;

        const mWidth = spaceTakenByRow(matrix[this._lastLevelKey]).width;
        const cWidths = getDistributedWidth({
            row: matrix[this._lastLevelKey],
            width: mWidth,
            availableWidth: width
        }, this.config());

        matrix.forEach((row, rIdx) => row.forEach((col, cIdx) => {
            const oldLogicalSpace = col.getLogicalSpace();

            col.setAvailableSpace(cWidths[cIdx] - borderWidth, oldLogicalSpace.height);

            rHeights[rIdx] = Math.max(rHeights[rIdx] || 0, Math.floor(col.getLogicalSpace().height));
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
     * @param {Object} measures cell dimension information
     * @return {Object} row and column heights / widths
     * @memberof VisualMatrix
     */
    getCellDimensions (measures) {
        const {
            unitMeasures
        } = this.config();
        const borderWidth = unitMeasures.border;
        const { matrixInst, height, maxWidths, maxHeights, matrixIndex } = measures;
        const matrix = matrixInst.matrix;
        const rowHeights = [[0], [0]];
        const columnWidths = [[0], [0]];
        const heights = [0, 0];
        const widths = [0, 0];
        const breakPointer = this._breakPointer;

        const heightDistribution = this.getPriorityDistribution({ height, maxHeights: maxHeights[0] || [] });

        matrix.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                const colHeight = heightDistribution[rIdx] || 0;
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

