/**
 * Gets view matrices based on current pointers for row and column
 *
 * @param {Object} layout instance of layout
 * @param {number} rowPointer current row pointer
 * @param {number} columnPointer current column pointer
 * @return {Object} returns the view matrix and its relevant information
 */
export const getViewMatrices = (layout, rowPointer, columnPointer) => {
    const rowMatrix = layout.rowMatrix();
    const columnMatrix = layout.columnMatrix();
    const centerMatrix = layout.centerMatrix();
    const matrices = layout.matrices();
    const rowMatrices = rowMatrix.getViewableMatrices();
    const columnMatrices = columnMatrix.getViewableMatrices();
    const centralMatrixPointer = {
        row: 0,
        column: 0
    };

    for (let i = rowPointer - 1; i >= 0; i--) {
        const length = Math.max(rowMatrices[i].primaryMatrix.length,
            rowMatrices[i].secondaryMatrix.length);
        centralMatrixPointer.row += length;
    }
     /* istanbul ignore next */
    for (let i = columnPointer - 1; i >= 0; i--) {
        const matrix = columnMatrices[i];
        const { primaryMatrix, secondaryMatrix } = matrix;
        const length = Math.max(primaryMatrix[0] ? primaryMatrix[0].length : 0,
            secondaryMatrix[0] ? secondaryMatrix[0].length : 0);
        centralMatrixPointer.column += length;
    }

    matrices.top[1] = columnMatrices[columnPointer].primaryMatrix;
    matrices.bottom[1] = columnMatrices[columnPointer].secondaryMatrix;

    matrices.center[0] = rowMatrices[rowPointer].primaryMatrix;
    matrices.center[2] = rowMatrices[rowPointer].secondaryMatrix;

    const rowMatrixLen = Math.max(matrices.center[0].length, matrices.center[2].length);
     /* istanbul ignore next */
    const columnMatrixLen = Math.max(matrices.top[1][0] ? matrices.top[1][0].length : 0, matrices.bottom[1][0] ?
            matrices.bottom[1][0].length : 0);
    matrices.center[1] = centerMatrix.slice(centralMatrixPointer.row, centralMatrixPointer.row + rowMatrixLen)
        .map(matrix => matrix.slice(centralMatrixPointer.column, centralMatrixPointer.column + columnMatrixLen));

    return {
        matrices,
        rowPages: rowMatrices.length,
        columnPages: columnMatrices.length
    };
};

const measureSum = measureArr => measureArr.reduce((total, measure) => total + measure, 0);
/**
 * Returns measurements of the cells of the current matrix
 *
 * @param {Object} layout instance of layout
 * @return {Object} returns the measurements for current view matrix
 */
export const getViewMeasurements = (layout, maxRowHeight, maxColWidth) => {
    const rowMatrix = layout.rowMatrix();
    const columnMatrix = layout.columnMatrix();
    const {
        columnPointer,
        rowPointer
    } = layout.config();

    const rowSpaces = rowMatrix.getViewableSpaces()[rowPointer];
    const colSpaces = columnMatrix.getViewableSpaces()[columnPointer];

    const {
        rowHeights,
        width: rowMatrixWidth
    } = rowSpaces;
    const {
        columnWidths,
        height: columnMatrixHeight
    } = colSpaces;

    const { primary: leftWidth, secondary: rightWidth } = rowMatrixWidth;
    const { primary: topHeight, secondary: bottomHeight } = columnMatrixHeight;

    const centerHeight = measureSum(rowHeights.primary);
    const centerWidth = measureSum(columnWidths.primary);
    const viewWidth = [leftWidth, Math.min(centerWidth, maxColWidth), rightWidth];
    const viewHeight = [topHeight, Math.min(centerHeight, maxRowHeight), bottomHeight];

    return {
        viewWidth,
        viewHeight,
        actualCenterMeasures: {
            height: centerHeight,
            width: centerWidth
        },
        totalMeasures: {
            width: measureSum(viewWidth),
            height: measureSum(viewHeight)
        },
        unitHeights: rowHeights,
        unitWidths: columnWidths
    };
};
