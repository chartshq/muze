import { makeElement, applyStyle } from 'muze-utils';
import { ContinousAxis } from '@chartshq/muze-axis';
import { BOTTOM, RIGHT } from '../enums/constants';
import { ALIGN, LEGEND_MARKER_PROPS } from './defaults';
import '../styles.scss';

/**
 *
 *
 * @param {*} data
 *
 */
export const getGradientDomain = (data) => {
    if (typeof data[0].value === 'number') {
        return data.reduce((accumulator, currentValue) =>
            [Math.min(currentValue.value, accumulator[0]), Math.max(currentValue.value, accumulator[1])],
                [Number.MAX_VALUE, Number.MIN_VALUE]);
    }
    return data.map(e => e.value);
};
/**
 *
 *
 * @param {*} container
 * @param {*} data
 * @param {*} domain
 *
 */
export const makeLinearGradient = (container, data, domain, id) => {
    const defs = makeElement(container, 'defs', [1]);
    const linearGradient = makeElement(defs, 'linearGradient', [1])
                .attr('id', `linear-gradient-${id}`)
                .attr('x1', '0%')
                .attr('y2', '0%');

    makeElement(linearGradient, 'stop', data, 'stop-gradient')
                    .attr('offset', d => `${(d.value - domain[0]) * 100 / (domain[1] - domain[0]) || 1}%`)
                    .attr('stop-color', d => d.color);
    return linearGradient;
};

/**
 * Creates an axis cell with a linear axis for computing space and
 * creating gradient legend
 *
 * @return {AxisCell} Instance of Axis Cell for the gradient axis
 * @memberof Legend
 */
export const createAxis = (context) => {
    const data = context.data();
    const { align } = context.config();
    const AxisCell = context._cells.AxisCell;
    const newAxis = new ContinousAxis({
        id: `legend-${context._id}`,
        orientation: align === ALIGN.VERTICAL ? RIGHT : BOTTOM,
        style: context._computedStyle,
        nice: false,
        showAxisName: false,
        tickValues: data.map(d => d.value),
        fixedBaseline: false,
        labels: {
            rotation: null
        }
    }, { labelManager: context._labelManager });

    newAxis.domain(getGradientDomain(data));
    newAxis.range([1, 1]);
    return new AxisCell().source(newAxis).config({
        margin: { left: 0, bottom: 0, top: 0, right: 0 }
    });
};

/**
 *
 *
 * @param {*} container
 * @param {*} data
 * @param {*} classPrefix
 *
 * @memberof GradientLegend
 */
const createLegendSkeleton = (container, classPrefix, data, id) => {
    const domain = getGradientDomain(data);
    const legendContainer = makeElement(container, 'div', [1], `${classPrefix}-legend-body`);
    const legendGradSvg = makeElement(legendContainer, 'svg', [1], `${classPrefix}-gradient`);
    const legendGradCont = makeElement(legendGradSvg, 'g', [1], `${classPrefix}-gradient-group`);
    const linearGradient = makeLinearGradient(legendGradSvg, data, domain, id);
    const legendRect = makeElement(legendGradCont, 'rect', [1], `${classPrefix}-gradient-rect`);

    return {
        legendContainer,
        legendGradCont,
        legendGradSvg,
        linearGradient,
        legendRect
    };
};

/**
 * Renders the axis for the gradient
 *
 * @param {Selection} container Point where axis is to be mounted
 * @param {number} height Height for axis
 * @param {number} width Width for axis
 * @memberof Legend
 */
export const renderAxis = (context, container, height, width) => {
    const axis = context.axis();

    axis.source().config({
        tickFormat: (val, i) => context.config().item.text.formatter(val, i, context.metaData(), context)
    });
    axis.setAvailableSpace(width, height);
    axis.render(container.node());
    axis.source().render();
};

/**
 * Renders gradient legends
 *
 * @param {Selection} container Point where the legend is to be appended
 * @memberof GradientLegend
 */
export const renderGradient = (context, container) => {
    let gradHeight = 0;
    let gradWidth = 0;
    const {
        align,
        classPrefix,
        item
    } = context.config();
    const data = context.data();
    // Create the skeleton for the legend
    const {
        legendContainer,
        legendGradSvg,
        legendGradCont,
        linearGradient,
        legendRect
    } = createLegendSkeleton(container, classPrefix, data, context._id);
    const labelDim = context.axis().source().getAxisDimensions().tickDimensions;
    const {
        padding,
        margin,
        border,
        titleSpaces,
        maxItemSpaces,
        maxHeight,
        maxWidth,
        height,
        width
    } = context.measurement();
    const gradientDimensions = {};

    gradHeight = Math.floor(Math.min(height, maxHeight) - (titleSpaces.height + 2 * margin + 2 * border));
    gradWidth = Math.floor(Math.min(width, maxWidth) - (margin * 2 + border * 2));

    const { size: markerSize, BUFFER } = LEGEND_MARKER_PROPS;
    const markerWithBuffer = markerSize + BUFFER;

    if (align === ALIGN.HORIZONTAL) {
        gradientDimensions.height = item.icon.height;
        gradientDimensions.width = gradWidth - 2 * padding - labelDim.width / 2;
        linearGradient.attr('x2', '100%').attr('y1', '0%');
        legendGradCont.attr('transform', `translate( ${labelDim.width / 2} ${markerWithBuffer})`);
        renderAxis(context, legendContainer, gradHeight - item.icon.height - padding, gradWidth - 2 * padding - 1);

        applyStyle(legendContainer, {
            height: `${maxItemSpaces.height + border + padding}px`,
            width: `${Math.min(width, maxWidth)}px`,
            padding: `${padding}px`
        });

        legendRect.attr('height', gradientDimensions.height);
        legendRect.attr('width', gradientDimensions.width - labelDim.width / 2);
    } else {
        gradientDimensions.height = gradHeight - 2 * padding - labelDim.height / 2;
        gradientDimensions.width = item.icon.width;
        linearGradient.attr('x2', '0%').attr('y1', '100%');
        legendGradCont.attr('transform', `translate(${markerWithBuffer} ${labelDim.height / 2})`);
        renderAxis(
            context,
            legendContainer,
            gradHeight - 2 * padding - 1,
            gradWidth - (gradientDimensions.width + markerWithBuffer) - padding * 2
        );

        applyStyle(legendContainer, {
            height: `${Math.min(height, maxHeight)}px`,
            width: `${maxWidth}px`,
            padding: `${padding}px`
        });
        legendRect.attr('height', gradientDimensions.height - labelDim.height / 2);
        legendRect.attr('width', gradientDimensions.width);
    }

    // Apply Styles to the legend plot area
    applyStyle(legendGradSvg, {
        height: `${gradientDimensions.height + markerWithBuffer}px`,
        width: `${gradientDimensions.width + markerWithBuffer}px`
    });

    // Apply styles to the legend rect
    applyStyle(legendRect, {
        fill: `url(#linear-gradient-${context._id})`
    });
    legendGradSvg.attr('height', gradientDimensions.height + markerWithBuffer);
    legendGradSvg.attr('width', gradientDimensions.width + markerWithBuffer);

    context.measurement({
        gradientDimensions
    });
    context._legendGradientSvg = legendGradSvg;
    return context;
};
