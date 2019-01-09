import { selectElement } from 'muze-utils';
import {
     TOP, BOTTOM, ROW_SPAN, COL_SPAN, CENTER, ROW, COLUMN
} from '../enums/constants';

const orderMaker = arr => Array.from(Array(arr.length).keys());

const nestByStack = (stack, updateArr, optionalParams = {}) => {
    let {
        order,
        keyFn
    } = optionalParams;
    const arr = updateArr.slice();
    const currStack = stack.slice();
    const prevStack = currStack.slice();
    // Order in which element are to be checked for nesting, default normal looping
    // Order is always in the order of nest, i.e., left to right
    order = order || Array.from(Array(arr.length).keys());

    // Key function, if array of objects
    keyFn = keyFn || (v => v);

    // Return same array if stack is empty
    if (currStack.length === 0) {
        const newArr = [];
        order.forEach((e) => {
            newArr.push(arr[e]);
        });
        return { prevStack, currStack: arr, arr: newArr };
    }

    let arrVal = '';
    let stackVal = '';
    const newArr = [];

    // Loop in order
    for (let i = order.length - 1; i >= 0; i--) {
        // Get current element index from the order given
        const currElemIndex = order[i];

        // Crete a hashmap for the hierarchy by joining strings of the array for both stack and input array
        arrVal += keyFn(arr[currElemIndex]);
        stackVal += keyFn(currStack[currElemIndex]);

        // If the current value and value in stack is same, convert it to null
        if (arrVal === stackVal) {
            newArr[currElemIndex] = null;
        } else {
            stackVal = '';
            // Loop from the current index in order to the last element in order to change the
            // whole hierarchy
            for (let j = i; j < order.length; j++) {
                const newElem = order[j];
                const arrElem = arr[newElem];

                newArr[newElem] = arrElem;

                // Reset stack to new stack
                currStack[newElem] = arrElem;
                stackVal = arrVal;
            }
        }
    }
    const returnArr = [];
    order.forEach((e) => {
        returnArr.push(newArr[e]);
    });
    return { prevStack, currStack, arr: returnArr };
};

const spanCalculator = (colData, colIdx, matrix, rIdx) => {
    // if data is not header cell then rowspan
    // has to be 1
    if (!colData) {
        return () => 1;
    }

    const conditions = {
        row: count => matrix[rIdx + count] && matrix[rIdx + count][colIdx],
        column: count => matrix[rIdx][colIdx + count]
    };

    return (type) => {
        let count = 1;
        let isNull = false;

        while (!isNull) {
            if (conditions[type](count) === null) {
                count += 1;
            } else {
                isNull = true;
            }
        }
        return count;
    };
};

const maskCreator = (matrix, order) => ({
    row: () => {
        let stack = [];
        return matrix.map((e) => {
            const {
                    currStack,
                    arr
                } = nestByStack(stack, e, { keyFn: val => val.valueOf(), order });

            stack = currStack;
            return arr;
        });
    },
    column: () => {
        let stack = [];
        const viewMatrix = [];
        matrix.length && matrix[0].forEach((cell, colIndex) => {
            const hierarchy = [];
            matrix.forEach((row) => {
                hierarchy.push(row[colIndex]);
            });
            const {
                    currStack,
                    arr
                } = nestByStack(stack, hierarchy, { keyFn: val => val.valueOf(), order });
            stack = currStack;

            matrix.forEach((row, rowIndex) => {
                viewMatrix[rowIndex] = viewMatrix[rowIndex] || [];
                viewMatrix[rowIndex][colIndex] = arr[rowIndex];
            });
        });
        return viewMatrix;
    }
});

const spanGenerator = viewMatrix => ({
    row: () => {
        const spans = [];
        viewMatrix.forEach((row, ridx) => {
            spans[ridx] = spans[ridx] || [];
            row.forEach((col, i) => {
                if (viewMatrix[ridx][i]) {
                    const currSpan = spanCalculator(col, i, viewMatrix, ridx)('row');
                    currSpan && spans[ridx].push(currSpan);
                }
            });
        });
        return spans;
    },
    column: () => viewMatrix.map((row, ridx) => row.map((col, i) => spanCalculator(col, i, viewMatrix, ridx)('column'))
                    .filter(col => col !== 1))
});

