import { TITLE, SUB_TITLE, LEGEND, VERTICAL, HORIZONTAL, WIDTH, HEIGHT, TOP, LEFT } from '../constants';
import HeaderComponent from './components/headerComponent';
import LegendComponent from './components/legendComponent';
import ScrollComponent from './components/scroll-component';
import GridComponent from './components/grid-component';
import { TITLE_CONFIG, SUB_TITLE_CONFIG, GRID, CANVAS, LAYOUT_ALIGN } from './defaults';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../layout/src/enums/constants';

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

const createScrollBarWrapper = (scrollBarType, layoutManager, grid, renderDetails) => {
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

export const componentWrapperMaker = (layoutManager, grid, renderDetails) => {
    const { components, layoutConfig, measurement } = renderDetails;
    const target = { target: CANVAS };
    return {
        title: () => createHeaderWrapper(TITLE, layoutManager, renderDetails),
        subtitle: () => createHeaderWrapper(SUB_TITLE, layoutManager, renderDetails),
        legend: () => {
             // color legend
            let colorLegendWrapper = null;
            if (components.legends && components.legends.length) {
                const legendConfig = { ...layoutConfig.legend, ...target, measurement };
                const wrapperParams = {
                    name: LEGEND,
                    component: components.legends,
                    config: legendConfig
                };

                if (layoutManager.getComponent(LEGEND)) {
                    colorLegendWrapper = layoutManager
                                .getComponent(LEGEND)
                                .updateWrapper(wrapperParams);
                } else {
                    colorLegendWrapper = new LegendComponent(wrapperParams);
                }
            }
            return colorLegendWrapper;
        },
        grid: () => {
            // grid components
            let gridWrapper = null;
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
        },
        verticalScrollBar: () => createScrollBarWrapper(VERTICAL, layoutManager, grid, renderDetails),
        horizontalScrollBar: () => createScrollBarWrapper(HORIZONTAL, layoutManager, grid, renderDetails)
    };
};
