import { cellRegistry } from '@chartshq/visual-cell';
import { mergeRecursive } from 'muze-utils';
import { arrangeComponents } from './component-resolver';
import { createHeaders } from './title-maker';
import { createLegend, getLegendSpace } from './legend-maker';
import { TOP, BOTTOM, LEFT, RIGHT } from '../constants';

const BlankCell = cellRegistry().get().BlankCell;

const createBlankCell = () => new BlankCell();

/**
 *
 *
 * @param {*} canvases
 * @returns
 */
const getMaxRows = (rows) => {
    const maxRows = [0, 0];

    maxRows[0] = Math.max(maxRows[0], rows[0].length ? rows[0][0].length : 0);
    maxRows[1] = Math.max(maxRows[1], rows[1].length ? rows[1][0].length : 0);
    return maxRows;
};

/**
 *
 *
 * @param {*} arr
 * @param {*} value
 */
const fillArray = (arr, value) => arr.map(() => value());

/**
 *
 *
 * @param {*} rows
 * @param {*} columns
 * @param {*} blankCellCreator
 * @returns
 */
const blankMatrixCreator = (rows, columns, blankCellCreator) => {
    const arr = [];

    for (let i = 0; i < rows; i++) {
        let array = new Array(columns).fill([]);
        array = fillArray(array, blankCellCreator);
        arr.push(array);
    }
    return arr;
};

/**
 *
 *
 * @param {*} rowMatrices
 * @param {*} maxRows
 */
const blankCellCreator = (rowMatrices, maxRows) => rowMatrices.map((rowMatrix, rowMatrixIndex) => {
    if (rowMatrix.length === 0 && maxRows[rowMatrixIndex] > 0) {
        const numberOfRows = Math.max(rowMatrices[0].length, rowMatrices[1].length);
        return blankMatrixCreator(numberOfRows, maxRows[rowMatrixIndex], createBlankCell);
    }
    if (rowMatrix.length > 0) {
        if (rowMatrix[0] && rowMatrix[0].length <= maxRows[rowMatrixIndex]) {
            return rowMatrix.map((row) => {
                let arr = new Array(maxRows[rowMatrixIndex] - rowMatrix[0].length).fill(1);
                arr = fillArray(arr, createBlankCell);
                return [...arr, ...row];
            });
        }
        return blankMatrixCreator(rowMatrix.length, maxRows[rowMatrixIndex], createBlankCell);
    }
    return rowMatrix;
});

/**
 *
 *
 * @param {*} context
 * @returns
 */
export const prepareLayout = (layout, components, config, measurement) => {
    let topL;
    let topR;
    let bottomL;
    let bottomR;
    const {
        rows,
        columns,
        values,
        cornerMatrices
    } = components;
    const {
        showHeaders
    } = config;
    const maxRows = getMaxRows(rows);
    const {
        topLeft,
        topRight,
        bottomLeft,
        bottomRight
    } = cornerMatrices;

    if (!showHeaders) {
        const colLengths = [columns[0].length, columns[1].length];
        // Create blank cells for corener matrices
        [topL, topR] = blankCellCreator([new Array(colLengths[0]), new Array(colLengths[0])], maxRows);
        [bottomL, bottomR] = blankCellCreator([new Array(colLengths[1]), new Array(colLengths[1])], maxRows);
    } else {
        [topL, topR, bottomL, bottomR] = [topLeft, topRight, bottomLeft, bottomRight];
    }

    layout.measurement(measurement)
                    .config(config)
                    .matrices({
                        top: [topL, columns[0], topR],
                        center: [rows[0], values, rows[1]],
                        bottom: [bottomL, columns[1], bottomR]
                    })
                    .triggerReflow();
};

/**
 *
 *
 * @param {*} context
 * @param {*} mount
 * @returns
 */
export const getRenderDetails = (context, mount) => {
    let layoutConfig = mergeRecursive({}, context.config());
    const {
        isColumnSizeEqual,
        isRowSizeEqual,
        rows,
        columns,
        values
    } = context.getPlaceholderDetails();
    const {
        minWidth,
        minHeight,
        classPrefix,
        showHeaders
    } = context.config();
    // Get the legend configuration
    const legendConfig = context.legend();
    // Get title configuration
    const titleConfig = context.title()[1];
     // Get subtitle configuration
    const subtitleConfig = context.subtitle()[1];
    // Get legend position
    const legendPosition = legendConfig.position;
    // Arrange components according to config
    const layoutArrangement = arrangeComponents(context);

    // Get height width of the mount point
    const { height, width } = mount.getBoundingClientRect();

    const availableHeightForCanvas = context.height() >= 0 ? context.height() : (height || minHeight);
    const availableWidthForCanvas = context.width() >= 0 ? context.width() : (width || minWidth);
    // Create headers and determine header height
    const { headers, headerHeight } = createHeaders(context, availableHeightForCanvas, availableWidthForCanvas);

    // Create legends and determine legend space
    context.legendComponents(createLegend(context, headerHeight, availableHeightForCanvas, availableWidthForCanvas));

    const legendSpace = getLegendSpace(context, availableHeightForCanvas, availableWidthForCanvas);
    const legendWidth = (legendPosition === LEFT || legendPosition === RIGHT) ? legendSpace.width : 0;
    const legendHeight = (legendPosition === TOP || legendPosition === BOTTOM) ? legendSpace.height : 0;

    // Set components for layouting
    const components = {
        headers,
        legends: context.legendComponents(),
        canvases: [context],
        rows,
        columns,
        values,
        cornerMatrices: context.getCornerMatrices()
    };
    const measurement = {
        mountSpace: {
            height,
            width
        },
        headerHeight,
        legendSpace,
        canvasWidth: availableWidthForCanvas,
        canvasHeight: availableHeightForCanvas,
        width: availableWidthForCanvas - legendWidth,
        height: availableHeightForCanvas - headerHeight - legendHeight,
        minUnitHeight: context.minUnitHeight(),
        minUnitWidth: context.minUnitWidth()
    };
    layoutConfig = mergeRecursive(layoutConfig, {
        classPrefix,
        showHeaders,
        border: mergeRecursive(context.getGroupMetaData().border, context.config().border),
        layoutArrangement,
        legend: legendConfig,
        title: titleConfig,
        subtitle: subtitleConfig,
        isColumnSizeEqual,
        isRowSizeEqual
    });
    return {
        layoutConfig,
        components,
        measurement
    };
};
