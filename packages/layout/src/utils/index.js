/**
 * This file exports utility functions that are used across the layout module
 */
import { Symbols } from 'muze-utils';
import { PRIMARY, SECONDARY, HEIGHT, WIDTH } from '../enums/constants';

const nest = Symbols.nest;
/**
 *
 *
 * @param {*} isTransposed
 *
 */
const getMeasureInfo = (isTransposed) => {
    if (isTransposed) {
        return {
            firstMeasure: HEIGHT,
            secondMeasure: WIDTH
        };
    }
    return {
        firstMeasure: WIDTH,
        secondMeasure: HEIGHT
    };
};

/**
 *
 *
 * @param {*} i
 * @param {*} page
 *
 */
const findInPage = (i, page) => {
    let count = 0;
    for (const x in page) {
        if (i < page[x]) {
            count = x;
            break;
        }
    }
    return count;
};

/**
 * Creates a single matrix from two matrices
 *
 * @param {Array<Array>} matrix Input matrix
 * @return {Array<Array>} Joined matrix
 * @memberof VisualMatrix
 */
export const combineMatrices = (matrix, config) => {
    const { isTransposed } = config;
    let joinedMatrix = matrix[0].length > 0 ? matrix[0] : matrix[1];
    if (isTransposed) {
        joinedMatrix = matrix[0].length > 0 ? [...matrix[0]] : [];
        joinedMatrix = matrix[1].length > 0 ? [...joinedMatrix, ...matrix[1]] : joinedMatrix;
    } else {
        joinedMatrix = joinedMatrix.map((row, rowIndex) => {
            let rowData = [];
            if (matrix[0].length > 0) {
                rowData = [...matrix[0][rowIndex]];
            }
            if (matrix[1].length > 0) {
                rowData = [...rowData, ...matrix[1][rowIndex]];
            }
            return rowData;
        });
    }
    return joinedMatrix;
};

/**
 * Creates a hirachical tree from the context
 *
 * @param {Object} context context for creating tree
 * @return {Object} nested tree
 */
export const createTree = (context) => {
    let matrixTree = {};
    let lastLevelKey = 0;
    let facet = PRIMARY;
    const nestFn = nest();
    const keys = [];
    const layoutMatrix = context._layoutMatrix;
    const primaryMatrix = context.primaryMatrix();
    const secondaryMatrix = context.secondaryMatrix();
    const { isTransposed, breakPage } = context.config();

    if (!isTransposed) {
        if (primaryMatrix.length === 0) {
            facet = PRIMARY;
        } else if (secondaryMatrix.length === 0) {
            facet = SECONDARY;
        } else {
            facet = primaryMatrix.length >= secondaryMatrix.length ? PRIMARY : SECONDARY;
        }
        if (primaryMatrix.length > 0) {
            for (let i = 0; i < primaryMatrix[0].length - 1; i++) {
                keys.push(i);
            }
            keys.push(primaryMatrix[0].length - 1);
            if (facet === SECONDARY || secondaryMatrix.length === 0) {
                lastLevelKey = primaryMatrix[0].length - 1;
            }
        }
        if (secondaryMatrix.length > 0) {
            const keyLength = primaryMatrix.length > 0 ? primaryMatrix[0].length : 0;
            for (let i = secondaryMatrix[0].length - 1; i > 0; i--) {
                keys.push(i + keyLength);
            }
            keys.push(keyLength);

            if (facet === PRIMARY) {
                lastLevelKey = keyLength;
            }
        } else {
            lastLevelKey = primaryMatrix.length > 0 ? primaryMatrix[0].length - 1 : 0;
        }
        keys.forEach((key) => {
            let counter = -1;
            return nestFn.key((d) => {
                counter++;
                return `${d[key].valueOf()}-${findInPage(counter, breakPage)}`;
            });
        });
        matrixTree = nestFn.entries(layoutMatrix);
    } else {
        if (primaryMatrix.length === 0) {
            facet = PRIMARY;
        } else if (secondaryMatrix.length === 0) {
            facet = SECONDARY;
        } else {
            facet = primaryMatrix.length >= secondaryMatrix.length ? PRIMARY : SECONDARY;
        }
        if (primaryMatrix.length > 0) {
            for (let i = 0; i < primaryMatrix.length - 1; i++) {
                keys.push(i);
            }
            // if (facet === PRIMARY) {
            keys.push(primaryMatrix.length - 1);
            // } else {
            if (facet === SECONDARY) {
                lastLevelKey = primaryMatrix.length - 1;
            }
        }
        if (secondaryMatrix.length > 0) {
            const primaryMatrixLength = primaryMatrix.length;
            for (let i = secondaryMatrix.length - 1; i > 0; i--) {
                keys.push(i + primaryMatrixLength);
            }
            // if (facet === SECONDARY) {
            keys.push(primaryMatrixLength);
            // }
            if (facet === PRIMARY) {
                lastLevelKey = primaryMatrixLength;
            }
        }
        keys.forEach((key) => {
            let counter = -1;
            return nestFn.key((d) => {
                counter++;
                return `${d[key].valueOf()}-${findInPage(counter, breakPage)}`;
            });
        });
        let newMatrix = [];
        newMatrix = layoutMatrix[0].map((col, colIndex) => layoutMatrix.map(row => row[colIndex]));
        matrixTree = nestFn.entries(newMatrix);
    }
    return { tree: matrixTree, lastLevelKey };
};

