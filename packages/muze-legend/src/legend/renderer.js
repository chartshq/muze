import { makeElement, selectElement, applyStyle } from 'muze-utils';
import { ICON_MAP } from './defaults';
import { positionConfig, alignmentMap, itemStack } from './position-config';
import {
    WIDTH,
    HEIGHT,
    CENTER,
    VALUE,
    RECT,
    LEFT,
    DEFAULTICONSIZE,
    VERTICAL_BUFFER,
    HORIZONTAL_BUFFER,
    HORIZONTAL,
    VERTICAL,
    DEFAULT,
    TOP,
    BOTTOM,
    OPPOSITE_POSITION
} from '../enums/constants';

/**
 *
 *
 * @param {*} container
 * @param {*} data
 * @param {*} legendInstance
 * @param {*} align
 *
 */
export const getItemContainers = (container, data, legendInstance) => {
    const measurement = legendInstance.measurement();
    const config = legendInstance.config();
    const {
        itemSpaces
    } = measurement;
    const {
        classPrefix,
        position
    } = config;
    const positionObj = positionConfig[position];
    const datasets = positionObj.datasets(data);
    const measures = positionObj.itemContainerMeasures(measurement, config);

    const rows = makeElement(container, 'div', datasets.row, `${classPrefix}-legend-row`);
    rows.style(HEIGHT, (d, i) => `${itemSpaces[i].height}px`);
    rows.style(WIDTH, measures.row.width);
    rows.style('padding', measures.row.padding);

    const columns = makeElement(rows, 'div', datasets.column, `${classPrefix}-legend-columns`);
    columns.style(WIDTH, measures.column.width);
    columns.style('padding', measures.column.padding);

    return columns;
};

/**
 *
 *
 * @param {*} container
 * @param {*} classPrefix
 * @param {*} data
 *
 * @memberof DiscreteLegend
 */
export const createLegendSkeleton = (context, container, classPrefix, data) => {
    let gradWidth = 0;
    let gradHeight = 0;
    let maxGradHeight = 0;
    let maxGradWidth = 0;
    const measurement = context.measurement();
    const {
            margin,
            border,
            titleSpaces,
            width,
            height,
            maxWidth,
            maxHeight
        } = measurement;

    gradHeight = height - (titleSpaces.height + 2 * margin + 2 * border);
    gradWidth = width - (margin * 2 + border * 2);

    maxGradHeight = maxHeight - (titleSpaces.height + margin * 2 + border * 2);
    maxGradWidth = maxWidth - (margin * 2 + border * 2);

    let legendBody = makeElement(container, 'div', [1], `${classPrefix}-legend-body`);

    legendBody.style(WIDTH, `${gradWidth}px`);

    legendBody.style(HEIGHT, `${gradHeight}px`);

    legendBody.select(`.${classPrefix}-legend-overflow`).remove();
        // Create a div with scroll when overflow
    if (maxGradWidth && maxGradWidth < gradWidth) {
        legendBody = legendBody.style(WIDTH, `${maxGradWidth}px`).style('overflow-x', 'scroll');
    }
        // Create a div with scroll when overflow
    if (maxGradHeight && maxGradHeight < gradHeight) {
        legendBody.style(HEIGHT, `${maxGradHeight}px`).style('overflow-y', 'scroll');
    }

    legendBody = makeElement(legendBody, 'div', [1], `${classPrefix}-legend-overflow`);

    const legendItem = getItemContainers(legendBody, data, context);
    return { legendItem };
};

