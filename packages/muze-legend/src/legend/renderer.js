import { makeElement, selectElement, applyStyle } from 'muze-utils';
import { SHAPE_MAP } from './defaults';
import {
    VERTICAL,
    WIDTH,
    HEIGHT,
    START,
    END,
    CENTER,
    VALUE,
    RECT,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
    SHAPE
} from '../enums/constants';

/**
 *
 *
 * @param {*} measureType
 * @param {*} stepColorCheck
 */
export const applyItemStyle = (item, measureType, stepColorCheck, context) => {
    const {
        padding,
        labelSpaces,
        shapeSpaces,
        maxShapeWidth
    } = context.measurement();
    const diff = stepColorCheck ? -padding * 2 : 0;

    if (item[0] === VALUE) {
        return `${labelSpaces[item[6]][measureType]}px`;
    }
    return `${measureType === 'width' && !stepColorCheck ? maxShapeWidth : shapeSpaces[item[6]][measureType] - diff}px`;
};

 /**
 * Returns the shape of the legend item
 *
 * @param {Object} datum Data property attached to the item
 * @param {number} width width of the item
 * @param {number} height height of the item
 * @return {Object|string} returns the path string or the string name of the shape
 * @memberof Legend
 */
export const getLegendShape = (datum, width, height, defaultShape) => {
    const shape = SHAPE_MAP(datum[1]);

    if (shape) {
        return shape.size(datum[3] || Math.min(width, height) * Math.PI);
    }
    return SHAPE_MAP(defaultShape).size(datum[3] || Math.min(width, height) * Math.PI);
};

/**
 *
 *
 */
export const renderShape = (shape, container, datum, context) => {
    const {
        classPrefix,
        shapeHeight,
        maxShapeWidth,
        padding,
        color
    } = context;
    const svg = makeElement(container, 'svg', f => [f], `${classPrefix}-legend-shape-svg`)
    .attr(WIDTH, maxShapeWidth)
    .attr(HEIGHT, shapeHeight)
    .style(WIDTH, `${maxShapeWidth}px`)
    .style(HEIGHT, `${shapeHeight}px`);

    if (shape !== RECT) {
        makeElement(svg, 'path', [datum[1]], `${classPrefix}-legend-shape`)
                        .attr('d', shape)
                        .attr('transform', `translate(${maxShapeWidth / 2 - padding} ${shapeHeight / 2})`)
                        .attr('fill', datum[2] || color);
    } else {
        makeElement(svg, RECT, [datum[1]], `${classPrefix}-legend-shape`)
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr(WIDTH, maxShapeWidth)
                        .attr(HEIGHT, shapeHeight)
                        .attr('fill', datum[2] || color);
    }
};

/**
 *
 *
 * @param {*} container
 * @param {*} data
 * @param {*} legendInstance
 * @param {*} align
 * @return
 */
export const getItemContainers = (container, data, legendInstance) => {
    const datasets = {};
    const {
        itemSpaces,
        maxItemSpaces
    } = legendInstance.measurement();
    const {
        classPrefix,
        align
    } = legendInstance.config();

    if (align === VERTICAL) {
        datasets.row = data;
        datasets.column = d => [d];
    } else {
        datasets.row = [1];
        datasets.column = data;
    }

    const rows = makeElement(container, 'div', datasets.row, `${classPrefix}-legend-row`);
    rows.style(HEIGHT, (d, i) => `${itemSpaces[i].height}px`);
    align === VERTICAL && rows.style(WIDTH, (d, i) => `${maxItemSpaces.width}px`);
    const columns = makeElement(rows, 'div', datasets.column, `${classPrefix}-legend-columns`);
    align !== VERTICAL && columns.style(WIDTH, (d, i) => `${itemSpaces[i].width}px`);
    return columns;
};

/**
 *
 *
 * @param {*} container
 * @param {*} classPrefix
 * @param {*} data
 * @returns
 * @memberof DiscreteLegend
 */
