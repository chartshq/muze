import { mergeRecursive } from 'muze-utils';
import { arrangeComponents } from './component-resolver';
import { createHeaders } from './title-maker';
import { createLegend, getLegendSpace } from './legend-maker';
import { componentWrapperMaker } from './component-wrapper-maker';
import { TOP, BOTTOM, LEFT, RIGHT } from '../constants';
import { ScrollManager } from './scroll-manager';

/**
 *
 *
 * @param {*} context
 *
 */
export const prepareLayout = (layout, renderDetails) => {
    const { components, layoutConfig, measurement } = renderDetails;
    const {
        rows,
        columns,
        values,
        cornerMatrices
    } = components;
    const {
        topLeft,
        topRight,
        bottomLeft,
        bottomRight
    } = cornerMatrices;
    if (rows && columns) {
        layout.measurement(measurement)
                        .config(layoutConfig)
                        .matrices({
                            top: [topLeft, columns[0], topRight],
                            center: [rows[0], values, rows[1]],
                            bottom: [bottomLeft, columns[1], bottomRight]
                        })
                        .triggerReflow();
    }
};

/**
 *
 *
 * @param {*} context
 * @param {*} mount
 *
 */
export const getRenderDetails = (context, mount) => {
    let layoutConfig = mergeRecursive({}, context.config());
    // Get height width of the mount point
    let { height, width } = mount.getBoundingClientRect();
    const heightAttr = context.height();
    const widthAttr = context.width();
    const visGroup = context.composition().visualGroup;
    const {
        isColumnSizeEqual,
        isRowSizeEqual,
        priority,
        rows,
        columns,
        values
    } = visGroup.placeholderInfo();
    const {
        minWidth,
        minHeight,
        classPrefix,
        showHeaders,
        legend,
        pagination,
        scrollBar
    } = context.config();

    // Get title configuration
    const titleConfig = context.title()[1];
     // Get subtitle configuration
    const subtitleConfig = context.subtitle()[1];
    // Get legend position
    const legendPosition = legend.position;
    // Arrange components according to config
    const layoutArrangement = arrangeComponents(context);

    height = Math.floor(height);
    width = Math.floor(width);

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
        buffer: scrollBar.thickness,
        pagination,
        title: titleConfig,
        subtitle: subtitleConfig,
        isColumnSizeEqual,
        isRowSizeEqual,
        mount,
        priority
    });
    return {
        layoutConfig,
        components,
        measurement
    };
};

const componentIndexes = {
    title: 0,
    subtitle: 1,
    legend: 2,
    verticalScrollBar: 3,
    horizontalScrollBar: 4,
    grid: 5
};

/**
 * Responsible for creating a scroll manager that manages interactions between the grid
 * component and the scroll bar components
 *
 * @param {Array} componentWrappers Contains the wrappers for all the components
 * @param {Canvas} canvas Instance of the current canvas
 * @return {Array} Positions of units either horizontal or vertical
 */
const createScrollManager = (componentWrappers, canvas) => {
    const {
        horizontalScrollBar,
        verticalScrollBar,
        grid
    } = componentIndexes;

    const horizontalScrollWrapper = componentWrappers[horizontalScrollBar];
    const verticalScrollWrapper = componentWrappers[verticalScrollBar];
    const gridWrapper = componentWrappers[grid];
    const scrollBarManager = new ScrollManager();
    const scrollBarComponents = {};

    verticalScrollWrapper && (scrollBarComponents.vertical = verticalScrollWrapper);
    horizontalScrollWrapper && (scrollBarComponents.horizontal = horizontalScrollWrapper);

    scrollBarManager
                    .scrollBarComponents(scrollBarComponents)
                    .attachedComponents({
                        grid: gridWrapper
                    });
    canvas.composition().hScrollBar = horizontalScrollWrapper;
    canvas.composition().vScrollBar = verticalScrollWrapper;

    [horizontalScrollWrapper, verticalScrollWrapper].forEach((wrapper) => {
        wrapper && wrapper.manager(scrollBarManager);
    });

    gridWrapper.scrollBarManager(scrollBarManager);
};

export const renderLayout = (canvas, renderDetails) => {
    const layoutManager = canvas._layoutManager;
    const gridLayout = canvas.layout();
    const {

        grid
    } = componentIndexes;

    // Get the component wrappers
    const compWrappers = componentWrapperMaker(layoutManager, gridLayout, renderDetails);
    const componentWrappers = Object.keys(componentIndexes).map(e => compWrappers[e]);
    const gridWrapper = componentWrappers[grid];
    createScrollManager(componentWrappers, canvas);

    layoutManager.registerComponents(componentWrappers).compute();
    gridWrapper.attachScrollListener();
};

