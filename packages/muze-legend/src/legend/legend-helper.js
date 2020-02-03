import { makeElement, FieldType, getReadableTicks } from 'muze-utils';

import {
    SCALE_FUNCTIONS,
    WIDTH,
    HEIGHT,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
    MAXWIDTH,
    CENTER,
    HORIZONTAL,
    POSITION_ALIGNMENT_MAP
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
 * Function to recompute the stops in array in case to left and right alignment of legend.
 *
 * @param  {string} param - parameter to measure
 * @param  {Object} requiredMeasure - required measure parameters
 * @param  {Object} availableMeasure - available meassure parameters
 * @param  {Array} domainForLegend - array
 * @param  {Object} smartLabelCalc - smartLabel Manager
 * @return {Array} - Array
 */
const getcomputedArray = (computationhelper, requiredMeasure, availableMeasure, domainForLegend) => {
    // declaring Current and Next Tick Value variable
    let currentTickValue;
    let nextTickValue;
    const upperBound = domainForLegend[domainForLegend.length - 1];
    const param = computationhelper.measureParam;
    const smartLabelCalc = computationhelper.smartLabelCalc;

    // calculating pixel required per Tick Values
    const pixelPerTick = (availableMeasure[param] / upperBound);

    // checking if available max width is smaller than required width for legend.
    if (availableMeasure[param] >= requiredMeasure[param]) {
        return domainForLegend;
    }

    currentTickValue = (smartLabelCalc.getOriSize((domainForLegend[0]))[param]);
    for (let i = 1; i < domainForLegend.length - 1; i++) {
        nextTickValue = Math.floor((currentTickValue / pixelPerTick) + domainForLegend[i - 1]);
        if (domainForLegend[i] < nextTickValue) {
            domainForLegend.splice(i, 1);
            i -= 1;
        }
        currentTickValue = (smartLabelCalc.getOriSize((domainForLegend[i]))[param]);
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
    // defining param for height/width selector
    let measureParam;

    // declaring variable for required Width
    let requiredWidth;

    // declaring variable for required height
    let requiredHeight;

    // declaring the variable for upperbound
    let upperBound = domainForLegend[domainForLegend.length - 1];

    // Initializing Minimum Tick Difference Variable and checking if it's less than 1 or not
    let minTickDiff = Math.ceil(domainForLegend[1] - domainForLegend[0]);

    // calculating max tick difference
    const maxTickDiff = Math.ceil(upperBound - domainForLegend[0]);

    // gradient Alignment
    const { alignment } = scaleParams;

    // getting SmartLabel Manager to calculate tick Params
    const smartLabelCalc = scaleParams.smartLabel;

    // scale Measurements (i.e MaxWidth and MaxHeight available)
    const availableSpace = scaleParams.measures;

    // getting minimum Tick size (i.e height and width)
    const minimumTickSize = scaleParams.minTickDistance;

    // getting domain upperbound dimensions
    const { height: tickDimHeight, width: tickDimWidth } = smartLabelCalc.getOriSize((upperBound));

    /* Checking if UpperBound of Domain is Floating or Not.
    In case of floating constricting it to 2 decimals after point. */
    if (!Number.isInteger(upperBound)) {
        upperBound = ((upperBound).toFixed(2));
    }

    // Calculating minimum tick difference
    minTickDiff = minTickDiff < 1 ? 1 : minTickDiff;

    // required width to render legend
    requiredWidth = (Math.abs(maxTickDiff) / Math.abs(minTickDiff)) * (tickDimWidth + (minimumTickSize.width));

    requiredWidth -= Math.abs(maxTickDiff);

    // require height to render legend
    requiredHeight = (Math.abs(maxTickDiff) / Math.abs(minTickDiff)) * tickDimHeight;

    requiredHeight -= Math.abs(maxTickDiff);

    // checking the alignment of legend
    if (alignment === TOP || alignment === BOTTOM) {
        measureParam = WIDTH;
    } else {
        measureParam = HEIGHT;
    }

    // calculating computed array
    domainForLegend = getcomputedArray({
        smartLabelCalc,
        measureParam
    }, {
        height: requiredHeight,
        width: requiredWidth
    }, {
        height: availableSpace.maxHeight,
        width: availableSpace.maxWidth
    }, domainForLegend);

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

    return getReadableTicks(domain, steps);
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
    const { orientation } = config.item.text;
    let textAlign = LEFT;
    const { alignment, maxWidth, width, height, border, padding } = measurement;

    if (orientation === TOP || orientation === BOTTOM || alignment === HORIZONTAL) {
        textAlign = CENTER;
    }
    const titleWidth = Math.min(maxWidth, width);

    const titleContainer = makeElement(container, 'table', [1], `${config.classPrefix}-legend-title`)
            .style(WIDTH, `${titleWidth}px`)
            .style(HEIGHT, `${height}px`)
            .style('border-bottom', `${border}px ${config.borderStyle} ${config.borderColor}`)
            .style('text-align', title.orientation instanceof Function ?
            title.orientation(config.position) : title.orientation);
    return makeElement(titleContainer, 'td', [1], `${config.classPrefix}-legend-title-text`)
                    .style(WIDTH, `${titleWidth}px`)
                    .style(MAXWIDTH, `${maxWidth}px`)
                    .style(HEIGHT, '100%')
                    .style('line-height', 1)
                    .style('padding', `${padding}px`)
                    .text(title.text)
                    .style('text-align', textAlign)
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
        const formattedData = formatter(value, index, context.metaData(), context);
        const { height, width } = labelManager.getOriSize(formattedData);
        space[index] = { height, width };
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
            // iconSpaces[i].width = maxIconWidth;
            if (textOrientation === LEFT || textOrientation === RIGHT) {
                labelSpaces[i].height = totalHeight;
                iconSpaces[i].height = totalHeight;
                itemSpaces[i].width = labelSpaces[i].width + iconSpaces[i].width + 2 * effPadding;
            } else {
                labelSpaces[i].width = iconSpaces[i].width;
                itemSpaces[i].width = iconSpaces[i].width;
                labelSpaces[i].width = iconSpaces[i].width;
            }
            totalWidth += itemSpaces[i].width;
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
                itemSpaces[i].width = labelWidth + maxIconWidth;
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

export const prepareSelectionSetData = (data, fieldName, dm) => {
    const fieldType = dm.getFieldsConfig()[fieldName].def.type;
    if (fieldType === FieldType.DIMENSION) {
        return {
            keys: data.reduce((acc, d) => {
                acc[d.rawVal] = {
                    uid: d.id,
                    dims: [d.rawVal]
                };
                return acc;
            }, {}),
            fields: [fieldName]
        };
    }
    return {
        keys: data.reduce((acc, d) => {
            acc[d.id] = {
                uid: d.id,
                dims: [d.id]
            };
            return acc;
        }, {}),
        fields: [fieldName]
    };
};

export const calculateTitleWidth = (measures, titleWidth, config) => {
    const { maxItemSpaces, margin, itemSpaces } = measures;
    const { position, buffer } = config;
    const alignment = POSITION_ALIGNMENT_MAP[position];
    let width = 0;

    if (alignment === HORIZONTAL) {
        const localBuffer = buffer[alignment];
        width = itemSpaces.reduce((acc, cur) => acc + cur.width + localBuffer, 0);
    } else if (maxItemSpaces.width < titleWidth) {
        width = titleWidth + 2 * margin;
    } else {
        width = maxItemSpaces.width;
    }
    return width;
};
