import { defaultValue } from 'muze-utils';
import { TOP, LEFT, BOTTOM } from '../enums/axis-orientation';
import { MIN_NO_OF_TICKS, DEFAULT_NO_OF_TICKS } from '../enums/constants';
import { setAxisRange, getAdjustedRange } from './space-setter';

export const getRotatedSpaces = (rotation = 0, width, height) => {
    let rotatedHeight = height;
    let rotatedWidth = width;
    if (rotation) {
        const angle = ((rotation || 0) * Math.PI) / 180;
        rotatedWidth = Math.abs(height * Math.sin(angle)) + Math.abs(width * Math.cos(angle));
        rotatedHeight = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    }
    return { width: rotatedWidth, height: rotatedHeight };
};

export const setOffset = (context) => {
    let x = 0;
    let y = 0;
    const logicalSpace = context.logicalSpace();
    const config = context.config();
    const {
        orientation,
        xOffset,
        yOffset
    } = config;
    if (orientation === LEFT) {
        x = xOffset === undefined ? logicalSpace.width : xOffset;
    }
    if (orientation === TOP) {
        y = yOffset === undefined ? logicalSpace.height : yOffset;
    }

    context.renderConfig({ xOffset: x, yOffset: y });
};

export const getNumberOfTicks = (availableSpace, labelDim, axis, axisInstance) => {
    let numberOfValues = 0;
    let tickValues = [];
    let { numberOfTicks } = axisInstance.config();
    const ticks = axis.scale().ticks();
    const tickLength = ticks.length;
    const minTickDistance = axisInstance._minTickDistance.width;

    numberOfValues = tickLength;

    if (tickLength * (labelDim + minTickDistance) > availableSpace) {
        numberOfValues = Math.floor(availableSpace / (labelDim + minTickDistance));
    }

    numberOfTicks = numberOfTicks || numberOfValues;
    numberOfValues = Math.min(numberOfTicks, Math.max(MIN_NO_OF_TICKS, numberOfValues));

    tickValues = axis.scale().ticks(numberOfValues);

    if (tickValues.length > numberOfValues) {
        tickValues = tickValues.filter((e, i) => i % 2 === 0);
    }

    if (numberOfValues === MIN_NO_OF_TICKS) {
        tickValues = axis.scale().ticks(DEFAULT_NO_OF_TICKS);
        tickValues = [tickValues[0], tickValues[tickValues.length - 1]];
    }
    return tickValues;
};

export const getAxisComponentDimensions = (context) => {
    let largestTick = '';
    let largestTickDimensions = { width: 0, height: 0 };
    let smartTick = {};
    let axisTicks;
    const allTickDimensions = [];
    const scale = context.scale();
    const { tickValues, showAxisName } = context.renderConfig();
    const { name } = context.config();
    const { labelManager } = context.dependencies();
    const labelFunc = scale.ticks || scale.quantile || scale.domain;

    // set the style on the shared label manager instance
    labelManager.setStyle(context._tickLabelStyle);

    // get the values along the domain
    axisTicks = tickValues || labelFunc();

    // Get the tick labels
    axisTicks = axisTicks.map((originalLabel, i) => {
        const label = context.getFormattedText(originalLabel, i, axisTicks);

    // convert to string for quant values
        const tickDimensions = labelManager.getOriSize(label);

    // Get spaces for all labels
        allTickDimensions.push(tickDimensions);

    // Getting largest label
        if (tickDimensions.width > largestTickDimensions.width) {
            largestTick = label;
            smartTick = context.smartTicks() ? context.smartTicks()[i] : {};

            largestTickDimensions = tickDimensions;
            smartTick = smartTick || tickDimensions;
        }
        return label;
    });

    labelManager.setStyle(context._axisNameStyle);
    const axisNameDimensions = showAxisName ? labelManager.getOriSize(name) : { width: 0, height: 0 };

    return {
        axisNameDimensions,
        largestTick,
        largestTickDimensions,
        allTickDimensions,
        axisTicks,
        smartTick,
        tickSize: context.getTickSize()
    };
};

