import { HEIGHT, WIDTH, COLUMN, ROW } from '../enums/constants';

/**
 * Gets measurement for an instance of visual matrix
 *
 * @param {Array} matrix instance of visual matrix
 * @param {string} type height/width
 * @return {Object} Logical height/width of the matrix
 */
export function getMatrixMeasurement (matrix, type) {
    if (matrix) {
        return matrix.getLogicalSpace()[type];
    }
    return 0;
}

/**
 * Sets available space for an instance of visual matrix
 *
 * @param {Array} matrix instance of visual matrix
 * @param {string} type height/width
 * @param {number} value Value of measurement
 */
export function setMatrixMeasurement (matrix, type, value) {
    if (matrix) {
        const spaces = matrix.getLogicalSpace();
        if (value && spaces[type] !== value) {
            type === HEIGHT ? matrix.setAvailableSpace(spaces.width, value) :
                matrix.setAvailableSpace(value, spaces.height);
        }
    }
}

const setAvailableSpace = (matrix, widths, heights) => {
    matrix.forEach((row, rIdx) => {
        row.forEach((placeholder, cIdx) => {
            placeholder.setAvailableSpace(widths[cIdx], heights[rIdx]);
        });
    });
};

const setViewSpaces = (layout, pointerType, viewSpaces) => {
    let pointer = layout.config()[`${pointerType}Pointer`];
    if (viewSpaces.length - 1 < pointer) {
        pointer = 0;
        layout.config({ [`${pointerType}Pointer`]: pointer });
    }
    return pointer;
};

/**
 * Computes the measurements of space for all matrices in the
 * layout
 *
 * @param {Object} layout Instance of grid layout
 * @return {Object} set of measurements for the layout
 */
export const computeLayoutMeasurements = (layout) => {
    const rowMatrix = layout.rowMatrix();
    const columnMatrix = layout.columnMatrix();
    const centerMatrix = layout.centerMatrix();
    const {
        width,
        height
    } = layout.measurement();
    const {
        border
    } = layout.config();
    const matrices = layout.matrices();
    const {
        top,
        bottom
    } = matrices;

    // Get width of row matrix
    const rowMatrixWidth = getMatrixMeasurement(rowMatrix, WIDTH);
    const maxRowMatrixWidth = Math.min(rowMatrixWidth, width / 2);

    // Border adjustment for each cell in the central matrix
    const borderWidth = border.width;

    // Set width for column matrix
    const columnMatrixWidth = width - maxRowMatrixWidth - borderWidth;

    const maxColumnMatrixHeight = Math.min(columnMatrix.getLogicalSpace().height, height / 2);

    columnMatrix.setAvailableSpace(columnMatrixWidth, maxColumnMatrixHeight);
    const columnViewPages = columnMatrix.getViewableSpaces();

    setViewSpaces(layout, COLUMN, columnViewPages);

    // Figuring out total space needed by current view space
    const columnViewSpace = columnViewPages[layout.config().columnPointer];

    // Getting height of column matrix
    const columnMatrixHeight = columnViewSpace.height.primary + columnViewSpace.height.secondary;

    // Set height for row matrix
    const rowMatrixHeight = height - columnMatrixHeight;

    rowMatrix.setAvailableSpace(maxRowMatrixWidth, rowMatrixHeight);
    // Get heights of each cell of row matrix
    const rowViewableSpaces = rowMatrix.getViewableSpaces();
    setViewSpaces(layout, ROW, rowViewableSpaces);
    const rowHeights = [].concat(...rowViewableSpaces.map(e => e.rowHeights.primary));
    const rowWidthsPrimary = [].concat(...rowViewableSpaces.map(e => e.columnWidths.primary));
    const rowWidthsSecondary = [].concat(...rowViewableSpaces.map(e => e.columnWidths.secondary));
    const columnViewableSpaces = columnMatrix.getViewableSpaces();
    // Get widths of each cell of column matrix
    const columnWidths = [].concat(...columnViewableSpaces.map(e => e.columnWidths.primary));
    const columnHeightsPrimary = columnViewableSpaces[0].rowHeights.primary;

    const columnHeightsSecondary = [].concat(...columnViewableSpaces.map(e => e.rowHeights.secondary));

    // Setting the available space for each cell in the centre matrix
    centerMatrix.forEach((matrix, rIdx) => {
        matrix.forEach((placeholder, cIdx) => {
            placeholder.setAvailableSpace(columnWidths[cIdx] - borderWidth, rowHeights[rIdx] - borderWidth);
        });
    });
    setAvailableSpace(top[0], rowWidthsPrimary, columnHeightsPrimary);
    setAvailableSpace(top[2], rowWidthsSecondary, columnHeightsPrimary);
    setAvailableSpace(bottom[0], rowWidthsPrimary, columnHeightsSecondary);
    setAvailableSpace(bottom[2], rowWidthsSecondary, columnHeightsSecondary);

    return {
        rowMatrixHeight,
        rowMatrixWidth,
        columnMatrixHeight,
        columnMatrixWidth
    };
};

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
/**
 * Returns measurements of the cells of the current matrix
 *
 * @param {Object} layout instance of layout
 * @return {Object} returns the measurements for current view matrix
 */
export const getViewMeasurements = (layout) => {
    const rowMatrix = layout.rowMatrix();
    const columnMatrix = layout.columnMatrix();
    const {
        columnPointer,
        rowPointer
    } = layout.config();

    const rowSpaces = rowMatrix.getViewableSpaces()[rowPointer];
    const rowMatrixWidth = rowSpaces.width;
    const { primary: leftWidth, secondary: rightWidth } = rowMatrixWidth;

    const colSpaces = columnMatrix.getViewableSpaces()[columnPointer];

    const columnMatrixHeight = colSpaces.height;
    const { primary: topHeight, secondary: bottomHeight } = columnMatrixHeight;

    const centerHeight = rowSpaces.rowHeights.primary.reduce((t, n) => t + n);
    const centerWidth = colSpaces.columnWidths.primary.reduce((t, n) => t + n);

    return {
        viewWidth: [leftWidth, centerWidth, rightWidth],
        viewHeight: [topHeight, centerHeight, bottomHeight]
    };
};
