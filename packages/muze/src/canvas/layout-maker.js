import { cellRegistry } from '@chartshq/visual-cell';
import { mergeRecursive } from 'muze-utils';
import { arrangeComponents } from './component-resolver';
import { createHeaders } from './title-maker';
import { createLegend, getLegendSpace } from './legend-maker';
import { TOP, BOTTOM, LEFT, RIGHT } from '../constants';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../layout/src/enums/constants';
import HeaderComponent from './components/headerComponent';
import LegendComponent from './components/legendComponent';
import GridComponent from './components/grid-component';
import MatrixComponent from './components/matrix-component';
import { LayoutManager } from '../../../layout/src/tree-layout/src';

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
    const heightAttr = context.height();
    const widthAttr = context.width();
    const visGroup = context.composition().visualGroup;
    const {
        isColumnSizeEqual,
        isRowSizeEqual,
        rows,
        columns,
        values
    } = visGroup.placeholderInfo();
    const {
        minWidth,
        minHeight,
        classPrefix,
        showHeaders,
        legend
    } = context.config();
    // Get title configuration
    const titleConfig = context.title()[1];
     // Get subtitle configuration
    const subtitleConfig = context.subtitle()[1];
    // Get legend position
    const legendPosition = legend.position;
    // Arrange components according to config
    const layoutArrangement = arrangeComponents(context);

    // Get height width of the mount point
    const { height, width } = mount.getBoundingClientRect();

    const availableHeightForCanvas = Math.max(heightAttr > 0 ? heightAttr : height, minHeight);
    const availableWidthForCanvas = Math.max(widthAttr > 0 ? widthAttr : width, minWidth);

    // Create headers and determine header height
    const { headers, headerHeight } = createHeaders(context, availableHeightForCanvas, availableWidthForCanvas);

    // Create legends and determine legend space
    const legends = createLegend(context, headerHeight, availableHeightForCanvas, availableWidthForCanvas);
    context._composition.legend = {};
    legends.forEach((e) => {
        context._composition.legend[e.scaleType] = e.legend;
    });

    const legendSpace = getLegendSpace(legends, legend, availableHeightForCanvas, availableWidthForCanvas);
    const legendWidth = (legendPosition === LEFT || legendPosition === RIGHT) ? legendSpace.width : 0;
    const legendHeight = (legendPosition === TOP || legendPosition === BOTTOM) ? legendSpace.height : 0;

    // Set components for layouting
    const components = {
        headers,
        legends,
        canvases: [context],
        rows,
        columns,
        values,
        cornerMatrices: visGroup.cornerMatrices()
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
        border: mergeRecursive(visGroup.metaData().border, context.config().border),
        layoutArrangement,
        legend,
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
// const _getLegendOf = (legends, type) => legends.find(legend => legend.scaleType === type);

export const prepareTreeLayout = (layoutConfig, components, grid, measurement) => {
    // generate component wrappers

    const target = { target: 'canvas' };
    // title;
    let titleWrapper = null;
    if (components.headers && components.headers.titleCell) {
        const title = components.headers.titleCell;
        let titleConfig = layoutConfig.title;
        titleConfig = Object.assign({}, titleConfig, { classPrefix: layoutConfig.classPrefix, ...target });
        titleWrapper = new HeaderComponent({ name: 'title', component: title, config: titleConfig });
    }

     // subtitle
    let subtitleWrapper = null;
    if (components.headers && components.headers.subtitleCell) {
        const subtitle = components.headers.subtitleCell;
        let subtitleConfig = layoutConfig.subtitle;

        subtitleConfig = Object.assign({}, subtitleConfig, { classPrefix: layoutConfig.classPrefix, ...target });
        subtitleWrapper = new HeaderComponent({ name: 'subtitle', component: subtitle, config: subtitleConfig });
    }

    // color legend
    let colorLegendWrapper = null;
    if (components.legends) {
        const legendConfig = { ...layoutConfig.legend, ...target, measurement };
        colorLegendWrapper = new LegendComponent({
            name: 'legend',
            component: components.legends,
            config: legendConfig });
    }

    // grid components
    const { viewMatricesInfo, layoutDimensions } = grid.getViewInformation();
    const gridComponents = [];
    for (let i = 0; i < 3; i++) {
        gridComponents[i] = [];
        for (let j = 0; j < 3; j++) {
            const matrixDim = { height: layoutDimensions.viewHeight[i], width: layoutDimensions.viewWidth[j] };
            const matrix = viewMatricesInfo.matrices[`${ROW_MATRIX_INDEX[i]}`][j];
            const matrixName = `${ROW_MATRIX_INDEX[i]}-${COLUMN_MATRIX_INDEX[j]}`;
            const matrixConfig = {
                dimensions: matrixDim,
                border: layoutDimensions.border,
                classPrefix: layoutConfig.classPrefix,
                row: ROW_MATRIX_INDEX[i],
                column: j
            };
            const matrixWrapper = new MatrixComponent({
                name: matrixName,
                component: matrix,
                config: matrixConfig
            });
            gridComponents[i].push(matrixWrapper);
        }
    }

    const gridWrapper = new GridComponent({
        name: 'grid',
        component: gridComponents,
        config: { dimensions: { height: 0, width: 0 }, ...target }
    });
    // gridComponentWrapper[1][0].draw(document.getElementById('chart'));

    // instantiate treelayoutManager

    const layoutManager = new LayoutManager({
        renderAt: 'chart',
        height: measurement.canvasHeight,
        width: measurement.canvasWidth
    });

    layoutManager.registerComponents([
        titleWrapper,
        subtitleWrapper,
        colorLegendWrapper,
        gridWrapper
    ]).compute();
    // registerComponents
    // call compute
};

