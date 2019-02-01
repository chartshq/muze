import {
    HEIGHT, WIDTH, COLUMN, ROW, HORIZONTAL, VERTICAL, HOLISTIC,
    MAX_WIDTH_AVAIL_FOR_COL_MATRIX, COLUMN_MATRIX, MAX_HEIGHT_AVAIL_FOR_ROW_MATRIX, ROW_MATRIX, SCROLL
} from '../enums/constants';

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

const paginationDetailsMap = {
    column: {
        maxMeasure: MAX_WIDTH_AVAIL_FOR_COL_MATRIX,
        matrix: COLUMN_MATRIX,
        measureType: WIDTH,
        scrollType: HORIZONTAL
    },
    row: {
        maxMeasure: MAX_HEIGHT_AVAIL_FOR_ROW_MATRIX,
        matrix: ROW_MATRIX,
        measureType: HEIGHT,
        scrollType: VERTICAL
    }
};

/**
 * This method provides the required width/height in the different pagination stages.
 * If the pagination is holistic, then only the max width/height will be provided for layouting
 * If scroll is enabled, then the entire width/height shall be provided for layouting
 * Note: width is required for scrolling the columns while height is required for scrolling rows
 *
 *
 * @param {Layout} layout Layout instance required for configuration details
 * @param {Object} measureDetails different measure details for row/column
 * @param {number} maxMeasure maximum width/height present for column/row respectively
 * @return {number} Provides the width/height based on which further calculation can occur
 */
const getMatrixMeasureForPagination = (layout, measureDetails, maxMeasure, buffer) => {
    const {
        pagination
    } = layout.config();
    const {
        matrix,
        measureType,
        scrollType
    } = measureDetails;

    switch (pagination) {
    case HOLISTIC:
        return maxMeasure;
    default: {
        const actualMeasure = getMatrixMeasurement(layout[matrix](), measureType) + buffer;

        if (actualMeasure > maxMeasure) {
            layout.scrollInfo({ [scrollType]: true });
        }
        return Math.max(maxMeasure, actualMeasure);
    }
    }
};

/**
 * This method uses the getMatrixMeasureForPagination function to calculate maximum measure
 * depending on the layouting algorithm used
 *
 *
 * @param {Layout} layout Layout instance required for configuration details
 * @param {string} matrixType row/column
 * @param {number} relatedMaxMeasure maximum width/height present for column/row respectively
 * @return {number} Provides the width/height based on which further calculation can occur
 */
const paginationMeasureGetter = (layout, matrixType, relatedMaxMeasure, buffer) =>
    getMatrixMeasureForPagination(layout, paginationDetailsMap[matrixType], relatedMaxMeasure, buffer);

const getMatrixWidthDetails = (layout) => {
    const rowMatrix = layout.rowMatrix();
    const {
        width
    } = layout.measurement();
    const {
        border,
        buffer
    } = layout.config();

    // Border adjustment for each cell in the central matrix
    const borderWidth = border.width;

    // Get width of row matrix
    const rowMatrixWidth = getMatrixMeasurement(rowMatrix, WIDTH);

    // Get maximum width allowed for the row matrix
    const maxRowMatrixWidth = Math.min(rowMatrixWidth + buffer, width / 2);

    // Get maximum width available for the column matrix
    const maxWidthAvailableForColumnMatrix = width - maxRowMatrixWidth - borderWidth;

    // Set width for column matrix
    const columnMatrixWidth = paginationMeasureGetter(layout, COLUMN, maxWidthAvailableForColumnMatrix, 0);

    return {
        rowMatrixWidth,
        maxRowMatrixWidth,
        columnMatrixWidth,
        maxWidthAvailableForColumnMatrix
    };
};

const getHeightRequiredByColMatrix = (layout, columnMatrixWidth) => {
    const {
        height
    } = layout.measurement();
    const columnMatrix = layout.columnMatrix();

    // Get maximum allowed height for colum matrix
    const maxColumnMatrixHeight = Math.min(columnMatrix.getLogicalSpace().height, height / 2);

    // Set the computed width and max height to column matrix to determine the actual height
    // that will be taken by the column matrix
    columnMatrix.setAvailableSpace(columnMatrixWidth, maxColumnMatrixHeight);

    // Get the set of pages column view
    const columnViewPages = columnMatrix.getViewableSpaces();

    // Figuring out total space needed by current view space
    const columnViewSpace = columnViewPages[layout.config().columnPointer];

    // Getting height of column matrix
    const columnMatrixHeight = columnViewSpace.height.primary + columnViewSpace.height.secondary;

    return {
        columnMatrixHeight,
        maxColumnMatrixHeight
    };
};