/**
 * Gives the min measues
 *
 * @param {boolean} isTransposed is column matrix
 * @param {Object} unitMeasures min measures to be given to cells
 * @return {Object} dimension min cell
 */
export const getMinMeasures = (isTransposed, unitMeasures) => {
    if (!isTransposed) {
        return {
            height: unitMeasures.height,
            width: 0
        };
    }
    return {
        height: 0,
        width: unitMeasures.width
    };
};

/**
 * Get the logical space from the tree
 *
 * @param {Node} item tree to be calculated
 * @param {number} measures width and height
 * @param {Array} minMeasures min measures for a cell
 * @param {Array} maxMeasure max measures for a col/row
 * @return {Object} dimension
 */
export const getLogicalSpace = (item, measures, minMeasures, maxMeasure = []) => {
    const { firstMeasure, secondMeasure } = measures;
    let firstMeasureValue = 0;
    let secondMeasureValue = 0;
    item.values.forEach((valueArray) => {
        let fMeasure = 0;
        let sMeasure = 0;
        valueArray.forEach((placeholder, colIndex) => {
            placeholder.setAvailableSpace();
            const space = placeholder.getLogicalSpace();
            const minSecondMeasure = placeholder.getMinMeasures(minMeasures[secondMeasure]);

            sMeasure = Math.max(sMeasure, +space[secondMeasure], minSecondMeasure);
            maxMeasure[colIndex] = Math.max(maxMeasure[colIndex] || 0, space[firstMeasure]);
            fMeasure += +maxMeasure[colIndex];
        });
        secondMeasureValue += sMeasure;
        firstMeasureValue = Math.max(firstMeasureValue, fMeasure);
        item.space = {
            [secondMeasure]: Math.ceil(secondMeasureValue),
            [firstMeasure]: Math.ceil(firstMeasureValue)
        };
    });
    return {
        [secondMeasure]: secondMeasureValue,
        [firstMeasure]: firstMeasureValue
    };
};

/**
 * Computes the logical spcae taken by the matrix tree
 *
 * @param {*} [item={}] tree to be viewed
 * @param {boolean} [isTransposed=false] is column matrix
 * @param {*} unitMeasures min measues for a cell
 * @param {Array} maxMeasure max measures for a col/row
 * @return {Object} logical space taken
 */
export const computeLogicalSpace = (item = {}, config, maxMeasures) => {
    const { isTransposed = false, unitMeasures } = config;
    const { firstMeasure, secondMeasure } = getMeasureInfo(isTransposed);
    const { values } = item;
    const minMeasures = getMinMeasures(isTransposed, unitMeasures);

    if (values[0].key) {
        const logicalSpace = { [firstMeasure]: 0, [secondMeasure]: 0 };

        values.forEach((valueItem) => {
            // Compute logical space for lowest level
            const space = computeLogicalSpace(valueItem, config, maxMeasures);
            // Set logical space for first measure
            logicalSpace[firstMeasure] = Math.max(logicalSpace[firstMeasure], space[firstMeasure],
                minMeasures[firstMeasure]);

            // Set logical space for second measure
            logicalSpace[secondMeasure] += +space[secondMeasure];
        });
        item.space = logicalSpace;
        return logicalSpace;
    }

    return getLogicalSpace(item, { firstMeasure, secondMeasure }, minMeasures, maxMeasures);
};

/**
 * Gives the space taken by a row
 *
 * @param {Array} row matrix array of rows
 * @return {Object} dimension of the row
 */
export const spaceTakenByRow = (row) => {
    let height = 0;
    let width = 0;
    row.forEach((col) => {
        const spaces = col.getLogicalSpace();
        height = Math.max(height, spaces.height);
        width += spaces.width;
    });
    return {
        width,
        height
    };
};

/**
 * Gives the space taken by a column
 *
 * @param {Array<Array>} matrix column matrix
 * @param {number} colIndex column index
 * @return {Object} dimension of the column
 */
export const spaceTakenByColumn = (matrix, colIndex) => {
    let height = 0;
    let width = 0;
    matrix.forEach((row) => {
        const col = row[colIndex];
        const spaces = col.getLogicalSpace();
        width = Math.max(width, spaces.width);
        height += spaces.height;
    });
    return {
        width,
        height
    };
};

/**
 * Creates different level matrices
 *
 * @param {Object} item matrix tree
 * @param {boolean} isTransposed is column matrix
 * @return {Object} matrix of each level
 */
export const createMatrixEachLevel = (item, isTransposed) => {
    if (item.values[0].key) {
        const arr = [];
        item.values.forEach((child) => {
            if (!isTransposed) {
                arr.push(...createMatrixEachLevel(child, isTransposed));
            } else {
                const eachLevel = createMatrixEachLevel(child, isTransposed);
                eachLevel.forEach((e, i) => {
                    arr[i] = arr[i] || [];
                    arr[i].push(...e);
                });
            }
        });
        item.matrix = arr;
        return arr;
    }
    if (!isTransposed) {
        item.matrix = item.values;
    } else {
        item.matrix = item.values[0].map((col, colIndex) => item.values.map(row => row[colIndex]));
    }
    return item.matrix;
};

