import { TOP, LEFT, BOTTOM } from '../enums/axis-orientation';

export const getNumberOfTicks = (availableSpace, labelDim, axis, interpolator) => {
    const ticks = axis.scale().ticks();
    const tickLength = ticks.length;
    let numberOfValues = tickLength;

    if (tickLength * (labelDim * 1.5) > availableSpace) {
        numberOfValues = Math.floor(availableSpace / (labelDim * 1.25));
    }

    if (numberOfValues < 1) {
        numberOfValues = 1;
    }
    if (interpolator === 'log' || interpolator === 'pow') {
        let x = 1;
        for (let i = 0; i <= numberOfValues; i++) {
            if (axis.scale().ticks(i).length <= numberOfValues) {
                x = i;
            }
        }
        return axis.scale().ticks(x);
    }

    return axis.scale().ticks(numberOfValues);
};

/**
 *
 *
 * @returns
 * @memberof SimpleAxis
 */
export const getTickLabelInfo = (context) => {
    let largestLabel = '',
        labelProps,
        smartTick = {},
        axisTickLabels;
    const scale = context.scale();
    const allLabelLengths = [];
    const { tickFormat, tickValues, numberFormat } = context.config();
    const labelFunc = scale.ticks || scale.quantile || scale.domain;
    // set the style on the shared label manager instance
    const { labelManager } = context.dependencies();

    labelManager.setStyle(context._tickLabelStyle);
    // get the values along the domain

    axisTickLabels = tickValues || labelFunc();
    // Get the tick labels
    axisTickLabels = axisTickLabels.map((originalLabel, i) => {
        const formattedLabel = numberFormat(originalLabel);

        //  get formats of tick if any
        const label = tickFormat ? tickFormat(formattedLabel) : (scale.tickFormat ?
            numberFormat(scale.tickFormat()(originalLabel)) : formattedLabel);

        // convert to string for quant values
        const temp = label.toString();
        // Get spaces for all labels
        allLabelLengths.push(labelManager.getOriSize(temp));
        // Getting largest label
        if (temp.length > largestLabel.length) {
            largestLabel = temp;
            smartTick = context.smartTicks() ? context.smartTicks()[i] : {};
            labelProps = allLabelLengths[i];
        }
        return label;
    });

    labelProps = labelManager.getOriSize(largestLabel);

    return { largestLabel, largestLabelDim: labelProps, axisTickLabels, allLabelLengths, smartTick };
};

/**
 *
 *
 * @returns
 * @memberof SimpleAxis
 */
export const computeAxisDimensions = (context) => {
    let tickLabelDim = {};
    const {
        name,
        labels,
        tickValues
    } = context.config();
    const angle = ((labels.smartTicks) ? 0 : labels.rotation) * Math.PI / 180;
    const { labelManager } = context.dependencies();
    const {
        largestLabelDim,
        axisTickLabels,
        smartTick
    } = getTickLabelInfo(context);
    const { height: labelHeight, width: labelWidth } = largestLabelDim;
    // get the domain of axis
    const domain = context.domain();

    if (domain.length === 0) {
        return null;
    }
    if (context._rotationLock === false) {
        context.setRotationConfig(tickValues || axisTickLabels, largestLabelDim.width);
        context._rotationLock = false;
    }
    if (labels.smartTicks) {
        tickLabelDim = smartTick;
    } else {
        tickLabelDim = {
            width: Math.abs(labelHeight * Math.sin(angle)) + Math.abs(labelWidth * Math.cos(angle)),
            height: Math.abs(labelWidth * Math.sin(angle)) + Math.abs(labelHeight * Math.cos(angle))
        };
    }

    labelManager.setStyle(context._axisNameStyle);
    return {
        tickSize: context.getTickSize(),
        tickLabelDim,
        axisLabelDim: labelManager.getOriSize(name),
        largestLabelDim,
        axisTickLabels,
    };
};

