import { TextCell, AxisCell } from '@chartshq/visual-cell';
import { getValueParser } from 'muze-utils';
import {
    VERTICAL, HORIZONTAL, LEFT, RIGHT, LEGEND_TYPE_MAP, PADDING, BORDER, MARGIN
} from '../constants';

/**
 *
 *
 * @param {*} legendConfig
 * @param {*} canvases
 *
 */
export const legendCreator = (canvas) => {
    let LegendCls;
    const dataset = [];
    const axes = canvas.getRetinalAxes();

    Object.entries(axes).forEach((axisInfo) => {
        const scale = axisInfo[1][0];
        const scaleType = axisInfo[0];
        const scaleProps = canvas[scaleType]();

        if (scaleProps.field && scale) {
            const {
                type,
                step
            } = scale.config();

            const stepMapper = typeof step === 'boolean' ? step : false;
            LegendCls = LEGEND_TYPE_MAP[`${type}-${stepMapper}-${scaleType}`];
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
 *
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
    const { invalidValues } = canvas.config();

    const parser = getValueParser(invalidValues);
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
            legendMeasures.width = Math.min(legendMeasures.maxWidth, config.width);
            legendMeasures.height = Math.min(legendMeasures.maxHeight, config.height);

            [PADDING, BORDER, MARGIN].forEach((e) => {
                legendMeasures[e] = config[e];
            });

            legend.scale(scale)
                            .valueParser(parser)
                            .title(title)
                            .fieldName(fieldName)
                            .config(config)
                            .metaData(canvas.composition().visualGroup.getGroupByData().project([fieldName]))
                            .measurement(legendMeasures)
                            .canvasAlias(canvas.alias())
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
 *
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
 *
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
