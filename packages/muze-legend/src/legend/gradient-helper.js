import { makeElement, applyStyle } from 'muze-utils';
import { LinearAxis } from '@chartshq/muze-axis';
import { BOTTOM, RIGHT, } from '../enums/constants';
import { ALIGN } from './defaults';
import '../styles.scss';

/**
 *
 *
 * @param {*} data
 * @returns
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
 * @returns
 */
export const makeLinearGradient = (container, data, domain) => {
    const defs = makeElement(container, 'defs', [1]);
    const linearGradient = makeElement(defs, 'linearGradient', [1])
                .attr('id', 'linear-gradient')
                .attr('x1', '0%')
                .attr('y2', '0%');
    console.log(data);
    makeElement(linearGradient, 'stop', data, 'stop-gradient')
                    .attr('offset', d => `${(d.value - domain[0]) * 100 / (domain[1] - domain[0])}%`)
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
    const newAxis = new LinearAxis({
        id: `legend-${context._id}`,
        orientation: align === ALIGN.VERTICAL ? RIGHT : BOTTOM,
        style: context._computedStyle,
        nice: false,
        tickValues: data.map(d => d.value),
        fixedBaseline: false
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
 * @returns
 * @memberof GradientLegend
 */
const createLegendSkeleton = (container, classPrefix, data) => {
    const domain = getGradientDomain(data);
    const legendContainer = makeElement(container, 'div', [1], `${classPrefix}-legend-body`);
    const legendGradSvg = makeElement(legendContainer, 'svg', [1], `${classPrefix}-gradient`);
    const legendGradCont = makeElement(legendGradSvg, 'g', [1], `${classPrefix}-gradient-group`);
    const linearGradient = makeLinearGradient(legendGradSvg, data, domain);
    const legendRect = makeElement(legendGradCont, 'rect', [1], `${classPrefix}-gradient-shape`);

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

    axis.setAvailableSpace(width, height);
    axis.render(container.node());
};

/**
 * Renders gradient legends (shape, size and color)
 *
 * @param {Selection} container Point where the legend is to be appended
 * @memberof Legend
 */
export const renderGradient = (context, container) => {
    let gradHeight = 0,
        gradWidth = 0;
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
    } = createLegendSkeleton(container, classPrefix, data);
    const labelDim = context.axis().source().getAxisDimensions().tickLabelDim;
    const {
        padding,
        margin,
        border,
        titleSpaces,
        height,
        width,
    } = context.measurement();
    const gradientDimensions = {};

    gradHeight = Math.floor(height - (titleSpaces.height + 2 * margin + 2 * border));
    gradWidth = Math.floor(width - (margin * 2 + border * 2));

    if (align === ALIGN.HORIZONTAL) {
        gradientDimensions.height = item.shape.height;
        gradientDimensions.width = gradWidth - 2 * padding - labelDim.width / 2;
        linearGradient.attr('x2', '100%');
        legendGradCont.attr('transform', `translate( ${labelDim.width / 2} 0)`);
        renderAxis(context, legendContainer, gradHeight - item.shape.height - padding, gradWidth - 2 * padding - 1);
    } else {
        gradientDimensions.height = gradHeight - 2 * padding - labelDim.height / 2;
        gradientDimensions.width = item.shape.width;
        linearGradient.attr('x2', '0%').attr('y1', '100%');
        legendGradCont.attr('transform', `translate(0 ${labelDim.height / 2})`);
        renderAxis(context, legendContainer, gradHeight - 2 * padding - 1, gradWidth - item.shape.width - padding * 2);
    }

    // Apply styles to the legend container
    applyStyle(legendContainer, {
        height: `${height}px`,
        width: `${width}px`,
        padding: `${padding}px`
    });

    // Apply Styles to the legend plot area
    applyStyle(legendGradSvg, {
        height: `${gradientDimensions.height}px`,
        width: `${gradientDimensions.width}px`
    });

        // Apply styles to the legend rect
    applyStyle(legendRect, {
        fill: 'url(#linear-gradient)'
    });
    legendRect.attr('height', gradientDimensions.height);
    legendRect.attr('width', gradientDimensions.width);

    context.measurement({
        gradientDimensions
    });
    context._legendGradientSvg = legendGradSvg;
    return context;
};
