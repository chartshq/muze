import {
    TITLE,
    SUB_TITLE,
    LEGEND, VERTICAL,
    HORIZONTAL,
    WIDTH,
    HEIGHT,
    TOP,
    LEFT,
    RIGHT,
    MESSAGE,
    GRID,
    ERROR_MESSAGE,
    HORIZONTAL_CENTER
} from '../constants';
import HeaderComponent from './components/headerComponent';
import LegendComponent from './components/legendComponent';
import ScrollComponent from './components/scroll-component';
import GridComponent from './components/grid-component';
import MessageComponent from './components/message-component';
import { TITLE_CONFIG, SUB_TITLE_CONFIG, CANVAS, MESSAGE_CONFIG } from './defaults';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX, CENTER } from '../../../layout/src/enums/constants';

// Mapping between types of headers and their required configs for wrapper creation
const headerMap = {
    title: {
        headerCell: 'titleCell',
        configType: TITLE_CONFIG
    },
    subtitle: {
        headerCell: 'subtitleCell',
        configType: SUB_TITLE_CONFIG
    }
};

// Mapping of header alignment values
const headerAlignmentMap = {
    [LEFT]: LEFT,
    [RIGHT]: RIGHT,
    [CENTER]: HORIZONTAL_CENTER
};

/**
 * returns if data is Valid
 *
 *
 * @param {Object} params object where data has to be checked for validity
 * @return {Boolean} Returns true if all of the params are valid
 */
const checkParamsValidation = params => Object.keys(params).every((param => params[param]));

/**
 * returns if message Component is needed or not
 *
 *
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @return {Boolean} Returns if grid is present
 */
const isGridPresent = (renderDetails) => {
    const { rows, columns, values } = renderDetails.components;
    return checkParamsValidation({ rows, columns, values });
};

/**
 * Creates the wrapper for the header, i.e., title and subtitle to be used in the tree layout
 *
 *
 * @param {string} headerType type of header: title/subtite
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @return {Instance} Returns the respective wrappers
 */
const createHeaderWrapper = (headerType, layoutManager, renderDetails) => {
    let wrapper = null;

    const { components, layoutConfig } = renderDetails;
    const { headerCell, configType } = headerMap[headerType];
    const target = { target: CANVAS };

    if (components.headers && components.headers[headerCell]) {
        let headerConfig = layoutConfig[headerType];
        const header = components.headers[headerCell];

        headerConfig = Object.assign({}, headerConfig, {
            classPrefix: layoutConfig.classPrefix,
            ...target,
            alignWith: `${ROW_MATRIX_INDEX[0]}-${COLUMN_MATRIX_INDEX[1]}`,
            alignment: headerAlignmentMap[headerConfig.align],
            className: configType.className
        });

        const wrapperParams = {
            name: headerType,
            component: header,
            config: headerConfig
        };

        const existingComponent = layoutManager.getComponent(headerType);
        if (existingComponent) {
            wrapper = existingComponent
                        .updateWrapper(wrapperParams);
        } else {
            wrapper = new HeaderComponent(wrapperParams);
        }
    }
    return wrapper;
};

/**
 * Creates the wrapper for the grid layout to be used in the tree layout
 *
 *
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {GridLayout} canvas canvas instance
 * @return {Instance} Returns the respective wrappers
 */
const createMessageWrapper = (layoutManager, renderDetails, renderGrid) => {
    const { components, measurement } = renderDetails;
    const headerValues = Object.values(components.headers);
    let sum = 0;
    let messageWrapper = null;

    for (const val of headerValues) {
        sum += val.logicalSpace().height;
    }

    if (!renderGrid) {
        const defaultDimensions = { height: measurement.canvasHeight - sum, width: measurement.canvasWidth };
        const gridComponent = layoutManager.getComponent(GRID);
        const { height, width } = (gridComponent && gridComponent.getBoundBox()) || defaultDimensions;
        const target = { target: CANVAS };
        const config = {
            ...target,
            dimensions: { height, width },
            message: ERROR_MESSAGE,
            classPrefix: MESSAGE_CONFIG,
            position: TOP
        };
        const wrapperParams = {
            name: MESSAGE,
            component: null,
            config
        };
        const existingComponent = layoutManager.getComponent(MESSAGE);

        if (existingComponent) {
            messageWrapper = existingComponent.updateWrapper(wrapperParams);
        } else {
            messageWrapper = new MessageComponent(wrapperParams);
        }
        return messageWrapper;
    }
    return null;
};

// Mapping between types of scrollBars and their required configs for wrapper creation
const scrollBarMap = config => ({
    vertical: {
        componentName: 'verticalScrollBar',
        width: 'thickness',
        height: 'layoutBasedMeasure',
        layoutBasedMeasure: HEIGHT,
        viewMeasure: 'viewHeight',
        rowAlign: 1,
        colAlign: config.align === 'right' ? 2 : 0,
        position: config.align,
        alignment: TOP
    },
    horizontal: {
        componentName: 'horizontalScrollBar',
        width: 'layoutBasedMeasure',
        layoutBasedMeasure: WIDTH,
        viewMeasure: 'viewWidth',
        height: 'thickness',
        rowAlign: config.align === 'top' ? 0 : 2,
        colAlign: 1,
        position: config.align,
        alignment: LEFT
    }
});