export const computeAxisDimensions = (context) => {
    let tickDimensions = {};
    const { labels } = context.renderConfig();
    const { smartTicks, rotation } = labels;

    const {
        largestTickDimensions,
        axisTicks,
        smartTick,
        axisNameDimensions,
        allTickDimensions,
        tickSize
    } = getAxisComponentDimensions(context);
    const { height: labelHeight, width: labelWidth } = largestTickDimensions;

    // get the domain of axis
    const domain = context.domain();
    // const angle = ((rotation || 0) * Math.PI) / 180;

    if (domain.length === 0) {
        return {
            allTickDimensions,
            tickSize: 0,
            tickDimensions: { height: 0, width: 0 },
            axisNameDimensions,
            largestTickDimensions,
            axisTicks
        };
    }

    if (smartTicks) {
        tickDimensions = smartTick;
    } else {
        tickDimensions = { width: labelWidth, height: labelHeight };
    }
    tickDimensions = getRotatedSpaces(rotation, tickDimensions.width, tickDimensions.height);

    if (tickSize === 0) {
        tickDimensions = { width: 0, height: 0 };
    }

    return {
        allTickDimensions,
        tickSize,
        tickDimensions,
        axisNameDimensions,
        largestTickDimensions,
        axisTicks
    };
};

/**
 *
 *
 * @param {*} axisDimensions
 * @param {*} config
 * @param {*} range
 *
 */
export const getHorizontalAxisSpace = (context, axisDimensions, range) => {
    let width;
    let height;
    const domain = context.domain();
    const minTickDistance = context._minTickDistance.width;
    const { tickSize, tickDimensions, axisNameDimensions } = axisDimensions;
    const { axisNamePadding, tickValues } = context.config();
    const { showAxisName } = context.renderConfig();
    const { height: axisDimHeight } = axisNameDimensions;
    const { height: tickDimHeight, width: tickDimWidth } = tickDimensions;

    width = range && range.length ? range[1] - range[0] : ((tickDimWidth + minTickDistance) * 3);

    height = 0;
    if (tickValues) {
        const minTickDiff = context.getMinTickDifference();
        const [min, max] = [
            Math.min(...tickValues, ...domain),
            Math.max(...tickValues, ...domain)
        ];

        width = ((max - min) / Math.abs(minTickDiff)) * (tickDimWidth + context._minTickDistance.width);
    }
    if (!range || !range.length) {
        height = Math.max(tickDimWidth, tickDimHeight);
    } else {
        height = tickDimHeight;
    }

    height += (showAxisName ? axisDimHeight + axisNamePadding : 0) + tickSize;

    return {
        width,
        height
    };
};

/**
 *
 *
 * @param {*} axisDimensions
 * @param {*} config
 * @param {*} range
 *
 */
export const getVerticalAxisSpace = (context, axisDimensions) => {
    let height;
    let width;
    const domain = context.domain();
    const { tickSize, tickDimensions, axisNameDimensions } = axisDimensions;
    const { axisNamePadding, tickValues } = context.config();
    const { showAxisName } = context.renderConfig();
    const { height: axisDimHeight } = axisNameDimensions;
    const { height: tickDimHeight, width: tickDimWidth } = tickDimensions;

    height = 0;
    width = tickDimWidth;
    if (tickValues) {
        const minTickDiff = context.getMinTickDifference();
        const [min, max] = [
            Math.min(...tickValues, ...domain),
            Math.max(...tickValues, ...domain)
        ];

        height = ((max - min) / Math.abs(minTickDiff)) * tickDimHeight;
    }
    width += (showAxisName ? axisDimHeight : 0) + tickSize + (tickValues ? axisNamePadding : 0);

    return {
        height,
        width
    };
};

/**
 * Calculates the logical space of the axis
 * @return {Object} Width and height occupied by the axis.
 */
