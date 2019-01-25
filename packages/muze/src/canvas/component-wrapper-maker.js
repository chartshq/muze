import { TITLE, SUB_TITLE, LEGEND, VERTICAL, HORIZONTAL, WIDTH, HEIGHT, TOP, LEFT } from '../constants';
import HeaderComponent from './components/headerComponent';
import LegendComponent from './components/legendComponent';
import ScrollComponent from './components/scroll-component';
import GridComponent from './components/grid-component';
import { TITLE_CONFIG, SUB_TITLE_CONFIG, GRID, CANVAS, LAYOUT_ALIGN } from './defaults';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../layout/src/enums/constants';

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
            alignment: LAYOUT_ALIGN.LEFT,
            className: configType.className
        });

        const wrapperParams = {
            name: headerType,
            component: header,
            config: headerConfig
        };
        if (layoutManager.getComponent(headerType)) {
            wrapper = layoutManager
                      .getComponent(headerType)
                      .updateWrapper(wrapperParams);
        } else {
            wrapper = new HeaderComponent(wrapperParams);
        }
    }
    return wrapper;
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
const createScrollBarWrapper = (scrollBarType, layoutManager, renderDetails, grid) => {
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

    if (layoutManager.getComponent(componentName)) {
        scrollBarWrapper = layoutManager
                                .getComponent(componentName)
                                .updateWrapper(wrapperParams);
        if (viewLength >= totalLength) {
            layoutManager
                            .getComponent(componentName)
                            .remove();
        }
    } else {
        scrollBarWrapper = new ScrollComponent(wrapperParams);
    }
    if (viewLength >= totalLength) {
        return null;
    }

    return scrollBarWrapper;
};

/**
 * Creates the wrapper for the legend to be used in the tree layout
 *
 *
 * @param {LayoutManager} layoutManager instance of Layout Manager which manages the layouting of the components
 * @param {Object} renderDetails Extra details required for rendering the headers
 * @return {Instance} Returns the respective wrappers
 */
const createLegendWrapper = (layoutManager, renderDetails) => {
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

        if (layoutManager.getComponent(LEGEND)) {
            legendWrapper = layoutManager
                       .getComponent(LEGEND)
                       .updateWrapper(wrapperParams);
        } else {
            legendWrapper = new LegendComponent(wrapperParams);
        }
    }
    return legendWrapper;
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
const gridLayoutWrapper = (layoutManager, renderDetails, grid) => {
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

    if (layoutManager.getComponent(GRID)) {
        gridWrapper = layoutManager
                    .getComponent(GRID)
                    .updateWrapper(wrapperParams);
    } else {
        gridWrapper = new GridComponent(wrapperParams);
    }
    return gridWrapper;
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
export const componentWrapperMaker = (layoutManager, grid, renderDetails) => ({
    title: createHeaderWrapper(TITLE, layoutManager, renderDetails),
    subtitle: createHeaderWrapper(SUB_TITLE, layoutManager, renderDetails),
    legend: createLegendWrapper(layoutManager, renderDetails),
    grid: gridLayoutWrapper(layoutManager, renderDetails, grid),
    verticalScrollBar: createScrollBarWrapper(VERTICAL, layoutManager, renderDetails, grid),
    horizontalScrollBar: createScrollBarWrapper(HORIZONTAL, layoutManager, renderDetails, grid)
});