/**
 * Creates legend item based on alignment and text orientation
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
    const textOrientation = item.text.orientation;
    const stack = itemStack[textOrientation];
    const itemSkeleton = makeElement(container, 'div', (d, i) => stack.map(e => [e, d[e], d.color, d.size,
        d.value, context.fieldName(), i]), `${classPrefix}-legend-item-info`);

    const alignClass = alignmentMap[textOrientation];

    itemSkeleton.classed(alignClass, true);
    return { itemSkeleton };
};

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
        iconSpaces,
        maxIconWidth
    } = context.measurement();

    const { align } = context.config().align;

    const diff = stepColorCheck ? -padding * 2 : 0;

    if (item[0] === VALUE) {
        return `${labelSpaces[item[6]][measureType]}px`;
    }

    if (measureType === 'width' && !stepColorCheck && align === VERTICAL) {
        return `${maxIconWidth}px`;
    } else if (align === HORIZONTAL) {
        return `${maxIconWidth}px`;
    }
    return `${iconSpaces[item[6]][measureType] - diff}px`;
};

/**
 *
 *
 * @param {*} str
 *
 */
const checkPath = (str) => {
    if (/^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(str) && /[\dz]$/i.test(str) && str.length > 4) {
        return true;
    }
    return false;
};

/**
 *
 *
 * @param {*} d
 * @param {*} elem
 */
const createShape = function (d, elem, defaultIcon) {
    const groupElement = elem;
    // const { shape, size, update } = d;
    const shape = d[1] || defaultIcon;
    const defaultIconSize = DEFAULTICONSIZE[shape] || DEFAULTICONSIZE[DEFAULT];
    const size = d[3] || defaultIconSize * Math.PI;

    if (shape instanceof Promise) {
        shape.then((res) => {
            d.shape = res;
            return createShape(d, elem);
        });
    } else if (shape instanceof Element) {
        let newShape = shape.cloneNode(true);

        if (newShape.nodeName.toLowerCase() === 'img') {
            const src = newShape.src || newShape.href;
            newShape = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            newShape.setAttribute('href', src);
        }
        const shapeElement = selectElement(newShape);
        shapeElement.attr('transform', `scale(${size / 100})`);
        return selectElement(groupElement.node().appendChild(newShape));
    } else if (typeof shape === 'string') {
        let pathStr;
        if (checkPath(shape)) {
            pathStr = shape;
        } else {
            pathStr = ICON_MAP(shape).size(size)();
        }
        return makeElement(groupElement, 'path', data => [data]).attr('d', pathStr);
    }
    d[1] = 'circle';
    return createShape(d, elem, 'circle');
};

/**
 * Returns the icon of the legend item
 *
 * @param {Object} datum Data property attached to the item
 * @param {number} width width of the item
 * @param {number} height height of the item
 * @return {Object|string} returns the path string or the string name of the icon
 * @memberof Legend
 */
export const getLegendIcon = (datum, width, height, defaultIcon) => {
    const icon = ICON_MAP(datum[1]);

    if (icon) {
        return icon.size(datum[3] || Math.min(width, height) * Math.PI);
    }
    return ICON_MAP(datum[3] ? 'circle' : defaultIcon).size(datum[3] || Math.min(width, height) * Math.PI);
};

/**
 *
 *
 */
export const renderIcon = (icon, container, datum, context) => {
    const {
        classPrefix,
        iconHeight,
        padding,
        color,
        iconWidth,
        align
    } = context;

    let { maxIconWidth } = context;

    if (align === HORIZONTAL) {
        maxIconWidth = iconWidth + 2 * padding;
    }
    const svg = makeElement(container, 'svg', f => [f], `${classPrefix}-legend-icon-svg`)
    .attr(WIDTH, maxIconWidth)
    .attr(HEIGHT, iconHeight)
    .style(WIDTH, `${Math.ceil(maxIconWidth)}px`)
    .style(HEIGHT, `${iconHeight}px`);

    const transalate = maxIconWidth / 2 - padding;

    if (icon !== RECT) {
        const group = makeElement(svg, 'g', [datum[1]], `${classPrefix}-legend-icon`);
        createShape(datum, group, icon)
                        .attr('transform', `translate(${transalate} ${iconHeight / 2})`)
                        .attr('fill', datum[2] || color)
                        .attr('stroke', datum[2] || color);
    } else {
        makeElement(svg, RECT, [datum[1]], `${classPrefix}-legend-icon`)
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr(WIDTH, maxIconWidth)
                        .attr(HEIGHT, iconHeight)
                        .attr('fill', datum[2] || color);
    }
};

