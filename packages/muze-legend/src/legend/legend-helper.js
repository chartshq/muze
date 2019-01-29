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
 * @param  {} domain
 * @param  {} domainForLegend
 * @param  {} context
 */
export const getInterpolatedArrayData = (domain, domainForLegend, context) => {
    const { align } = context.config();
    const availableSpace = context.measurement();
    let currentTickValue;
    let nextTickValue;
    let upperBound = domainForLegend[domainForLegend.length - 1];
    if (!Number.isInteger(domainForLegend[domainForLegend.length - 1])) {
        upperBound = ((domainForLegend[domainForLegend.length - 1]).toFixed(2));
    }
    const [min, max] = [Math.min(...domainForLegend), Math.max(...domainForLegend)];
    const tickDimension = context._labelManager;
    const minimumTickSize = tickDimension.getOriSize('w');
    const { height: tickDimHeight, width: tickDimWidth } = tickDimension.getOriSize((upperBound).toString());
    let minTickDiff = (domainForLegend[1] - domainForLegend[0]);
    for (let i = 1; i < domainForLegend.length; i++) {
        if ((domainForLegend[i] - domainForLegend[i - 1]) < minTickDiff &&
        (domainForLegend[i] - domainForLegend[i - 1]) !== 0) {
            minTickDiff = domainForLegend[i] - domainForLegend[i - 1];
        }
    }
    if (align === 'horizontal') {
        const availableMaxWidth = availableSpace.maxWidth;
        const requiredWidth = ((max - min) / Math.abs(minTickDiff)) * (tickDimWidth + (minimumTickSize.width * 3 / 4));
        if (availableMaxWidth >= requiredWidth) {
            return domainForLegend;
        }
        const pixelPerTick = (availableMaxWidth / domainForLegend[domainForLegend.length - 1]);
        currentTickValue = (tickDimension.getOriSize((domainForLegend[0]).toString()).width);
        for (let i = 1; i < domainForLegend.length; i++) {
            nextTickValue = ((currentTickValue / pixelPerTick) + (currentTickValue / 2) + domainForLegend[i - 1]);
            if (domainForLegend[i] < nextTickValue) {
                domainForLegend.splice(i, 1);
                i -= 1;
            }
            currentTickValue = (tickDimension.getOriSize((domainForLegend[i]).toString()).width);
        }
        return domainForLegend;
    }
    const availableMaxHeight = availableSpace.maxHeight;
    const requiredHeight = ((max - min) / Math.abs(minTickDiff)) * tickDimHeight;
    if (availableMaxHeight >= requiredHeight) {
        return domainForLegend;
    }
    const pixelPerTick = (availableMaxHeight / domainForLegend[domainForLegend.length - 1]);
    currentTickValue = (tickDimension.getOriSize((domainForLegend[0]).toString()).height);
    for (let i = 1; i < domainForLegend.length; i++) {
        nextTickValue = ((currentTickValue / pixelPerTick) + domainForLegend[i - 1]);
        if (domainForLegend[i] < nextTickValue) {
            domainForLegend.splice(i, 1);
            i -= 1;
        }
        currentTickValue = (tickDimension.getOriSize((domainForLegend[i]).toString()).height);
    }
    return domainForLegend;
};

/**
 * @param  {} domain
 * @param  {} steps
 * @param  {} context
 */
export const getInterpolatedData = (domain, steps, context) => {
    // To round the floating values to Integer and checking if value is 1.
    steps = Math.round(steps);
    steps = steps < 1 ? (steps + 1) : steps;

    // declaring recomputeSteps Variable
    let recomputeSteps = 0;

    const getTickMeasure = context._labelManager;
    const maxWidth = context._measurement.maxWidth;
    const maxHeight = context._measurement.maxHeight;
    const alignment = context.config().position;
    const domainForLegend = [];
    const interpolatedFn = numberInterpolator()(domain[0], domain[1]);

    // getting tick measure(i.e height and width)
    const tickValue = getTickMeasure.getOriSize((domain[1].toFixed(2)).toString());

    // checking alignment of the Axis
    if (alignment === TOP || alignment === BOTTOM) {
        recomputeSteps = Math.floor(maxWidth / (tickValue.width));
    } else {
        recomputeSteps = Math.floor(maxHeight / (tickValue.height));
    }
    steps = Math.min(steps, recomputeSteps);

    // scaling the axis based on steps provided
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
export const getItemMeasures = (data, prop, labelManager, formatter) => {
    const space = [];

    data.forEach((item, index) => {
        const value = prop ? item[prop] : item;
        const { height, width } = labelManager.getOriSize(formatter(value));
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
            totalWidth = Math.max(totalWidth, itemSpace.width, titleWidth) + effPadding;
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
                totalWidth = Math.max(totalWidth, itemSpace.width) + effPadding;
            }
        }
    });
    totalWidth = Math.max(totalWidth, titleWidth);
    totalHeight += titleHeight + effPadding;
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
