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
    RIGHT
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
        iconSpaces,
        maxIconWidth
    } = context.measurement();
    const diff = stepColorCheck ? -padding * 2 : 0;

    if (item[0] === VALUE) {
        return `${labelSpaces[item[6]][measureType]}px`;
    }
    return `${measureType === 'width' && !stepColorCheck ? maxIconWidth : iconSpaces[item[6]][measureType] - diff}px`;
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
        maxIconWidth,
        padding,
        color
    } = context;
    const svg = makeElement(container, 'svg', f => [f], `${classPrefix}-legend-icon-svg`)
    .attr(WIDTH, maxIconWidth)
    .attr(HEIGHT, iconHeight)
    .style(WIDTH, `${maxIconWidth}px`)
    .style(HEIGHT, `${iconHeight}px`);

    if (icon !== RECT) {
        makeElement(svg, 'path', [datum[1]], `${classPrefix}-legend-icon`)
                        .attr('d', icon)
                        .attr('transform', `translate(${maxIconWidth / 2 - padding} ${iconHeight / 2})`)
                        .attr('fill', datum[2] || color);
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
 *
 *
 * @param {*} container
 * @param {*} data
 * @param {*} legendInstance
 * @param {*} align
 * @return
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
 * @returns
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

    legendBody.style(WIDTH, `${gradWidth}px`);
    legendBody.style(HEIGHT, `${gradHeight}px`);

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
 * Renders the items in the legend i.e, icon and text
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
        maxIconWidth,
        padding
    } = context.measurement();
    const {
            width: iconWidth,
            height: iconHeight,
            color,
            type,
            className
        } = item.icon;

    const textOrientation = item.text.orientation;

    labelManager.useEllipsesOnOverflow(true);
    applyStyle(container, {
        width: d => applyItemStyle(d, WIDTH, false, context),
        height: d => applyItemStyle(d, HEIGHT, false, context),
        'text-align': CENTER,
        padding: `${padding}px`
    });

    labelManager.setStyle(context._computedStyle);
    container.each(function (d, i) {
        if (d[0] === VALUE) {
            selectElement(this).text(d[1])
                            .style(`padding-${textOrientation === RIGHT ? LEFT : RIGHT}`, '0px');
        } else {
            const icon = getLegendIcon(d, iconWidth, iconHeight, type);
            selectElement(this).classed(`${classPrefix}-${className}`, true);
            selectElement(this).classed(`${classPrefix}-${className}-${i}`, true);
            renderIcon(icon, selectElement(this), d, {
                classPrefix,
                iconWidth: 2 * Math.sqrt(d[3] / Math.PI) || iconWidth,
                iconHeight,
                maxIconWidth,
                padding,
                color
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
    container.each(function (d) {
        if (d[0] === VALUE) {
            selectElement(this).text(d[1]);
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
