import { mergeRecursive, generateGetterSetters } from 'muze-utils';
import {
    createTree,
    extraCellsRemover,
    combineMatrices,
    spaceTakenByColumn,
    getDistributedHeight,
    getDistributedWidth,
    spaceTakenByRow,
    computeLogicalSpace,
    createMatrixEachLevel,
    createMatrixInstances
  } from '../utils';
import { PROPS } from './props';
import { COLUMN_ROOT, ROW_ROOT, HEIGHT, WIDTH } from '../enums/constants';
import { defaultConfig } from './default-config';

/**
 * This class used to create column / row matrix for GridLayout
 *
 * @class VisualMatrix
 */
export default class VisualMatrix {

    /**
     *Creates an instance of VisualMatrix.
     * @param {any} matrix Two set of matrices
     * @param {any} [config={}] Configuration for VisualMatrix
     * @memberof VisualMatrix
     */
    constructor (matrix, config = {}) {
        // Prepare matrices
        this._lastLevelKey = 0;
        this._primaryMatrix = matrix[0] || [];
        this._secondaryMatrix = matrix[1] || [];
        this._maxMeasures = [];
        this._availableSpace = {};

        // Store the config
        generateGetterSetters(this, PROPS);
        const defCon = Object.assign({}, this.constructor.defaultConfig());
        this.config(mergeRecursive(defCon, config));

        this._breakPointer = this.config().isTransposed ? matrix[0].length :
            (matrix[0].length > 0 ? matrix[0][0].length : 0);
        this._layoutMatrix = combineMatrices([matrix[0] || [], matrix[1] || []], this.config());

        // Create Tree
        this._tree = {
            key: this.config().isTransposed ? COLUMN_ROOT : ROW_ROOT,
            values: this.createTree()
        };
        this._logicalSpace = this.setLogicalSpace();
    }


    primaryMatrix (...params) {
        if (params.length) {
            return this;
        }
        return this._primaryMatrix;
    }


    secondaryMatrix (...params) {
        if (params.length) {
            return this;
        }
        return this._secondaryMatrix;
    }


    tree (...params) {
        if (params.length) {
            return this;
        }
        return this._tree;
    }


    static defaultConfig () {
        return defaultConfig;
    }


    createTree () {
        const { tree, lastLevelKey } = createTree(this);
        this._lastLevelKey = lastLevelKey;
        return tree;
    }

    /**
     * Computes the logical space taken by the entire matrixTree
     *
     * @return {Object} Logical space taken
     * @memberof VisualMatrix
     */
    setLogicalSpace () {
        const {
            isTransposed
        } = this.config();
        const matrixTree = this.tree();
        createMatrixEachLevel(matrixTree, isTransposed);
        return computeLogicalSpace(matrixTree, this.config(), this.maxMeasures());
    }

    /**
     * Returns the space taken by visual matrix
     *
     * @return {Object} space taken by the matrix
     * @memberof VisualMatrix
     */
    getLogicalSpace () {
        return this.logicalSpace();
    }

    /**
     * Sets the provied space to the visual matrix
     *
     * @param {number} width width provided
     * @param {number} height height provided
     * @memberof VisualMatrix
     */
    setAvailableSpace (width, height) {
        this.availableSpace({ width, height });
        const tree = this.tree();
        const heightMeasures = this.populateMaxMeasures(HEIGHT, tree);
        const widthMeasures = this.populateMaxMeasures(WIDTH, tree);
        const depth = this.calculateDepth(widthMeasures, heightMeasures);

        this.viewableMatrix = this.createViewPortMatrix(depth);
        this.viewableMeasures = this.redistribute(this.viewableMatrix, width, height);
        return this;
    }

