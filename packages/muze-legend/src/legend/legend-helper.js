import { makeElement, numberInterpolator } from 'muze-utils';

import {
    SCALE_FUNCTIONS,
    WIDTH,
    HEIGHT,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
    MAXWIDTH
} from '../enums/constants';

/**
 *
 *
 * @param {*} scale
 *
 */
export const getScaleInfo = (scale) => {
    const scaleType = scale.constructor.type();
    const domain = scale.uniqueValues();
    const steps = scale.config().stops || 1;
    const scaleFn = SCALE_FUNCTIONS[scaleType];

    return { scaleType, domain, steps, scaleFn };
};

/**
 *
 *
 * @param {*} domain
 * @param {*} steps
 *
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
export const titleCreator = (container, title, measurement, config) => {
    const titleWidth = Math.min(measurement.maxWidth, measurement.width);

    const titleContainer = makeElement(container, 'table', [1], `${config.classPrefix}-legend-title`)
            .style(WIDTH, `${titleWidth}px`)
            .style(HEIGHT, `${measurement.height}px`)
            .style('border-bottom', `${measurement.border}px ${config.borderStyle} ${config.borderColor}`)
            .style('text-align', title.orientation instanceof Function ?
            title.orientation(config.position) : title.orientation);
    return makeElement(titleContainer, 'td', [1], `${config.classPrefix}-legend-title-text`)
                    .style(WIDTH, `${titleWidth}px`)
                    .style(MAXWIDTH, `${titleWidth}px`)
                    .style(HEIGHT, '100%')
                    .style('line-height', 1)
                    .style('padding', `${measurement.padding}px`)
                    .text(title.text)
                    .style('overflow-x', 'scroll')
                    .node();
};

/**
 *
 *
 * @param {*} data
 * @param {*} prop
 * @param {*} labelManager
 *
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
 *
 */
export const getItemMeasures = (context, prop, formatter) => {
    const space = [];
    const data = context.data();
    const labelManager = context._labelManager;

    data.forEach((item, index) => {
        const value = prop ? item[prop] : item;
        const { height, width } = labelManager.getOriSize(formatter(value, index, data, context));
        space[index] = { height: height + 1, width: width + 1 };
    });
    return space;
};

/**
 *
 *
 * @param {*} textOrientation
 * @param {*} effPadding
 * @param {*} titleSpace
 *
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
        align
    } = config;
    const {
        icon,
        text
    } = item;
    const textOrientation = text.orientation;
    const itemSpaces = [];
    const iconSpaces = [];
    let maxIconWidth = 0;
    labelSpaces.forEach((labelSpace, i) => {
        const itemSpace = { width: 0, height: 0 };
        const iconSpace = { width: 0, height: 0 };
        const datum = data[i] || {};
            // Compute each legend item height/width
        if (textOrientation === LEFT || textOrientation === RIGHT) {
            // Get label, icon and item widths
            labelSpace.width += effPadding;
            iconSpace.width = (datum.size ? 2 * Math.sqrt(datum.size / Math.PI) : icon.width) + effPadding;
            maxIconWidth = Math.max(iconSpace.width, maxIconWidth);
            itemSpace.width = labelSpace.width + maxIconWidth;

            // Get label, icon and item heights
            labelSpace.height = Math.max(labelSpace.height, icon.height) + effPadding;
            iconSpace.height = labelSpace.height;
            itemSpace.height = labelSpace.height;
        } else {
            // Get label, icon and item widths
            labelSpace.width = Math.max(labelSpace.width, datum.size ? 2 * Math.sqrt(datum.size / Math.PI)
            : icon.width) + effPadding;
            iconSpace.width = labelSpace.width;
            itemSpace.width = labelSpace.width;
            maxIconWidth = Math.max(iconSpace.width, maxIconWidth);

            // Get label, icon and item heights
            labelSpace.height += effPadding;
            iconSpace.height = icon.height + effPadding;
            itemSpace.height = labelSpace.height + iconSpace.height;
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
        iconSpaces.push(iconSpace);
    });
    itemSpaces.forEach((itemSpace, i) => {
        if (align === 'horizontal') {
            itemSpace.height = totalHeight;
            iconSpaces[i].width = maxIconWidth;
            if (textOrientation === LEFT || textOrientation === RIGHT) {
                labelSpaces[i].height = totalHeight;
                iconSpaces[i].height = totalHeight;
                itemSpaces[i].width = labelSpaces[i].width + maxIconWidth;
            } else {
                labelSpaces[i].width = maxIconWidth;
                itemSpaces[i].width = maxIconWidth;
                labelSpaces[i].width = maxIconWidth;
            }
            totalWidth = Math.max(totalWidth + itemSpaces[i].width);
        } else {
            itemSpace.width = Math.max(totalWidth, maxWidth);
            if (textOrientation === TOP || textOrientation === BOTTOM) {
                labelSpaces[i].width = totalWidth;
                iconSpaces[i].width = totalWidth;
                maxIconWidth = totalWidth;
            } else {
                const labelWidth = labelSpaces[i].width;
                const newLabelWidth = (maxItemSpaces.width - maxIconWidth);
                iconSpaces[i].width = maxIconWidth;
                itemSpaces[i].width = labelSpaces[i].width + maxIconWidth;
                labelSpaces[i].width = Math.max(labelWidth, newLabelWidth);
                totalWidth = Math.max(totalWidth, itemSpace.width);
            }
        }
    });
    totalWidth = Math.ceil(Math.max(totalWidth, titleWidth)) + effPadding;
    totalHeight += titleHeight + effPadding;
    totalHeight = Math.ceil(totalHeight);
    return { totalHeight, totalWidth, itemSpaces, iconSpaces, maxItemSpaces, maxIconWidth };
};

/**
 *
 *
 * @param {*} type
 * @param {*} scaleInfo
 * @param {*} domainInfo
 *
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
    const ele = domain[type === 'lower' ? 0 : domain.length - 1];
    const step = steps[type === 'lower' ? 0 : steps.length - 1];

    return {
        [scaleType]: scaleType === 'size' ? scale[scaleFn](ele) * scale.getScaleFactor() : scale[scaleFn](ele),
        value: domainBounds[type],
        id: type === 'lower' ? 0 : domainLeg.length + 2,
        range: [ele, step]
    };
};
