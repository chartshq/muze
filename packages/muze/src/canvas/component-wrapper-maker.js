import { TITLE, SUB_TITLE, LEGEND, VERTICAL, HORIZONTAL } from '../constants';
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
        const header = components.headers[headerCell];
        let headerConfig = layoutConfig[headerType];
        headerConfig = Object.assign({}, headerConfig, {
            classPrefix: layoutConfig.classPrefix,
            ...target,
            alignWith: `${ROW_MATRIX_INDEX[0]}-${COLUMN_MATRIX_INDEX[1]}`,
            alignment: LAYOUT_ALIGN.LEFT,
            className: configType.className
        });
        if (layoutManager.getComponent(headerType)) {
            wrapper = layoutManager
                      .getComponent(headerType)
                      .updateWrapper({ name: headerType, component: header, config: headerConfig });
        } else {
            wrapper = new HeaderComponent({ name: headerType, component: header, config: headerConfig });
        }
    }
    return wrapper;
};

const scrollBarMap = {
    vertical: {
        componentName: 'verticalScrollBar',
        width: 'thickness',
        height: 'layoutBasedMeasure',
        layoutBasedMeasure: 'height',
        viewMeasure: 'viewHeight',
        rowAlign: 1,
        colAlign: 2,
        positon: 'top'
    },
    horizontal: {
        componentName: 'horizontalScrollBar',
        width: 'layoutBasedMeasure',
        layoutBasedMeasure: 'width',
        viewMeasure: 'viewWidth',
        height: 'thickness',
        rowAlign: 2,
        colAlign: 0,
        position: 'bottom'
    }
};

const createScrollBarWrapper = (scrollBarType, layoutManager, grid, renderDetails) => {
    let scrollBarWrapper = null;
    const { layoutConfig } = renderDetails;
    const target = { target: CANVAS };
    const { layoutDimensions } = grid.viewInfo();
    const { totalMeasures, actualCenterMeasures } = layoutDimensions;
    const {
        componentName, layoutBasedMeasure, width, height, rowAlign, colAlign,
        viewMeasure, position
    } = scrollBarMap[scrollBarType];
    const dimensions = {
        thickness: layoutConfig.scrollBar.thickness,
        layoutBasedMeasure: totalMeasures[layoutBasedMeasure]

    };
    const scrollConfig = Object.assign({}, {
        classPrefix: layoutConfig.classPrefix,
        ...target,
        type: scrollBarType,
        alignWith: `${ROW_MATRIX_INDEX[rowAlign]}-${COLUMN_MATRIX_INDEX[colAlign]}`,
        alignment: LAYOUT_ALIGN.LEFT,
        position
    });

    const wrapperParams = {
        name: componentName,
        config: scrollConfig,
        dimensions: {
            width: dimensions[width],
            height: dimensions[height],
            totalLength: actualCenterMeasures[layoutBasedMeasure],
            viewLength: layoutDimensions[viewMeasure][1]
        }
    };

    if (layoutManager.getComponent(componentName)) {
        scrollBarWrapper = layoutManager
                                .getComponent(componentName)
                                .updateWrapper(wrapperParams);
    } else {
        scrollBarWrapper = new ScrollComponent(wrapperParams);
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

                if (layoutManager.getComponent(LEGEND)) {
                    colorLegendWrapper = layoutManager
                                .getComponent(LEGEND)
                                .updateWrapper({
                                    name: LEGEND,
                                    component: components.legends,
                                    config: legendConfig
                                });
                } else {
                    colorLegendWrapper = new LegendComponent({
                        name: LEGEND,
                        component: components.legends,
                        config: legendConfig });
                }
            }
            return colorLegendWrapper;
        },
        grid: () => {
            // grid components

            let gridWrapper = null;

            if (layoutManager.getComponent(GRID)) {
                gridWrapper = layoutManager
                            .getComponent(GRID)
                            .updateWrapper({
                                name: GRID,
                                component: grid,
                                config: {
                                    ...target,
                                    classPrefix: layoutConfig.classPrefix,
                                    dimensions: { height: 0, width: 0 }
                                }
                            });
            } else {
                gridWrapper = new GridComponent({
                    name: GRID,
                    component: grid,
                    config: {
                        ...target,
                        pagination: layoutConfig.pagination,
                        classPrefix: layoutConfig.classPrefix,
                        dimensions: { height: 0, width: 0 }
                    }
                });
            }
            return gridWrapper;
        },
        verticalScrollBar: () => createScrollBarWrapper(VERTICAL, layoutManager, grid, renderDetails),
        horizontalScrollBar: () => createScrollBarWrapper(HORIZONTAL, layoutManager, grid, renderDetails)
    };
};
