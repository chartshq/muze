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

/**
 * Listener attached to the axis on change of parameters.
 *
 * @param {Function} callback to be excuted on change of domain range etc
 * @memberof SimpleAxis
 */
export const registerChangeListeners = (context) => {
    const store = context.store();

    store.model.next(
    ['domain', 'range', 'mount', 'config'],
    (...params) => {
        context.render();
        context._domainLock = false;
        context._eventList.forEach((e) => {
            e.action instanceof Function && e.action(...params);
        });
    },
    true
  );
    return context;
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
    const { tickValues, name, showAxisName } = context.config();
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
    const { labels } = context.config();
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
 * @returns
 */
export const getHorizontalAxisSpace = (context, axisDimensions, config, range) => {
    let width;
    let height;
    const { tickSize, largestTickDimensions, axisNameDimensions } = axisDimensions;
    const { axisNamePadding, showAxisName, tickValues } = config;
    const domain = context.domain();
    const { height: axisDimHeight } = axisNameDimensions;
    const { height: tickDimHeight, width: tickDimWidth } = largestTickDimensions;

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
 * @returns
 */
export const getVerticalAxisSpace = (context, axisDimensions, config) => {
    let height;
    let width;
    const { tickSize, largestTickDimensions, axisNameDimensions } = axisDimensions;
    const { axisNamePadding, showAxisName, tickValues } = config;
    const domain = context.domain();
    const { height: axisDimHeight } = axisNameDimensions;
    const { height: tickDimHeight, width: tickDimWidth } = largestTickDimensions;

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
    const config = context.config();
    const { orientation, show } = config;
    const axisDimensions = context.getAxisDimensions();

    const { largestTickDimensions, axisTicks } = axisDimensions;
    const { height: largestDimHeight, width: largestDimWidth } = largestTickDimensions;

    if (orientation === TOP || orientation === BOTTOM) {
        let { width, height } = getHorizontalAxisSpace(context, axisDimensions, config, range);
        if (!width || width === 0) {
            width = axisTicks.length * Math.min(largestDimWidth + context._minTickDistance.width,
                largestDimHeight + context._minTickDistance.width);
        }
        if (show === false) {
            height = 0;
        }

        return {
            width,
            height
        };
    }

    let { width, height } = getVerticalAxisSpace(context, axisDimensions, config, range);

    if (!height || height === 0) {
        height = axisTicks.length * (largestDimHeight + largestDimHeight / 2) + largestDimHeight;
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
    const config = context.config();
    const axisDimensions = context.getAxisDimensions();

    const { orientation, show, showAxisName } = config;
    const { axisNameDimensions } = axisDimensions;

    if (show === false) {
        return {
            width: 0,
            height: 0
        };
    }

    const { width: axisNameWidth } = axisNameDimensions;

    if (orientation === TOP || orientation === BOTTOM) {
        const { width, height } = getHorizontalAxisSpace(context, axisDimensions, config, range);
        const axisWidth = Math.max(width, axisNameWidth);

        return {
            width: axisWidth,
            height
        };
    }
    const { width, height } = getVerticalAxisSpace(context, axisDimensions, config, range);

    const effHeight = Math.max(height, showAxisName ? axisNameWidth : 0);

    return {
        width,
        height: effHeight
    };
};