export const calculateBandSpace = (context) => {
    const range = context.range();
    const axisDimensions = context.getAxisDimensions();

    const { orientation } = context.config();
    const { show } = context.renderConfig();
    const { largestTickDimensions, axisTicks, allTickDimensions } = axisDimensions;
    const { height: largestDimHeight } = largestTickDimensions;
    const minTickWidth = context._minTickDistance.width;
    if (orientation === TOP || orientation === BOTTOM) {
        let {
            width,
            height
        } = getHorizontalAxisSpace(context, axisDimensions, range);

        if (!range || !range.length) {
            width = allTickDimensions.reduce((t, n) =>
                t + Math.min(n.width, n.height) + minTickWidth, 0);
        }

        if (show === false) {
            height = 0;
            width = 0;
        }
        return {
            width,
            height
        };
    }

    let {
        width,
        height
    } = getVerticalAxisSpace(context, axisDimensions, range);

    if (!height || height === 0) {
        height = axisTicks.length * (largestDimHeight + context._minTickDistance.height);
    }
    if (show === false) {
        width = 0;
    }
    return {
        width,
        height
    };
};

/**
 * Calculates the logical space of the axis
 * @return {Object} Width and height occupied by the axis.
 */
export const calculateContinousSpace = (context) => {
    const range = context.range();
    const axisDimensions = context.getAxisDimensions();
    const { orientation } = context.config();
    const { show, showAxisName } = context.renderConfig();
    const { axisNameDimensions } = axisDimensions;

    if (show === false) {
        return {
            width: 0,
            height: 0
        };
    }

    const { width: axisNameWidth } = axisNameDimensions;

    if (orientation === TOP || orientation === BOTTOM) {
        const {
            width,
            height
        } = getHorizontalAxisSpace(context, axisDimensions, range);
        const axisWidth = Math.max(width, axisNameWidth);

        return {
            width: axisWidth,
            height
        };
    }
    const {
        width,
        height
    } = getVerticalAxisSpace(context, axisDimensions, range);

    const effHeight = Math.max(height, showAxisName ? axisNameWidth : 0);

    return {
        width,
        height: effHeight
    };
};

/**
 * Overwrites domain with user defined domain (if present)
 * @param {Object} context reference to current axes
 * @param {Array} domain default domain
 *
 * @return {Array} domain
 */
export const getValidDomain = (context, domain) => {
    const { domain: userDom } = context.config();

    if (userDom) {
        domain = userDom;
    }

    return defaultValue(domain, []);
};

export const setContinousAxisDomain = (context, domain) => {
    const { nice } = context.config();
    const scale = context.scale.bind(context);

    scale().domain(domain);
    nice && scale().nice();
    context._domain = scale().domain();
};

/**
 * Checks if any of the properties have changed between two objects
 * @param {Object} obj first object
 * @param {Object} obj1 second object
 * @param {Array} properties properties to be compared between two objects
 *
 * @return {Boolean} boolean value
 */
export const hasAxesConfigChanged = (obj = {}, obj1 = {}, properties) => {
    if (!Object.keys(obj).length || !Object.keys(obj1).length) {
        return false;
    }
    return properties.some(key => obj[key] !== obj1[key]);
};

export const resetTickInterval = (context, domain) => {
    const {
        orientation,
        isOffset
    } = context.config();

    const minDiff = context._minDiff;
     // Set available space on interaction
    if (context.range().length && (orientation === TOP || orientation === BOTTOM)) {
        context.applyTickSkipping();
        const {
            largestTickDimensions
        } = context.getAxisDimensions();

        const noOfTicks = context.getTickValues().length;

        const { width, height, padding } = context.availableSpace();
        const {
            left,
            right
        } = padding;
        // Get the Tick Interval
        const tickInterval = Math.min(largestTickDimensions.width,
            ((width - (noOfTicks - 1) * (context._minTickDistance.width)) / noOfTicks));

        context.maxTickSpaces({
            width: tickInterval
        });

        const adjustedRange = getAdjustedRange(minDiff, [tickInterval / 2,
            width - left - right - tickInterval / 2], domain, context.config());

         // set range for axis
        setAxisRange(context, 'y', adjustedRange, isOffset ? height : null);

        context.setTickConfig();
    }
};

export const getSmartAxisName = (name, width, labelManager) => {
    const oriSize = labelManager.getOriSize(name);

    labelManager.useEllipsesOnOverflow(true);

    return labelManager.getSmartText(name, width, oriSize.height, true);
};