const getOrder = isReverse => ({
    row: (matrix) => {
        if (isReverse) {
            return orderMaker(matrix[0]).reverse();
        }
        return orderMaker(matrix[0]);
    },
    column: (matrix) => {
        if (isReverse) {
            return orderMaker(matrix).reverse();
        }
        return orderMaker(matrix);
    }
});

const matrixSpanGeneratorMap = {
    [`${TOP}-1`]: {
        orderGetter: getOrder(false)[COLUMN],
        viewMatrixMaker: (...params) => maskCreator(...params)[COLUMN],
        spanMaker: (...params) => spanGenerator(...params)[COLUMN]
    },
    [`${BOTTOM}-1`]: {
        orderGetter: getOrder(true)[COLUMN],
        viewMatrixMaker: (...params) => maskCreator(...params)[COLUMN],
        spanMaker: (...params) => spanGenerator(...params)[COLUMN]
    },
    [`${CENTER}-0`]: {
        orderGetter: getOrder(false)[ROW],
        viewMatrixMaker: (...params) => maskCreator(...params)[ROW],
        spanMaker: (...params) => spanGenerator(...params)[ROW]
    },
    [`${CENTER}-2`]: {
        orderGetter: getOrder(true)[ROW],
        viewMatrixMaker: (...params) => maskCreator(...params)[ROW],
        spanMaker: (...params) => spanGenerator(...params)[ROW]
    }
};

const matrixSpanGenerator = (type) => {
    const generator = matrixSpanGeneratorMap[type];
    if (generator) {
        return generator;
    }
    return {
        orderGetter: () => null,
        viewMatrixMaker: matrix => () => matrix,
        spanMaker: () => () => null
    };
};

/**
 * This function is used to set the col and row spans
 * for the matrices based on repeated/hierarchichal data
 *
 * @export
 * @param {Array} matrix The 2d array for which filtering is to be done
 * @param {string} type Type of array (center, top, bottom)
 * @param {number} index Index of array in the row
 * @return {Object} containing the view matrix and their spans
 */
export function cellSpanMaker (matrix, type, index) {
    let spans = null;
    let viewMatrix = matrix;
    const {
        orderGetter,
        viewMatrixMaker,
        spanMaker
    } = matrixSpanGenerator(`${type}-${index}`);

    if (matrix.length) {
        const order = orderGetter(matrix);
        viewMatrix = viewMatrixMaker(matrix, order)();
        spans = spanMaker(viewMatrix)();
    }
    return { viewMatrix, spans };
}

const spaceAllocationDueToSpan = (span, placeholder, borderWidth) => {
    const height = placeholder.availHeight();
    const width = placeholder.availWidth();

    return {
        [ROW_SPAN] () {
            selectElement(this).style('height', `${height + borderWidth}px`);
            if (span > 1) {
                selectElement(this).style('height', `${height * span + borderWidth * (span)}px`);
                placeholder.setAvailableSpace(width, height * span);
            }
        },
        [COL_SPAN] () {
            if (span > 1) {
                placeholder.setAvailableSpace(width * span + borderWidth * (span - 1), height);
            }
            selectElement(this).style('height', `${height}px`);
        }
    };
};

const spanApplier = (cells, spans, config, type) => {
    const borderWidth = config.border.width;

    cells.attr(type, function (cell, colIndex) {
        const span = spans[cell.rowIndex][colIndex];
        const placeholder = cell.placeholder;

        spaceAllocationDueToSpan(span, placeholder, borderWidth)[type].bind(this)();
        return span;
    });
};

const spanApplierMap = {
    [`${TOP}-0`]: null,
    [`${TOP}-1`]: (...params) => spanApplier(...params, COL_SPAN),
    [`${TOP}-2`]: null,
    [`${CENTER}-0`]: (...params) => spanApplier(...params, ROW_SPAN),
    [`${CENTER}-1`]: null,
    [`${CENTER}-2`]: (...params) => spanApplier(...params, ROW_SPAN),
    [`${BOTTOM}-0`]: null,
    [`${BOTTOM}-1`]: (...params) => spanApplier(...params, COL_SPAN),
    [`${BOTTOM}-2`]: null
};

export const applySpans = (cells, spans, config, type) => {
    const applier = spanApplierMap[type];
    if (applier) {
        applier(cells, spans, config);
    }
};