/**
*
*
* @memberof SimpleAxis
*/
export const setOffset = (context) => {
    let x = 0,
        y = 0;
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

/**
 *
 *
 * @param {*} timeDiff
 * @param {*} range
 * @param {*} domain
 * @returns
 */
const getAxisOffset = (timeDiff, range, domain) => {
    const pvr = Math.abs(range[1] - range[0]) / (domain[1] - domain[0]);
    const width = (pvr * timeDiff);
    const avWidth = (range[1] - range[0]);
    const bars = avWidth / width;
    const barWidth = avWidth / (bars + 1);
    const diff = avWidth - barWidth * bars;

    return diff / 2;
};

export const adjustRange = (minDiff, range, domain, orientation) => {
    const diff = getAxisOffset(minDiff, range, domain);

    if (orientation === TOP || orientation === BOTTOM) {
        range[0] += diff;
        range[1] -= diff;
    } else {
        range[0] -= diff;
        range[1] += diff;
    }
    return range;
};

 /**
 * Listener attached to the axis on change of parameters.
 *
 * @param {Function} callback to be excuted on change of domain range etc
 * @memberof SimpleAxis
 */
export const registerChangeListeners = (context) => {
    const store = context.store();

    store.model.next(['domain', 'range', 'mount', 'config'], (...params) => {
        context.render();
        context._domainLock = false;
        context._eventList.forEach((e) => {
            e.action instanceof Function && e.action(...params);
        });
    }, true);
    return context;
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
    let width,
        height;
    const {
        tickSize,
        tickLabelDim,
        axisLabelDim,
    } = axisDimensions;
    const {
        axisNamePadding,
        showAxisName,
        tickValues
   } = config;
    const { height: axisDimHeight } = axisLabelDim;
    const { height: tickDimHeight, width: tickDimWidth } = tickLabelDim;

    width = range && range.length ? range[1] - range[0] : 0;

    height = 0;
    if (tickValues) {
        width = tickValues.reduce((total) => {
            total += tickDimWidth + context._minTickDistance.width;
            return total;
        }, 0);
    }
    if (!width || width === 0) {
        height = Math.max(tickDimWidth, tickDimHeight);
    } else {
        height = tickDimHeight;
    }
    height += (showAxisName ? (axisDimHeight + axisNamePadding) : 0) + tickSize;
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
    let height,
        width;
    const {
        tickSize,
        tickLabelDim,
        axisLabelDim,
    } = axisDimensions;
    const {
        axisNamePadding,
        showAxisName,
        tickValues
   } = config;
    const { height: axisDimHeight } = axisLabelDim;
    const { height: tickDimHeight, width: tickDimWidth } = tickLabelDim;

    height = 0;
    width = tickDimWidth;
    if (tickValues) {
        height = tickValues.reduce((total) => {
            total += tickDimHeight * 1.1;
            return total;
        }, 0);
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
    const {
        orientation,
        show,
    } = config;
    const axisDimensions = context.getAxisDimensions();
    const {
        largestLabelDim,
        axisTickLabels,
    } = axisDimensions;
    const { height: largestDimHeight, width: largestDimWidth } = largestLabelDim;

    if (orientation === TOP || orientation === BOTTOM) {
        let { width, height } = getHorizontalAxisSpace(context, axisDimensions, config, range);
        if (!width || width === 0) {
            width = axisTickLabels.length * (Math.min(largestDimWidth + context._minTickDistance.width,
                         largestDimHeight + context._minTickDistance.width));
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
        height = axisTickLabels.length * (largestDimHeight + largestDimHeight / 2) + largestDimHeight;
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

    const {
        orientation,
        show,
    } = config;
    const {
        axisLabelDim
    } = axisDimensions;

    if (show === false) {
        return {
            width: 0,
            height: 0
        };
    }

    const { width: axisDimWidth } = axisLabelDim;

    if (orientation === TOP || orientation === BOTTOM) {
        const { width, height } = getHorizontalAxisSpace(context, axisDimensions, config, range);
        const axisWidth = Math.max(width, axisDimWidth);

        return {
            width: axisWidth,
            height
        };
    }

    const { width, height } = getVerticalAxisSpace(context, axisDimensions, config, range);
    const effHeight = Math.max(height, axisDimWidth);

    return {
        width,
        height: effHeight
    };
};
