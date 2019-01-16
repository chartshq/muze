import { mergeRecursive } from 'muze-utils';
import { arrangeComponents } from './component-resolver';
import { createHeaders } from './title-maker';
import { createLegend, getLegendSpace } from './legend-maker';
import { TOP, BOTTOM, LEFT, RIGHT, TITLE, SUB_TITLE, LEGEND } from '../constants';
import HeaderComponent from './components/headerComponent';
import LegendComponent from './components/legendComponent';
import GridComponent from './components/grid-component';
import { TITLE_CONFIG, SUB_TITLE_CONFIG, GRID, CANVAS, LAYOUT_ALIGN } from './defaults';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../layout/src/enums/constants';

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
// const _getLegendOf = (legends, type) => legends.find(legend => legend.scaleType === type);

export const renderLayout = (layoutManager, grid, renderDetails) => {
    // generate component wrappers

    const { components, layoutConfig, measurement } = renderDetails;
    const target = { target: CANVAS };
    // title;
    let titleWrapper = null;
    if (components.headers && components.headers.titleCell) {
        const title = components.headers.titleCell;
        let titleConfig = layoutConfig.title;
        titleConfig = Object.assign({}, titleConfig, { classPrefix: layoutConfig.classPrefix,
            ...target,
            alignWith: `${ROW_MATRIX_INDEX[0]}-${COLUMN_MATRIX_INDEX[1]}`,
            alignment: LAYOUT_ALIGN.LEFT,
            className: TITLE_CONFIG.className });
        if (layoutManager.getComponent(TITLE)) {
            titleWrapper = layoutManager
                            .getComponent(TITLE)
                            .updateWrapper({ name: TITLE, component: title, config: titleConfig });
        } else {
            titleWrapper = new HeaderComponent({ name: TITLE, component: title, config: titleConfig });
        }
    }

     // subtitle
    let subtitleWrapper = null;
    if (components.headers && components.headers.subtitleCell) {
        const subtitle = components.headers.subtitleCell;
        let subtitleConfig = layoutConfig.subtitle;

        subtitleConfig = Object.assign({}, subtitleConfig, { classPrefix: layoutConfig.classPrefix,
            ...target,
            alignWith: `${ROW_MATRIX_INDEX[0]}-${COLUMN_MATRIX_INDEX[1]}`,
            alignment: LAYOUT_ALIGN.LEFT,
            className: SUB_TITLE_CONFIG.className });
        if (layoutManager.getComponent(SUB_TITLE)) {
            subtitleWrapper = layoutManager
                                .getComponent(SUB_TITLE)
                                .updateWrapper({ name: SUB_TITLE, component: subtitle, config: subtitleConfig });
        } else {
            subtitleWrapper = new HeaderComponent({ name: SUB_TITLE, component: subtitle, config: subtitleConfig });
        }
    }

    // color legend
    let colorLegendWrapper = null;
    if (components.legends && components.legends.length) {
        const legendConfig = { ...layoutConfig.legend, ...target, measurement };

        if (layoutManager.getComponent(LEGEND)) {
            colorLegendWrapper = layoutManager
                                .getComponent(LEGEND)
                                .updateWrapper({
                                    name: LEGEND,
                                    component: components.legends,
                                    config: legendConfig });
        } else {
            colorLegendWrapper = new LegendComponent({
                name: LEGEND,
                component: components.legends,
                config: legendConfig });
        }
    }

    // grid components

    let gridWrapper = null;

    if (layoutManager.getComponent(GRID)) {
        gridWrapper = layoutManager
                            .getComponent(GRID)
                            .updateWrapper({
                                name: GRID,
                                component: grid,
                                config: { ...target,
                                    classPrefix: layoutConfig.classPrefix,
                                    dimensions: { height: 0, width: 0 } }
                            });
    } else {
        gridWrapper = new GridComponent({
            name: GRID,
            component: grid,
            config: { ...target,
                classPrefix: layoutConfig.classPrefix,
                dimensions: { height: 0, width: 0 } }
        });
    }

    layoutManager.registerComponents([
        titleWrapper,
        subtitleWrapper,
        colorLegendWrapper,
        gridWrapper
    ]).compute();
};

