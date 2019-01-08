import { TOP, LEFT, BOTTOM } from '../enums/axis-orientation';

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
    context.config({ xOffset: x, yOffset: y });
};

export const getNumberOfTicks = (availableSpace, labelDim, axis, axisInstance) => {
    const ticks = axis.scale().ticks();
    const { numberOfTicks } = axisInstance.config();
    const tickLength = ticks.length;
    let numberOfValues = tickLength;

    if (tickLength * (labelDim * 1.5) > availableSpace) {
        numberOfValues = Math.floor(availableSpace / (labelDim * 1.5));
    }

    numberOfValues = Math.min(numberOfTicks, Math.max(2, numberOfValues));

    return axis.scale().ticks(numberOfValues);
};

export const getAxisComponentDimensions = (context) => {
    let largestTick = '';
    let largestTickDimensions = { width: 0, height: 0 };
    let smartTick = {};
    let axisTicks;
    const allTickDimensions = [];
    const scale = context.scale();
    const { showAxisName } = context.renderConfig();
    const { tickValues, name } = context.config();
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
        return null;
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
    const { tickSize, tickDimensions, axisNameDimensions } = axisDimensions;
    const { axisNamePadding, tickValues } = context.config();
    const { showAxisName } = context.renderConfig();
    const { height: axisDimHeight } = axisNameDimensions;
    const { height: tickDimHeight, width: tickDimWidth } = tickDimensions;

    width = range && range.length ? range[1] - range[0] : 0;

    height = 0;
    if (tickValues) {
        const minTickDiff = context.getMinTickDifference();
        const [min, max] = [
            Math.min(...tickValues, ...domain),
            Math.max(...tickValues, ...domain)
        ];

        width = ((max - min) / Math.abs(minTickDiff)) * (tickDimWidth + context._minTickDistance.width);
    }
    if (!width || width === 0) {
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
    width += (showAxisName ? axisDimHeight : 0) + tickSize + axisNamePadding;

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

        if (!width || width === 0) {
            width = allTickDimensions.reduce((t, n) =>
                t + Math.min(n.width, n.height) + minTickWidth, 0);
        }
        if (show === false) {
            height = 0;
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
        height = axisTicks.length * (largestDimHeight + context._minTickDistance.height) + largestDimHeight;
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

export const setContinousAxisDomain = (context, domain) => {
    const { nice, domain: userDom } = context.config();
    if (userDom) {
        domain = userDom;
    }
    if (domain.length && domain[0] === domain[1]) {
        domain = [0, +domain[0] * 2];
    }
    context.scale().domain(domain);
    nice && context.scale().nice();
    context._domain = context.scale().domain();
};
