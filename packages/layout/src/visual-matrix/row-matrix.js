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

    getPriorityDistribution (measures) {
        let remainingAvailWidth;
        let remainingWidth;
        let cWidths = [];
        let conditions = [];
        let maxPrioritySpace = 0;
        const {
            matrix,
            width: availableWidth,
            maxMeasures: maxWidths,
            maxWidth: currentWidth,
            height
        } = measures;
        const priority = this.config().priority;
        const primaryMatrixLength = this.primaryMatrix().length ? this.primaryMatrix()[0].length : 0;

        const dist = [];

        remainingAvailWidth = availableWidth;
        remainingWidth = currentWidth;

        if (priority === 2) {
            conditions = [primaryMatrixLength - 1, primaryMatrixLength];
            // divider = Math.min(2, matrixLen);
        } else {
            conditions = priority === 0 ? [primaryMatrixLength - 1] : [primaryMatrixLength];
            // divider = Math.min(1, matrixLen);
        }
        conditions.forEach((i) => {
            dist[i] = maxWidths[i];
            maxPrioritySpace += maxWidths[i];
            remainingAvailWidth -= dist[i];
            remainingWidth -= dist[i];
        });
        matrix[0].forEach((e, i) => {
            if (conditions.indexOf(i) === -1) {
                dist[i] = remainingAvailWidth * (maxWidths[i] / remainingWidth);
            }
        });
        matrix.forEach(row => row.forEach((col, cIdx) => {
            if (conditions.indexOf(cIdx) === -1) {
                col.setAvailableSpace(dist[cIdx], height);

                cWidths[cIdx] = Math.max(cWidths[cIdx] || 0, Math.floor(col.getLogicalSpace().width));
            } else {
                cWidths[cIdx] = 0;
            }
        }));

        const prioritySpace = availableWidth - cWidths.reduce((t, n) => t + n);
        if (prioritySpace < 0) {
            cWidths = cWidths.map(() => 0);
        } else {
            conditions.forEach((i) => {
                cWidths[i] = Math.floor(prioritySpace * (dist[i] / maxPrioritySpace || 1));
            });
        }
        return cWidths;
    }

    /**
     * Calculates the depth of the tree that can be viewed
     *
     * @param {Array} widthMeasures array of widths
     * @param {Array} heightMeasures array of heights
     * @return {number} depth of the tree
     * @memberof VisualMatrix
     */
    calculateDepth (widthMeasures, heightMeasures) {
        let i;
        const { height } = this.availableSpace();

        for (i = 0; i < heightMeasures.length; i++) {
            if (heightMeasures[i] <= height) break;
        }

        return Math.min(widthMeasures.length - 1, i);
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
        const maxMeasures = this.maxMeasures();

        const maxWidth = maxMeasures.reduce((t, n) => {
            t += n;
            return t;
        });
        const logicalWidths = this.getPriorityDistribution({
            matrix: this._layoutMatrix,
            maxWidth,
            maxMeasures,
            width,
            height
        });

        this.viewableMatrix.forEach((matrixInst) => {
            const matrix = matrixInst.matrix;
            const mWidth = 0;
            const mHeight = 0;
            const options = { mWidth, mHeight, matrix, width, height, maxHeights, maxWidths, logicalWidths };
            const measures = this.redistributeViewSpaces(options);
            maxWidths = measures.maxWidths;
            maxHeights = measures.maxHeights;
        });
        return this.computeViewableSpaces({ height, width, maxHeights, maxWidths });
    }

    /**
     * Distibutes the given space row wisely
     *
     * @param {Object} measures Redistribution information
     * @memberof VisualMatrix
     */
    redistributeViewSpaces (measures) {
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
        const { matrix, height, maxHeights, maxWidths, logicalWidths } = measures;
        mHeight = spaceTakenByColumn(matrix, this._lastLevelKey).height;

        const maxWidth = maxMeasures.reduce((t, n) => {
            t += n;
            return t;
        });
        measures.maxMeasures = maxMeasures;
        measures.maxWidth = maxWidth;
        if (maxWidth > 0) {
            cWidths = logicalWidths;
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
        if (maxWidths.length > 0) {
            cWidths = cWidths.map((e, i) => Math.max(e, maxWidths[0][i] || 0));
        }
        maxWidths.push(cWidths);
        for (let x = 0; x < maxWidths.length; x++) {
            maxWidths[x] = cWidths;
        }
        maxHeights.push(rHeights);
        return { maxWidths, maxHeights };
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
        const { matrixInst, maxWidths, maxHeights, matrixIndex } = measures;
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