/**
 * Creates the wrapper for the scroller, i.e., horizontal and vertical to be used in the tree layout
 *
 *
 * @param {string} scrollBarType type of scrollbar: horizontal/vertical
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @param {GridLayout} grid Instance of the grid layout
 * @return {Instance} Returns the respective wrappers
 */
const createScrollBarWrapper = (scrollBarType, layoutManager, renderDetails, grid, renderGrid) => {
    if (renderGrid) {
        let scrollBarWrapper = null;
        const { layoutConfig } = renderDetails;
        const target = { target: CANVAS };
        const { scrollBar } = layoutConfig;
        const { layoutDimensions } = grid.viewInfo();
        const {
            actualCenterMeasures,
            unitHeights,
            unitWidths
        } = layoutDimensions;
        const {
            componentName, layoutBasedMeasure, width, height, rowAlign, colAlign,
            viewMeasure, position, alignment
        } = scrollBarMap(scrollBar[scrollBarType])[scrollBarType];
        const dimensions = {
            thickness: scrollBar.thickness,
            layoutBasedMeasure: layoutDimensions[viewMeasure][1]
        };
        const isScroll = grid.scrollInfo()[scrollBarType];
        const totalLength = actualCenterMeasures[layoutBasedMeasure];
        const viewLength = layoutDimensions[viewMeasure][1];

        const scrollConfig = Object.assign({}, {
            classPrefix: layoutConfig.classPrefix,
            ...target,
            scrollBarComponentConfig: {
                ...scrollBar,
                classPrefix: layoutConfig.classPrefix
            },

            type: scrollBarType,
            alignWith: `${ROW_MATRIX_INDEX[rowAlign]}-${COLUMN_MATRIX_INDEX[colAlign]}`,
            alignment,
            position
        });

        const wrapperParams = {
            name: componentName,
            config: scrollConfig,
            dimensions: {
                width: dimensions[width],
                height: dimensions[height],
                totalLength,
                viewLength,
                unitHeights,
                unitWidths
            }
        };

        const existingComponent = layoutManager.getComponent(componentName);

        if (!isScroll) {
            existingComponent && existingComponent.remove();
            return null;
        }

        if (existingComponent) {
            scrollBarWrapper = existingComponent
                                    .updateWrapper(wrapperParams);
        } else {
            scrollBarWrapper = new ScrollComponent(wrapperParams);
        }

        return scrollBarWrapper;
    }
    return null;
};

/**
 * Creates the wrapper for the legend to be used in the tree layout
 *
 *
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @return {Instance} Returns the respective wrappers
 */
const createLegendWrapper = (layoutManager, renderDetails, renderGrid) => {
    if (renderGrid) {
        let legendWrapper = null;
        const { components, layoutConfig, measurement } = renderDetails;
        const target = { target: CANVAS };

        if (components.legends && components.legends.length) {
            const legendConfig = { ...layoutConfig.legend, ...target, measurement };
            const wrapperParams = {
                name: LEGEND,
                component: components.legends,
                config: legendConfig
            };

            const existingComponent = layoutManager.getComponent(LEGEND);

            if (existingComponent) {
                legendWrapper = existingComponent
                        .updateWrapper(wrapperParams);
            } else {
                legendWrapper = new LegendComponent(wrapperParams);
            }
        }
        return legendWrapper;
    }
    return null;
};

/**
 * Creates the wrapper for the grid layout to be used in the tree layout
 *
 *
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @param {GridLayout} grid Instance of the grid layout
 * @return {Instance} Returns the respective wrappers
 */
const gridLayoutWrapper = (layoutManager, renderDetails, grid, renderGrid) => {
    if (renderGrid) {
        let gridWrapper = null;
        const target = { target: CANVAS };
        const { layoutConfig } = renderDetails;

        const config = {
            ...target,
            pagination: layoutConfig.pagination,
            classPrefix: layoutConfig.classPrefix,
            dimensions: { height: 0, width: 0 }
        };
        const wrapperParams = {
            name: GRID,
            component: grid,
            config
        };
        const existingComponent = layoutManager.getComponent(GRID);
        if (existingComponent) {
            gridWrapper = existingComponent
                        .updateWrapper(wrapperParams);
        } else {
            gridWrapper = new GridComponent(wrapperParams);
        }
        return gridWrapper;
    }
    return null;
};
/**
 * Responsible for providing the wrapper creators for every component in Muze.
 * This function, when called, returns the set of components and their respective wrappers.
 *
 *
 *
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {GridLayout} grid Instance of the grid layout
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @return {Instance} Returns the respective wrappers for each component
 */
export const componentWrapperMaker = (canvas, grid, renderDetails) => {
    const layoutManager = canvas._layoutManager;
    const renderGrid = isGridPresent(renderDetails);
    return {
        title: createHeaderWrapper(TITLE, layoutManager, renderDetails),
        subtitle: createHeaderWrapper(SUB_TITLE, layoutManager, renderDetails),
        message: createMessageWrapper(layoutManager, renderDetails, renderGrid),
        legend: createLegendWrapper(layoutManager, renderDetails, renderGrid),
        grid: gridLayoutWrapper(layoutManager, renderDetails, grid, renderGrid),
        verticalScrollBar: createScrollBarWrapper(VERTICAL, layoutManager, renderDetails, grid, renderGrid),
        horizontalScrollBar: createScrollBarWrapper(HORIZONTAL, layoutManager, renderDetails, grid, renderGrid)
    };
};
