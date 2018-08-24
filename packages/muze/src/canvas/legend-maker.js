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
export const legendCreator = (canvas) => {
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
                step
            } = scale.config();
            LegendCls = LEGEND_TYPE_MAP[DISCRETE];
            if (type === LINEAR && scaleType === COLOR) {
                if (!step) {
                    LegendCls = LEGEND_TYPE_MAP[GRADIENT];
                } else {
                    LegendCls = LEGEND_TYPE_MAP[STEP_COLOR];
                }
            }
            dataset.push({ scale, canvas, fieldName: scaleProps.field, LegendCls, scaleType });
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
        position,
        align
    } = legendConfig;

    const legendInfo = legendCreator(canvas);

    legendInfo.forEach((dataInfo, index) => {
        let legend = {};

        const legendMeasures = {};
        const {
                LegendCls,
                scale,
                fieldName,
                scaleType
            } = dataInfo;
        const config = legendConfig[scaleType] || {};
        const title = config.title || {};
        title.text = title.text || fieldName;
        if (config.show) {
            config.position = position;
            config.align = align;

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
                        legendMeasures[e] = Math.min(legendMeasures.maxHeight, config[e]);
                    } else if (e === WIDTH) {
                        legendMeasures[e] = Math.min(legendMeasures.maxWidth, config[e]);
                    } else {
                        legendMeasures[e] = config[e];
                    }
                }
            });
            legend.scale(scale)
                            .title(title)
                            .fieldName(fieldName)
                            .config(config)
                            .metaData(canvas.composition().visualGroup.getGroupByData().project([fieldName]))
                            .measurement(legendMeasures)
                            .setLegendMeasures();

            legends.push({ canvas, legend, scaleType });
        }
    });
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
export const getLegendSpace = (legends, legendConfig, availableHeight, availableWidth) => {
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
        } else if (legendSpace.height + height > availableHeight) {
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
    const { legend } = context.config();
    const { show, position } = legend;

    legend.classPrefix = context.config().classPrefix;
    const align = (position === LEFT || position === RIGHT) ? VERTICAL : HORIZONTAL;

    legend.show = show ? ((align === VERTICAL && width > 200) || (align === HORIZONTAL && height > 200)) : show;
    legend.align = align;
    return legendInitializer(legend, context, measurement, context.legends || []);
};
