import { ROW_LEFT, ROW_RIGHT, COLUMN_BOTTOM, COLUMN_TOP, TOP, BOTTOM } from '../enums/constants';
/**
 * This callback is used to filter the array of
 * placeholder cells and filter out cells which have
 * appeared in a previous row.
 *
 * @param {Placeholder} colData Instance of placeholder.
 * @param {number} colIdx The index of the placeholder in array.
 * @param {Array} matrix The 2d array for which filtering is to be done
 * @param {number} rIdx The index of the row of the placeholder in array.
 * @param {string} type The type of matrix it is (rowLeft, rowRight, colTop, colBottom)
 * @return {boolean} flag to keep/remove element.
 */
const columnFilter = (colData, colIdx, matrix, rIdx, type) => {
    const previousRow = matrix[rIdx - 1];
    const currentRow = matrix[rIdx];

    // Row Span for left
    if (type === ROW_LEFT) {
        if (!previousRow) {
            return colData;
        }
        let i = 0;
        for (;i <= colIdx; i += 1) {
            if (currentRow[i].valueOf() !== previousRow[i].valueOf()) {
                break;
            }
        }
        return (i - 1 === colIdx) ? null : colData;
    }
    else if (type === ROW_RIGHT) {
        if (!previousRow || colIdx === 0) {
            return colData;
        }
        let j = colIdx;
        for (; j < currentRow.length; j += 1) {
            if (previousRow[j].valueOf() !== currentRow[j].valueOf()) {
                break;
            }
        }
        return (j === currentRow.length) ? null : colData;
    }
    else if (type === COLUMN_BOTTOM) {
        if (rIdx === 0) {
            return colData;
        }
        const prevCell = currentRow[colIdx - 1];
        if (prevCell) {
            if (prevCell.valueOf() === colData.valueOf()) {
                const nextRow = matrix[rIdx + 1];
                if (!nextRow) {
                    return null;
                }
                if (nextRow[colIdx].valueOf() === nextRow[colIdx - 1].valueOf()) {
                    return null;
                }
                return colData;
            }
            return colData;
        }
        return colData;
    }
    else if (type === COLUMN_TOP) {
        if (rIdx === matrix.length - 1 && matrix.length > 1) {
            return colData;
        }
        const prevCell = currentRow[colIdx - 1];
        if (prevCell && (prevCell.valueOf() === colData.valueOf())) {
            const prevRow = matrix[rIdx - 1];
            if (prevRow) {
                if (prevRow[colIdx].valueOf() === prevRow[colIdx - 1].valueOf()) {
                    return null;
                }
                return colData;
            }
            return null;
        }
        return colData;
    }
    return colData;
};

/**
 * This callback is used to calculate the rowspan
 * by checking for repeating entries in subsequent rows
 * at the specified column.
 *
 * @param {Placeholder} colData Instance of placeholder.
 * @param {number} colIdx The index of the placeholder in the array.
 * @param {Array} matrix The 2d array for which filtering is to be done
 * @param {number} rIdx The index of the row of the placeholder in array.
 * @return {number} The row span.
 */
const calcRowSpan = (colData, colIdx, matrix, rIdx) => {
    let count = 1;
    // if data is not header cell then rowspan
    // has to be 1
    if (!colData || typeof colData.valueOf() !== 'string') {
        return 1;
    }
    let isNull = false;
    while (!isNull) {
        if (matrix[rIdx + count] && matrix[rIdx + count][colIdx] === null) {
            count += 1;
        } else {
            isNull = true;
        }
    }
    return count;
};
/**
 * This callback is used to calculate the rowspan
 * by checking for repeating entries in subsequent rows
 * at the specified column.
 *
 * @param {Placeholder} colData Instance of placeholder.
 * @param {number} colIdx The index of the placeholder in the array.
 * @param {Array} matrix The 2d array for which filtering is to be done
 * @param {number} rIdx The index of the row of the placeholder in array.
 * @return {number} The row span.
 */
const calcColSpan = (colData, colIdx, matrix, rIdx) => {
    let count = 1;
    // if data is not header cell then rowspan
    // has to be 1
    if (!colData || typeof colData.valueOf() !== 'string') {
        return 1;
    }
    let isNull = false;
    while (!isNull) {
        if (matrix[rIdx][colIdx + count] === null) {
            count += 1;
        } else {
            isNull = true;
        }
    }
    return count;
};

// create a masking matrix to strip out repeating columns
// and calculate rowspan.
const mask = function(matrix, type) {
    return matrix.map((row, rIdx) => {
        if (type === ROW_LEFT || type === ROW_RIGHT) {
            const filteredRow = row.map((col, colIndex) => columnFilter(col, colIndex, matrix, rIdx, type));
            const temp = [],
                diff = row.length - filteredRow.length;
            for (let i = 0; i < diff; i += 1) {
                temp.push(null);
            }
            if (type === ROW_RIGHT) {
                temp.unshift(...filteredRow);
                return temp;
            }
            temp.push(...filteredRow);
            return temp;
        }

        const filteredRow = row.map((col, colIndex) => columnFilter(col, colIndex, matrix, rIdx, type));
        const temp = [];
        temp.push(...filteredRow);
        return temp;
    });
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
export function cellSpanMaker(matrix, type, index) {
    let span = '';
    if (type === TOP || type === BOTTOM) {
        span = type === TOP ? COLUMN_TOP : COLUMN_BOTTOM;
        const viewMatrix = mask(matrix, span);
        const spans = viewMatrix.map((row, ridx) => row.map((col, i) => calcColSpan(col, i, viewMatrix, ridx))
                        .filter(col => col !== 1));
        return { viewMatrix, spans };
    }
    else if (index === 0 || index === 2) {
        span = index === 0 ? ROW_LEFT : ROW_RIGHT;
        const viewMatrix = mask(matrix, span);
        const spans = [];
        viewMatrix.forEach((row, ridx) => {
            spans[ridx] = spans[ridx] || [];
            row.forEach((col, i) => {
                if (viewMatrix[ridx][i]) {
                    const currSpan = calcRowSpan(col, i, viewMatrix, ridx);
                    currSpan && spans[ridx].push(currSpan);
                }
            });
        });
        return { viewMatrix, spans };
    }
    return { viewMatrix: matrix };
}