/**
 * Renders the items in the legend i.e, icon and text
 *
 * @param {DOM} container Point where item is to be mounted
 * @memberof Legend
 */
export const renderDiscreteItem = (context, container) => {
    const labelManager = context._labelManager;
    const {
           item,
           classPrefix,
           shape,
           align
    } = context.config();
    const {
        maxIconWidth,
        padding,
        margin,
        border
    } = context.measurement();
    const {
            width: iconWidth,
            height: iconHeight,
            color,
            className
        } = item.icon;

    const textOrientation = item.text.orientation;
    const formatter = item.text.formatter;

    labelManager.useEllipsesOnOverflow(true);
    applyStyle(container, {
        width: d => applyItemStyle(d, WIDTH, false, context),
        height: d => applyItemStyle(d, HEIGHT, false, context),
        'text-align': CENTER,
        padding: `${padding}px`
    });

    const marginHorizontalBuffer = HORIZONTAL_BUFFER;

    const bufferCondition = textOrientation === TOP || textOrientation === BOTTOM
    || !padding || !margin || !border;

    const marginVerticalBuffer = bufferCondition ? 0 : VERTICAL_BUFFER;

    labelManager.setStyle(context._computedStyle);
    const dataArr = context.metaData();
    const position = OPPOSITE_POSITION[textOrientation] || LEFT;
    container.each(function (d, i) {
        if (d[0] === VALUE) {
            selectElement(this).text(formatter(d[1], i, dataArr, context))
            .style(`padding-${position}`, '0px')
            .style(`margin-${position}`, `${align === HORIZONTAL ? marginHorizontalBuffer : marginVerticalBuffer}px`);
        } else {
            // const icon = getLegendIcon(d, iconWidth, iconHeight, type);
            selectElement(this).classed(`${classPrefix}-${className}`, true);
            selectElement(this).classed(`${classPrefix}-${className}-${i}`, true);
            renderIcon(shape, selectElement(this), d, {
                classPrefix,
                // iconWidth,
                iconWidth: 2 * Math.sqrt(d[3] / Math.PI) || iconWidth,
                iconHeight,
                maxIconWidth,
                padding,
                color,
                align
            });
        }
    });
};

/**
* Renders the items in the legend i.e, icon and text
*
* @param {DOM} container Point where item is to be mounted
* @memberof Legend
*/
export const renderStepItem = (context, container) => {
    const labelManager = context._labelManager;
    const {
      item,
      position,
      classPrefix
   } = context.config();
    const {
      maxItemSpaces,
      maxIconWidth,
      padding
   } = context.measurement();
    const {
       width,
       height,
       color
   } = item.icon;
    const {
        formatter
   } = item.text;

    labelManager.useEllipsesOnOverflow(true);
    const { iconHeight, iconWidth, stepPadding } = positionConfig[position].getStepSpacesInfo({
        maxItemSpaces, height, width
    });

    applyStyle(container, {
        width: d => applyItemStyle(d, WIDTH, stepPadding.horizontal, context),
        height: d => applyItemStyle(d, HEIGHT, stepPadding.vertical, context),
        'text-align': 'center',
        padding: `${padding}px`
    });

    labelManager.setStyle(context._computedStyle);
    const dataArr = context.metaData();
    const data = context.data();
    container.each(function (d, i) {
        if (d[0] === VALUE) {
            const formattedData = formatter([data[d[6]].range[0], data[d[6]].range[1]], i, dataArr, context);
            selectElement(this).text(formattedData);
        } else {
            renderIcon(RECT, selectElement(this), d, {
                classPrefix,
                iconWidth,
                iconHeight,
                maxIconWidth,
                color
            });
        }
    });
};
