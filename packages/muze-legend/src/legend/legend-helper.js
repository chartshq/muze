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
  * Function to recompute the stops in array in case of Top and Bottom Alignment of legend.
  *
  * @param  {number} availableMaxWidth - max Available Space
  * @param  {number} requiredWidth - required width
  * @param  {Array} domainForLegend - array
  * @param  {Object} smartLabelCalc - smartLabel manager
  * @return {Array} - Recomputed Array
  */
const getHorizontalRecomputedArray = (availableMaxWidth, requiredWidth, domainForLegend, smartLabelCalc) => {
    // declaring Current and Next Tick Value variable
    let currentTickValue;
    let nextTickValue;
    const upperBound = domainForLegend[domainForLegend.length - 1];

    // calculating pixel required per Tick Values
    const pixelPerTick = (availableMaxWidth / upperBound);

    // checking if available max width is smaller than required width for legend.
    if (availableMaxWidth >= requiredWidth) {
        return domainForLegend;
    }

    currentTickValue = (smartLabelCalc.getOriSize((domainForLegend[0])).width);
    for (let i = 1; i < domainForLegend.length; i++) {
        nextTickValue = ((currentTickValue / pixelPerTick) + (currentTickValue / 2) + domainForLegend[i - 1]);
        if (domainForLegend[i] < nextTickValue) {
            domainForLegend.splice(i, 1);
            i -= 1;
        }
        currentTickValue = (smartLabelCalc.getOriSize((domainForLegend[i])).width);
    }
    return domainForLegend;
};

/**
 * Function to recompute the stops in array in case to left and right alignment of legend.
 *
 * @param  {number} availableMaxHeight - max Available Height
 * @param  {number} requiredHeight - required height
 * @param  {Array} domainForLegend - array
 * @param  {Object} smartLabelCalc - smartLabel Manager
 * @return {Array} - Recomputed Array
 */
const getVerticalRecomputedArray = (availableMaxHeight, requiredHeight, domainForLegend, smartLabelCalc) => {
    // declaring Current and Next Tick Value variable
    let currentTickValue;
    let nextTickValue;
    const upperBound = domainForLegend[domainForLegend.length - 1];

    // calculating pixel required per Tick Values
    const pixelPerTick = (availableMaxHeight / upperBound);

    // checking if available max width is smaller than required width for legend.
    if (availableMaxHeight >= requiredHeight) {
        return domainForLegend;
    }

    currentTickValue = (smartLabelCalc.getOriSize((domainForLegend[0])).height);
    for (let i = 1; i < domainForLegend.length; i++) {
        nextTickValue = ((currentTickValue / pixelPerTick) + domainForLegend[i - 1]);
        if (domainForLegend[i] < nextTickValue) {
            domainForLegend.splice(i, 1);
            i -= 1;
        }
        currentTickValue = (smartLabelCalc.getOriSize((domainForLegend[i])).height);
    }
    return domainForLegend;
};

/**
 * function to recompute the Stops Array provided to prevent the Overlapping of values
 * @param  {Array} domainForLegend - Stops Array
 * @param  {Object} scaleParams - Scale Parameters
 * @return {Array} - modified Stops Array
 */
export const getInterpolatedArrayData = (domainForLegend, scaleParams) => {
    /* Checking if UpperBound of Domain is Floating or Not.
     In case of floating constricting it to 2 decimals after point. */
    let upperBound = domainForLegend[domainForLegend.length - 1];
    if (!Number.isInteger(upperBound)) {
        upperBound = ((upperBound).toFixed(2));
    }
    // Initializing Minimum Tick Difference Variable and checking if it's less than 1 or not
    let minTickDiff = (domainForLegend[1] - domainForLegend[0]);
    minTickDiff = minTickDiff < 1 ? 1 : minTickDiff;

    // gradient Alignment
    const { alignment } = scaleParams;

    // scale Measurements (i.e MaxWidth and MaxHeight available)
    const availableSpace = scaleParams.measures;

    // getting minimum and Maximum values in domain
    const [min, max] = [Math.min(...domainForLegend), Math.max(...domainForLegend)];

    // getting SmartLabel Manager to calculate tick Params
    const smartLabelCalc = scaleParams.smartLabel;

    // getting minimum Tick size (i.e height and width)
    const minimumTickSize = scaleParams.minTickDistance;

    // getting domain upperbound dimensions
    const { height: tickDimHeight, width: tickDimWidth } = smartLabelCalc.getOriSize((upperBound));

    // Getting max Available width and Height
    const { maxWidth: availableMaxWidth, maxHeight: availableMaxHeight } = availableSpace;

    // required width to render legend
    const requiredWidth = ((max - min) / Math.abs(minTickDiff)) * (tickDimWidth + (minimumTickSize.width));

    // require height to render legend
    const requiredHeight = ((max - min) / Math.abs(minTickDiff)) * tickDimHeight;

    // Checking the Alignment of the legend
    if (alignment === TOP || alignment === BOTTOM) {
        domainForLegend = getHorizontalRecomputedArray(availableMaxWidth, requiredWidth,
            domainForLegend, smartLabelCalc);
    } else {
        domainForLegend = getVerticalRecomputedArray(availableMaxHeight, requiredHeight,
        domainForLegend, smartLabelCalc);
    }

    return domainForLegend;
};

/**
 * function to recalculate steps on providing more number of stops than canvas can accomodate.
 * @param  {Array} domain - Array
 * @param  {Array} steps - Array
 * @param  {Object} scaleParams - Scale Parameters
 * @return {Array} - recalculated Step Array
 */
export const getInterpolatedData = (domain, steps, scaleParams) => {
    // declaring recomputeSteps Variable
    let recomputeSteps = 0;

    const getTickMeasure = scaleParams.smartLabel;
    const { maxWidth, maxHeight } = scaleParams.measures;
    const { alignment } = scaleParams;
    const domainForLegend = [];
    const interpolatedFn = numberInterpolator()(domain[0], domain[1]);

    // getting tick measure(i.e height and width)
    const tickValue = getTickMeasure.getOriSize(domain[1].toFixed(2));

    // To round the floating values to Integer and checking if value is 1.
    steps = Math.round(steps);
    steps = steps < 1 ? (steps + 1) : steps;

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