export const createLegendSkeleton = (context, container, classPrefix, data) => {
    let gradWidth = 0,
        gradHeight = 0,
        maxGradHeight = 0,
        maxGradWidth = 0;
    const measurement = context.measurement();
    const {
            margin,
            border,
            titleSpaces,
            width,
            height,
            maxWidth,
            maxHeight,
        } = measurement;

    gradHeight = height - (titleSpaces.height + 2 * margin + 2 * border);
    gradWidth = width - (margin * 2 + border * 2);

    maxGradHeight = maxHeight - (titleSpaces.height + margin * 2 + border * 2);
    maxGradWidth = maxWidth - (margin * 2 + border * 2);

    let legendBody = makeElement(container, 'div', [1], `${classPrefix}-legend-body`);

        // Create a div with scroll when overflow
    if (maxGradWidth && maxGradWidth < gradWidth) {
        legendBody = legendBody.style(WIDTH, `${maxGradWidth}px`).style('overflow-x', 'scroll');
        legendBody = makeElement(legendBody, 'div', [1], `${classPrefix}-legend-overflow`);
    }
        // Create a div with scroll when overflow
    if (maxGradHeight && maxGradHeight < gradHeight) {
        legendBody.style(HEIGHT, `${maxGradHeight}px`).style('overflow-y', 'scroll');
        legendBody = makeElement(legendBody, 'div', [1], `${classPrefix}-legend-overflow`);
    }

    legendBody.style(WIDTH, `${gradWidth}px`);
    legendBody.style(HEIGHT, `${gradHeight}px`);

    const legendItem = getItemContainers(legendBody, data, context);
    return { legendItem };
};

/**
 * Creates legend item based on alignment and text position
 *
 * @param {Selection} container Point where items are to be mounted
 * @return {Instance} Current instance
 * @memberof Legend
 */
export const createItemSkeleton = (context, container) => {
    const {
            classPrefix,
            item
        } = context.config();
    const {
           padding
        } = context.measurement();
    const textPosition = item.text.position;

    let stack = [VALUE, SHAPE];
    if (textPosition === RIGHT || textPosition === BOTTOM) {
        stack = [SHAPE, VALUE];
    }

    const itemSkeleton = makeElement(container, 'div', (d, i) => stack.map(e => [e, d[e], d.color, d.size,
        d.value, context.fieldName(), i]), `${classPrefix}-legend-item-info`);
    itemSkeleton.style('padding', `${padding}px`);

    const alignClass = textPosition === BOTTOM || textPosition === TOP ?
        CENTER : (textPosition === RIGHT ? START : END);

    itemSkeleton.classed(alignClass, true);
    return { itemSkeleton };
};

/**
 * Renders the items in the legend i.e, shape and text
 *
 * @param {DOM} container Point where item is to be mounted
 * @memberof Legend
 */
export const renderDiscreteItem = (context, container) => {
    const labelManager = context._labelManager;
    const {
           item,
           classPrefix
    } = context.config();
    const {
        maxShapeWidth,
        padding
    } = context.measurement();
    const {
            width: shapeWidth,
            height: shapeHeight,
            color,
            type
        } = item.shape;

    labelManager.useEllipsesOnOverflow(true);
    applyStyle(container, {
        width: d => applyItemStyle(d, WIDTH, false, context),
        height: d => applyItemStyle(d, HEIGHT, false, context),
        'text-align': CENTER,
    });

    labelManager.setStyle(context._computedStyle);
    container.each(function (d) {
        if (d[0] === VALUE) {
            selectElement(this).text(d[1]);
        } else {
            const shape = getLegendShape(d, shapeWidth, shapeHeight, type);
            renderShape(shape, selectElement(this), d, {
                classPrefix,
                shapeWidth: 2 * Math.sqrt(d[3] / Math.PI) || shapeWidth,
                shapeHeight,
                maxShapeWidth,
                padding,
                color
            });
        }
    });
};

/**
* Renders the items in the legend i.e, shape and text
*
* @param {DOM} container Point where item is to be mounted
* @memberof Legend
*/
export const renderStepItem = (context, container) => {
    let shapeWidth,
        shapeHeight;
    const labelManager = context._labelManager;
    const {
      item,
      position,
      classPrefix
   } = context.config();
    const {
      maxItemSpaces,
      maxShapeWidth
   } = context.measurement();
    const {
       width,
       height,
       color
   } = item.shape;
    const stepColor = {
        horizontal: false,
        vertical: false
    };

    shapeHeight = height;
    shapeWidth = width;

    labelManager.useEllipsesOnOverflow(true);

    if (position === BOTTOM || position === TOP) {
        shapeWidth = maxItemSpaces.width;
        stepColor.horizontal = true;
    } else if (position === LEFT || position === RIGHT) {
        shapeHeight = maxItemSpaces.height;
        stepColor.vertical = true;
    }

    applyStyle(container, {
        width: d => applyItemStyle(d, WIDTH, stepColor.horizontal, context),
        height: d => applyItemStyle(d, HEIGHT, stepColor.vertical, context),
        'text-align': 'center',
    });

    labelManager.setStyle(context._computedStyle);
    container.each(function (d) {
        if (d[0] === VALUE) {
            selectElement(this).text(d[1]);
        } else {
            renderShape(RECT, selectElement(this), d, {
                classPrefix,
                shapeWidth,
                shapeHeight,
                maxShapeWidth,
                color
            });
        }
    });
};