    /**
     * Populate the max measures in the array
     *
     * @param {Array} measures array to be filled with max measures
     * @param {Object} matrixTree matrix tree of visual matrix
     * @param {number} measure width or height
     * @param {number} [depth=0] depth of the tree that to be calculated
     * @memberof VisualMatrix
     */
    populateMaxMeasures (type, matrixTree, depth = 0, measures = []) {
        measures[depth] = Math.max(measures[depth] || 0, matrixTree.space[type]);
        if (matrixTree.values) {
            const childDepth = depth + 1;
            matrixTree.values.forEach((child) => {
                if (child.space) {
                    measures = this.populateMaxMeasures(type, child, childDepth, measures);
                }
            });
        }
        return measures;
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
        let j;
        const { height, width } = this.availableSpace();

        for (i = 0; i < heightMeasures.length; i++) {
            if (heightMeasures[i] <= height) break;
        }
        for (j = 0; j < widthMeasures.length; j++) {
            if (widthMeasures[j] <= width) break;
        }
        return Math.min(widthMeasures.length - 1, Math.max(i, j));
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
            const maxMeasures = isTransposed ? this.redistributeColumnWise(options) : this.redistributeRowWise(options);
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
     * Gets the viewable measures for the current viewable matrix
     *
     * @return {Object} Set of viewable measures
     * @memberof VisualMatrix
     */
    getViewableSpaces () {
        return this.viewableMeasures;
    }

    /**
     * Returns the matrix that can be viewed in the current viewport
     *
     * @return {Array} Set of matrices that can be viewed
     * @memberof VisualMatrix
     */
    getViewableData () {
        return this.viewableMatrix;
    }

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
        if (!isTransposed) {
            tree.matrix = extraCellsRemover(tree.matrix, begCellLen, endCellLen);
        } else {
            tree.matrix = tree.matrix.map(e => extraCellsRemover(e, begCellLen, endCellLen));
        }
        return {
            tree,
            layoutMatrix
        };
    }

    /**
     * Creates the viewport that can be viewed together
     *
     * @param {number} depth maxDepth that can be viewed in the viewport
     * @return {Array<Object>} Set of matrices that can be viewed
     * @memberof VisualMatrix
     */
    createViewPortMatrix (depth) {
        const arr = [];
        createMatrixInstances(arr, depth, this.removeExtraCells(), this);
        return arr;
    }

    /**
     * Distibutes the given space row wisely
     *
     * @param {Object} options Redistribution information
     * @memberof VisualMatrix
     */
    redistributeRowWise (options) {
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
        if (maxWidth > 0) {
            cWidths = maxMeasures.map(space => space + (width - maxWidth) * (space / maxWidth));
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
     * Distibutes the given space column wisely
     *
     * @param {Object} options Redistribution information
     * @memberof VisualMatrix
     */
    redistributeColumnWise (options) {
        let rHeights = [];
        const { matrix, width, maxHeights, maxWidths } = options;
        const borderWidth = this.config().unitMeasures.border;
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
        let indices = [];
        let unitMeasures = [];
        let mainMeasures = [];
        let computedMeasures = [];
        const {
            isTransposed,
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

                if (!isTransposed) {
                    cell.setAvailableSpace(colWidth, colHeight - borderWidth);
                    indices = [rIdx, cIdx];
                    unitMeasures = [columnWidths, rowHeights];
                    mainMeasures = [widths, heights];
                    computedMeasures = [colWidth, colHeight];
                } else {
                    cell.setAvailableSpace(colWidth - borderWidth, colHeight);
                    indices = [cIdx, rIdx];
                    unitMeasures = [rowHeights, columnWidths];
                    mainMeasures = [heights, widths];
                    computedMeasures = [colHeight, colWidth];
                }

                if (indices[0] === 0 && indices[1] < breakPointer) {
                    unitMeasures[0][0][indices[1]] = computedMeasures[0];
                    mainMeasures[0][0] = (mainMeasures[0][0] || 0) + computedMeasures[0];
                } else if (indices[0] === 0 && indices[1] >= breakPointer) {
                    unitMeasures[0][1][indices[1] - breakPointer] = computedMeasures[0];
                    mainMeasures[0][1] = (mainMeasures[0][1] || 0) + computedMeasures[0];
                }
                if (indices[1] === this._lastLevelKey) {
                    unitMeasures[1][0][indices[0]] = computedMeasures[1];
                    unitMeasures[1][1][indices[0]] = computedMeasures[1];
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