/**
 * Breaks the matrix into two part
 *
 * @param {Array<Array>} matrix input matrix
 * @param {boolean} isTransposed is column matrix
 * @param {number} breakPointer point in matrix where it is to be broken
 * @return {Array} two broken matrix
 */
export const breakMatrix = (matrix, isTransposed, breakPointer) => {
    const primaryMatrix = [];
    const secondaryMatrix = [];
    if (isTransposed) {
        matrix.forEach((row, rowIndex) => {
            if (rowIndex >= breakPointer) {
                secondaryMatrix.push(row);
            } else {
                primaryMatrix.push(row);
            }
        });
    } else {
        matrix.forEach((row, rowIndex) => {
            row.forEach((column, columnIndex) => {
                if (columnIndex >= breakPointer) {
                    secondaryMatrix[rowIndex] = secondaryMatrix[rowIndex] || [];
                    secondaryMatrix[rowIndex].push(column);
                } else {
                    primaryMatrix[rowIndex] = primaryMatrix[rowIndex] || [];
                    primaryMatrix[rowIndex].push(column);
                }
            });
        });
    }
    return [primaryMatrix, secondaryMatrix];
};

/**
 * Distributed width returned
 *
 * @param {Object} context context for the width distibution
 * @return {number} distributed widths
 */
export const getDistributedWidth = (context, layoutConfig) => {
    const {
        availableWidth,
        width,
        row
    } = context;
    const {
        isDistributionEqual,
        isTransposed,
        distribution
    } = layoutConfig;
    let distSum = 0;
    if (distribution && distribution[0]) {
        distSum = distribution.reduce((t, n) => {
            t += n;
            return t;
        });
    }
    return row.map((col, colIndex) => {
        const space = col.getLogicalSpace().width;
        let distWidth = (space + (availableWidth - width) * (space / width));
        if (isTransposed) {
            if (distribution.length > 0) {
                distWidth = (availableWidth * distribution[colIndex] / distSum);
            } else if (isDistributionEqual || width === 0) {
                const rowLen = row.length;
                distWidth = (availableWidth / rowLen);
            }
        }
        return Math.floor(distWidth);
    });
};

/**
 * Distributeed heights returned
 *
 * @param {Object} context input for the height distribution
 * @return {Object} distribured heights
 */
export const getDistributedHeight = (context) => {
    let distSum = 0;
    let gutterSum = 0;
    let heightWithoutGutter = 0;
    const {
        isTransposed,
        distribution,
        availableHeight,
        height,
        isDistributionEqual,
        gutter,
        matrix,
        cIdx
    } = context;

    if (distribution && distribution[0] !== undefined) {
        distSum = distribution.reduce((t, n) => {
            t += n;
            return t;
        });
    }
    if (gutter && gutter[0] !== undefined) {
        gutterSum = gutter.reduce((t, n) => {
            t += n;
            return t;
        });
    }
    heightWithoutGutter = availableHeight - Math.floor(availableHeight * gutterSum);

    const colLen = matrix.length;
    return matrix.map((row, rIdx) => {
        const col = row[cIdx];
        const space = col.getLogicalSpace().height;
        let distHeight = (space + (heightWithoutGutter - height) * (space / height));

        if (!isTransposed) {
            if (distribution.length > 0 && colLen === distribution.length) {
                distHeight = (heightWithoutGutter * distribution[rIdx] / distSum);
            } else if (isDistributionEqual || context.height === 0) {
                distHeight = (heightWithoutGutter / colLen);
            }
        }
        return Math.floor(distHeight);
    });
};

/**
 *
 *
 * @param {*} arr
 * @param {*} beg
 * @param {*} end
 */
export const extraCellsRemover = (arr, beg, end) => arr.slice(beg, -end);

/**
 * Creates matrix instancess
 *
 * @param {Array} [arr=[]] mutated arry
 * @param {number} depth depth of the tree
 * @param {Array} matrixInfo Details about the matrix(tree, etc) to be inserted
 * @param {boolean} layout Instance of layout
 */
export const createMatrixInstances = (arr = [], depth, matrixInfo, layout) => {
    const breakPointer = layout._breakPointer;
    const config = layout.config();
    const {
        isTransposed
    } = config;
    const {
        tree,
        layoutMatrix
    } = matrixInfo;

    if (depth === 0) {
        const brokenMatrix = breakMatrix(tree.matrix, isTransposed, breakPointer);
        arr.push({
            matrix: tree.matrix,
            primaryMatrix: brokenMatrix[0],
            secondaryMatrix: brokenMatrix[1],
            space: tree.space
        });
        return arr;
    }
    const nextLevel = depth - 1;
    tree.values.forEach((e) => {
        createMatrixInstances(arr, nextLevel, {
            tree: e,
            layoutMatrix
        }, layout);
    });
    return arr;
};
