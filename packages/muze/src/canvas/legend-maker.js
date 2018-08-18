import { TextCell, AxisCell } from '@chartshq/visual-cell';
import {
    VERTICAL, HORIZONTAL, LEFT, RIGHT, LEGEND_TYPE_MAP, HEIGHT, PADDING, BORDER, CONFIG, LINEAR, COLOR, STEP_COLOR,
    GRADIENT, DISCRETE, WIDTH
} from '../constants';

/**
 *
 *
 * @param {*} legendConfig
 * @param {*} canvases
 * @returns
 */
export const legendDataCreator = (canvas) => {
    let LegendCls;
    const dataset = [];
    const axes = canvas.getRetinalAxes();
    Object.entries(axes).forEach((axisInfo) => {
        const scale = axisInfo[1][0];
        const scaleType = axisInfo[0];
        const scaleProps = canvas[scaleType]();

        if (scaleProps && scaleProps.field) {
            const {
                type,
                interpolate
            } = scale.config();
            LegendCls = LEGEND_TYPE_MAP[DISCRETE];

            if (type === LINEAR && scaleType === COLOR) {
                if (interpolate) {
                    LegendCls = LEGEND_TYPE_MAP[GRADIENT];
                } else {
                    LegendCls = LEGEND_TYPE_MAP[STEP_COLOR];
                }
            }
            dataset.push({ scale, canvas, fieldName: scaleProps.field, LegendCls });
        }
    });

    return dataset;
};

/**
 *
 *
 * @param {*} legendConfig
 * @param {*} canvases
 * @param {*} measurement
 * @param {*} prevLegends
 * @returns
 */
export const legendInitializer = (legendConfig, canvas, measurement, prevLegends) => {
    const legends = [];
    const {
        height,
        width,
        headerHeight
    } = measurement;
    const {
        show,
        align,
        title
    } = legendConfig;

    if (show) {
        const dataset = legendDataCreator(canvas);

        dataset.forEach((dataInfo, index) => {
            let legend = {};
            const legendMeasures = {};
            const {
                LegendCls,
                scale,
                fieldName,
            } = dataInfo;

            if (prevLegends[index]) {
                legend = prevLegends[index].legend;
            } else {
                legend = LegendCls.create({
                    labelManager: canvas._dependencies.smartlabel,
                    cells: {
                        AxisCell, TextCell
                    }
                });
            }
            legendMeasures.maxHeight = align === VERTICAL ? (height - headerHeight) : height * 0.2;
            legendMeasures.maxWidth = align === HORIZONTAL ? width : width * 0.2;
            [HEIGHT, WIDTH, PADDING, BORDER, CONFIG].forEach((e) => {
                if (legendConfig[e]) {
                    if (e === HEIGHT) {
                        legendMeasures[e] = Math.min(legendMeasures.maxHeight, legendConfig[e]);
                    } else if (e === WIDTH) {
                        legendMeasures[e] = Math.min(legendMeasures.maxWidth, legendConfig[e]);
                    } else {
                        legendMeasures[e] = legendConfig[e];
                    }
                }
            });
            legend.scale(scale)
                            .title((title && title[index] !== null) ? title[index] : fieldName)
                            .fieldName(fieldName)
                            .config(legendConfig)
                            .metaData(canvas.data().project([fieldName]))
                            .measurement(legendMeasures)
                            .setLegendMeasures();

            legends.push({ canvas, legend });
        });
    }
    return legends;
};

/**
 *
 *
 * @param {*} legends
 * @param {*} legendConfig
 * @param {*} availableHeight
 * @param {*} availableWidth
 * @returns
 */
export const getLegendSpace = (context, availableHeight, availableWidth) => {
    const legends = context.legendComponents();
    const legendConfig = context.legend();
    const legendMeasures = legends.map(legendInfo => legendInfo.legend.measurement());
    const legendSpace = { width: 0, height: 0 };

    legendMeasures.forEach((space) => {
        let height = 0;
        let width = 0;
        width = Math.min(space.width, space.maxWidth);
        height = Math.min(space.height, space.maxHeight);

        if (legendConfig.align === HORIZONTAL) {
            if (legendSpace.width + width > availableWidth) {
                legendSpace.width = availableWidth;
                legendSpace.height += height;
            } else {
                legendSpace.width += width;
                legendSpace.height = Math.max(legendSpace.height, height);
            }
        }
        else if (legendSpace.height + height > availableHeight) {
            legendSpace.height = height;
            legendSpace.width += width;
        } else {
            legendSpace.height += height;
            legendSpace.width = Math.max(legendSpace.width, width);
        }
    });
    if (legendConfig.align === HORIZONTAL) {
        legendSpace.width = availableWidth;
    }
    return legendSpace;
};

/**
 *
 *
 * @param {*} context
 * @param {*} headerHeight
 * @returns
 */
export const createLegend = (context, headerHeight, height, width) => {
    const measurement = {
        height,
        width,
        headerHeight
    };
    const legendConfig = context.legend();
    const { show, position } = legendConfig;

    legendConfig.classPrefix = context.config().classPrefix;
    const align = (position === LEFT || position === RIGHT) ? VERTICAL : HORIZONTAL;

    legendConfig.show = show ? ((align === VERTICAL && width > 200) || (align === HORIZONTAL && height > 200)) : show;
    legendConfig.align = align;
    return legendInitializer(legendConfig, context, measurement, context.legends || []);
};