const getMatrixHeightDetails = (layout, columnMatrixWidth) => {
    const {
        height
    } = layout.measurement();
    const {
        buffer
    } = layout.config();

    // Get actual height required by column matrix
    const { columnMatrixHeight, maxColumnMatrixHeight } = getHeightRequiredByColMatrix(layout, columnMatrixWidth);

    // Based on column height, compute max height available for row matrix
    const maxHeightAvailableForRowMatrix = height - Math.min(maxColumnMatrixHeight, columnMatrixHeight);

    // Get height for row matrix
    const rowMatrixHeight = paginationMeasureGetter(layout, ROW, maxHeightAvailableForRowMatrix, buffer);

    return {
        columnMatrixHeight,
        maxColumnMatrixHeight,
        rowMatrixHeight,
        maxHeightAvailableForRowMatrix
    };
};

const setValueMatrixMeasurements = (layout, rowViewableSpaces, columnViewableSpaces) => {
    const centerMatrix = layout.centerMatrix();

    const {
        border
    } = layout.config();
    const matrices = layout.matrices();
    const {
        top,
        bottom
    } = matrices;

    // Border adjustment for each cell in the central matrix
    const borderWidth = border.width;

    // Get the heights for each cell in the row matrix
    const rowHeights = [].concat(...rowViewableSpaces.map(e => e.rowHeights.primary));

    // Get the widths for each of the row matrix cells(primary and secondary)
    const rowWidthsPrimary = [].concat(...rowViewableSpaces.map(e => e.columnWidths.primary));
    const rowWidthsSecondary = [].concat(...rowViewableSpaces.map(e => e.columnWidths.secondary));

    // Get the widths for each cell in the column matrix
    const columnWidths = [].concat(...columnViewableSpaces.map(e => e.columnWidths.primary));

    // Get the widths for each of the column matrix cells(primary and secondary)
    const columnHeightsPrimary = columnViewableSpaces[0].rowHeights.primary;
    const columnHeightsSecondary = [].concat(...columnViewableSpaces.map(e => e.rowHeights.secondary));

    // Setting the available space for each cell in the centre matrix computed throught the row and
    // column matrices
    centerMatrix.forEach((matrix, rIdx) => {
        matrix.forEach((placeholder, cIdx) => {
            placeholder.setAvailableSpace(columnWidths[cIdx] - borderWidth, rowHeights[rIdx] - borderWidth);
        });
    });

    // Set the heights and widths for the corner matrices namely:
    // TOP_LEFT
    setAvailableSpace(top[0], rowWidthsPrimary, columnHeightsPrimary);
    // TOP_RIGHT
    setAvailableSpace(top[2], rowWidthsSecondary, columnHeightsPrimary);
    // BOTTOM_LEFT
    setAvailableSpace(bottom[0], rowWidthsPrimary, columnHeightsSecondary);
     // BOTTOM_RIGHT
    setAvailableSpace(bottom[2], rowWidthsSecondary, columnHeightsSecondary);
};

const bufferCondition = {
    isScroll: true,
    pagination: SCROLL
};

const getBufferFromCondition = (layout, type) => {
    const scrollInfo = layout.scrollInfo();
    const {
        pagination
    } = layout.config();

    const currentBufferType = {
        pagination,
        isScroll: scrollInfo[type]
    };

    return Object.keys(bufferCondition).every(e => bufferCondition[e] === currentBufferType[e]);
};

const getActualBufferFromConfig = (layout) => {
    const {
        buffer
    } = layout.config();
    const [horizontalBuffer, verticalBuffer] = [HORIZONTAL, VERTICAL].map((type) => {
        if (getBufferFromCondition(layout, type)) {
            return buffer;
        }
        return 0;
    });

    return {
        horizontalBuffer,
        verticalBuffer
    };
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

    // Compute the widths of the row and column matrices
    const {
        rowMatrixWidth,
        maxRowMatrixWidth,
        maxWidthAvailableForColumnMatrix,
        columnMatrixWidth
    } = getMatrixWidthDetails(layout);

    // Compute the heights of the row and column matrices
    const {
        columnMatrixHeight,
        rowMatrixHeight,
        maxHeightAvailableForRowMatrix
    } = getMatrixHeightDetails(layout, columnMatrixWidth);

    const {
        horizontalBuffer,
        verticalBuffer
    } = getActualBufferFromConfig(layout);
    rowMatrix.setAvailableSpace(maxRowMatrixWidth - verticalBuffer, rowMatrixHeight - horizontalBuffer);

    // Get row and columns viewable spaces
    const rowViewableSpaces = rowMatrix.getViewableSpaces();
    const columnViewableSpaces = columnMatrix.getViewableSpaces();

    // Set view spaces for row and columns
    setViewSpaces(layout, ROW, rowViewableSpaces);
    setViewSpaces(layout, COLUMN, columnViewableSpaces);

    // Set measures for each cell of the value matrix
    setValueMatrixMeasurements(layout, rowViewableSpaces, columnViewableSpaces);

    return {
        rowMatrixHeight: rowMatrixHeight - horizontalBuffer,
        rowMatrixWidth: rowMatrixWidth - verticalBuffer,
        maxHeightAvailableForRowMatrix: maxHeightAvailableForRowMatrix - horizontalBuffer,

        columnMatrixHeight,
        columnMatrixWidth,
        maxWidthAvailableForColumnMatrix
    };
};
