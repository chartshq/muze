import { makeElement, numberInterpolator } from 'muze-utils';

import {
    SCALE_FUNCTIONS,
    WIDTH,
    HEIGHT,
    CENTER,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
} from '../enums/constants';

/**
 *
 *
 * @param {*} scale
 * @returns
 */
export const getScaleInfo = (scale) => {
    const scaleType = scale.constructor.type();
    const domain = scale.uniqueValues();
    const steps = scale.config().steps;
    const scaleFn = SCALE_FUNCTIONS[scaleType];

    return { scaleType, domain, steps, scaleFn };
};

/**
 *
 *
 * @param {*} domain
 * @param {*} steps
 * @returns
 */
export const getInterpolatedData = (domain, steps) => {
    const domainForLegend = [];
    const interpolatedFn = numberInterpolator()(domain[0], domain[1]);

    for (let i = 0; i <= steps; i++) {
        domainForLegend[i] = interpolatedFn(i / steps);
    }
    return domainForLegend;
};

/**
 *
 *
 * @param {*} container
 * @param {*} text
 * @param {*} measurement
 * @param {*} classPrefix
 */
export const titleCreator = (container, text, measurement, classPrefix) =>
                makeElement(container, 'div', [1], `${classPrefix}-legend-title`)
                                .style(WIDTH, '100%')
                                .style(HEIGHT, `${measurement.height}px`)
                                .style('padding-left', `${measurement.padding}px`)
                                .style('padding-right', `${measurement.padding}px`)
                                .style('border-bottom-width', `${measurement.border}px`)
                                .style('text-align', CENTER)
                                .text(text)
                                .node();

/**
 *
 *
 * @param {*} data
 * @param {*} prop
 * @param {*} labelManager
 * @return
 */
export const getMaxMeasures = (data, prop, labelManager) => {
    let maxHeight = -Infinity;
    let maxWidth = -Infinity;

    data.forEach((item) => {
        const value = prop ? item[prop] : item;
        const space = labelManager.getOriSize(value);
        maxHeight = Math.max(space.height + 2, maxHeight);
        maxWidth = Math.max(space.width + 2, maxWidth);
    });

    return { height: maxHeight, width: maxWidth };
};

/**
 *
 *
 * @param {*} data
 * @param {*} prop
 * @param {*} labelManager
 * @return
 */
export const getItemMeasures = (data, prop, labelManager) => {
    const space = [];

    data.forEach((item, index) => {
        const value = prop ? item[prop] : item;
        const { height, width } = labelManager.getOriSize(value);
        space[index] = { height: height + 1, width: width + 1 };
    });
    return space;
};

/**
 *
 *
 * @param {*} textPosition
 * @param {*} effPadding
 * @param {*} titleSpace
 * @return
 * @memberof Legend
 */
export const computeItemSpaces = (config, measures, data) => {
    let totalHeight = 0;
    let totalWidth = 0;
    let maxItemSpaces = {
        width: 0, height: 0
    };
    const {
        effPadding,
        titleWidth,
        labelSpaces,
        titleHeight,
        maxWidth
    } = measures;
    const {
        item,
        align,
    } = config;
    const {
        shape,
        text
    } = item;
    const textPosition = text.position;
    const itemSpaces = [];
    const shapeSpaces = [];
    let maxShapeWidth = 0;
    labelSpaces.forEach((labelSpace, i) => {
        const itemSpace = { width: 0, height: 0 };
        const shapeSpace = { width: 0, height: 0 };
            // Compute each legend item height/width
        if (textPosition === LEFT || textPosition === RIGHT) {
            // Get label, shape and item widths
            labelSpace.width += effPadding;
            shapeSpace.width = (data[i].size ? 2 * Math.sqrt(data[i].size / Math.PI) : shape.width) + effPadding;
            maxShapeWidth = Math.max(shapeSpace.width, maxShapeWidth);
            itemSpace.width = labelSpace.width + maxShapeWidth;

            // Get label, shape and item heights
            labelSpace.height = Math.max(labelSpace.height, shape.height) + effPadding;
            shapeSpace.height = labelSpace.height;
            itemSpace.height = labelSpace.height;
        } else {
            // Get label, shape and item widths
            labelSpace.width = Math.max(labelSpace.width, data[i].size ? 2 * Math.sqrt(data[i].size / Math.PI)
            : shape.width) + effPadding;
            shapeSpace.width = labelSpace.width;
            itemSpace.width = labelSpace.width;
            maxShapeWidth = Math.max(shapeSpace.width, maxShapeWidth);

            // Get label, shape and item heights
            labelSpace.height += effPadding;
            shapeSpace.height = shape.height + effPadding;
            itemSpace.height = labelSpace.height + shapeSpace.height;
        }
        // Compute height and width of legend for each alignment
        if (align === 'horizontal') {
            totalHeight = Math.max(totalHeight, itemSpace.height);
        } else {
            totalHeight += itemSpace.height;

            totalWidth = Math.max(totalWidth, itemSpace.width, titleWidth);
        }
        maxItemSpaces = {
            width: Math.max(itemSpace.width, maxItemSpaces.width),
            height: Math.max(itemSpace.height, maxItemSpaces.height)
        };
        itemSpaces.push(itemSpace);
        shapeSpaces.push(shapeSpace);
    });

    itemSpaces.forEach((itemSpace, i) => {
        if (align === 'horizontal') {
            itemSpace.height = totalHeight;
            shapeSpaces[i].width = maxShapeWidth;
            if (textPosition === LEFT || textPosition === RIGHT) {
                labelSpaces[i].height = totalHeight;
                shapeSpaces[i].height = totalHeight;
                itemSpaces[i].width = labelSpaces[i].width + maxShapeWidth;
            } else {
                labelSpaces[i].width = maxShapeWidth;
                itemSpaces[i].width = maxShapeWidth;
                labelSpaces[i].width = maxShapeWidth;
            }
            totalWidth = Math.max(totalWidth + itemSpaces[i].width, titleWidth);
        } else {
            itemSpace.width = Math.max(totalWidth, maxWidth);
            if (textPosition === TOP || textPosition === BOTTOM) {
                labelSpaces[i].width = totalWidth;
                shapeSpaces[i].width = totalWidth;
            } else {
                shapeSpaces[i].width = maxShapeWidth;
                itemSpaces[i].width = labelSpaces[i].width + maxShapeWidth;
                labelSpaces[i].width = maxItemSpaces.width - maxShapeWidth;
                totalWidth = Math.max(totalWidth, itemSpace.width, titleWidth);
            }
        }
    });
    totalHeight += titleHeight + effPadding;

    return { totalHeight, totalWidth, itemSpaces, shapeSpaces, maxItemSpaces, maxShapeWidth };
};

/**
 *
 *
 * @param {*} type
 * @param {*} scaleInfo
 * @param {*} domainInfo
 * @returns
 */
export const getDomainBounds = (type, scaleInfo, domainInfo) => {
    const {
        scaleFn,
        scaleType,
        scale
    } = scaleInfo;
    const {
        domain,
        domainBounds,
        domainLeg,
        steps
    } = domainInfo;
    const ele = domain[type === 'lower' ? 0 : steps.length - 1];
    const step = steps[type === 'lower' ? 0 : steps.length - 1];

    return {
        [scaleType]: scaleType === 'size' ? scale[scaleFn](ele) * scale.getScaleFactor() : scale[scaleFn](ele),
        value: domainBounds[type],
        id: type === 'lower' ? 0 : domainLeg.length + 2,
        range: [ele, step]
    };
};
