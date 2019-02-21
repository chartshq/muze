import { BOTTOM, TOP, LEFT, RIGHT } from '../enums/axis-orientation';

const adjustHorizontalRange = (range, diff) => {
    range[0] += diff;
    range[1] -= diff;
    return range;
};
const adjustVerticalRange = (range, diff) => {
    range[0] -= diff;
    range[1] += diff;
    return range;
};

const rangeAdjustmentMap = {
    [TOP]: adjustHorizontalRange,
    [BOTTOM]: adjustHorizontalRange,
    [LEFT]: adjustVerticalRange,
    [RIGHT]: adjustVerticalRange
};

export const setAxisRange = (context, type, rangeBounds, offset) => {
    context.range(rangeBounds);
    offset && context.config({ [`${type}Offset`]: offset });
};

const getAxisOffset = (timeDiff, range, domain) => {
    const avWidth = Math.abs(range[1] - range[0]);
    const pvr = avWidth / (domain[1] - domain[0]);
    const width = (pvr * timeDiff);
    const bars = avWidth / width;
    const barWidth = avWidth / (bars + 1);
    const diff = avWidth - barWidth * bars;

    return diff / 2;
};

export const getAdjustedRange = (minDiff, range, domain, config) => {
    const {
        orientation,
        adjustRange
    } = config;
    const diff = getAxisOffset(minDiff, range, domain);
    if (adjustRange) {
        return rangeAdjustmentMap[orientation](range, diff);
    }
    return range;
};

export const spaceSetter = (context, spaceConfig) => {
    let tickInterval;
    let heightForTicks;
    const config = context.config();
    const {
        width: availWidth,
        height: availHeight,
        padding
    } = context.availableSpace();
    const {
        top,
        left,
        bottom,
        right
    } = padding;
    const {
        isOffset
    } = spaceConfig;
    const {
        showAxisName,
        labels
    } = context.renderConfig();
    const {
        rotation
    } = labels;
    const {
        fixedBaseline,
        axisNamePadding,
        tickValues
    } = config;
    const {
        tickDimensions,
        allTickDimensions,
        axisNameDimensions,
        tickSize
    } = context.getAxisDimensions();
    const {
        height: tickDimHeight,
        width: tickDimWidth
    } = tickDimensions;

    const namePadding = showAxisName ? axisNamePadding : 0;
    const labelConfig = { smartTicks: true, rotation: labels.rotation };
    const minTickDistance = context._minTickDistance;
    const minTickSpace = context._minTickSpace;
    const minDiff = context._minDiff;
    const domain = context.domain();
    const axisNameHeight = axisNameDimensions.height;
    const minWidthBetweenTicks = minTickDistance.width;
    const minTickWidth = minTickSpace.width;
    const minTickHeight = minTickSpace.height;

    return {
        time: {
            x: () => {
                const noOfTicks = context.getTickValues().length;

                // Get the Tick Interval
                tickInterval = ((availWidth - (noOfTicks - 1) * (minWidthBetweenTicks)) / noOfTicks);

                // Get height for ticks
                heightForTicks = availHeight - axisNameHeight - tickSize - namePadding;

                if (tickInterval < minTickWidth && rotation !== 0) {
                    // set smart ticks and rotation config
                    labelConfig.rotation = labels.rotation === null ? -90 : rotation;

                    // Remove ticks if not enough height
                    if (tickInterval < minTickHeight) {
                        heightForTicks = availHeight;
                        tickInterval = minTickHeight;
                        context.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                    }
                }
                if (availHeight < axisNameHeight) {
                    context.renderConfig({ show: false });
                }

                // set range for axis
                setAxisRange(context, 'y', getAdjustedRange(minDiff, [tickInterval / 2,
                    availWidth - left - right - tickInterval / 2], domain, config),
                        isOffset ? availHeight : null);

                context.maxTickSpaces({
                    width: tickInterval,
                    height: heightForTicks,
                    noWrap: rotation !== null
                });
                return labelConfig;
            },
            y: () => {
                let widthForTicks = availWidth;
                const tickShifter = tickDimHeight / 2;

                setAxisRange(context, 'x', getAdjustedRange(minDiff,
                    [availHeight - top - bottom - tickShifter, tickShifter], domain, config),
                        isOffset ? availWidth : null);

                if ((availWidth - axisNameHeight - namePadding) <= minWidthBetweenTicks) {
                    widthForTicks = 0;
                    context.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                }

                context.maxTickSpaces({
                    width: widthForTicks,
                    height: availHeight,
                    noWrap: true
                });
                if (availWidth < axisNameHeight) {
                    context.renderConfig({ show: false });
                }
                return labelConfig;
            }
        },
        band: {
            x: () => {
                setAxisRange(context, 'y', [0, availWidth - left - right], isOffset ? availHeight : null);
                const range = context.range();

                // Get Tick Interval
                tickInterval = ((range[1] - range[0]) / (tickValues || domain).length) - minWidthBetweenTicks;

                // Get height available for ticks
                heightForTicks = availHeight - axisNameHeight - tickSize - namePadding;

                if (tickInterval < minTickWidth && rotation !== 0) {
                    // set smart ticks and rotation config
                    labelConfig.rotation = rotation === null ? -90 : rotation;
                    labelConfig.smartTicks = false;

                    // Ticks with overlapping height
                    if (tickInterval < minTickHeight) {
                        heightForTicks = 0;
                        tickInterval = 0;
                        context.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                        context.range([minTickHeight / 2, availWidth - minTickHeight / 2]);
                    }
                } else if (tickValues) {
                    const interval = (availWidth / domain.length) - minWidthBetweenTicks;
                    if (interval < minTickWidth) {
                        context.range([minTickHeight / 2, availWidth - minTickHeight / 2]);
                    }
                }
                if (availHeight < axisNameHeight) {
                    context.renderConfig({ show: false, showInnerTicks: false, showOuterTicks: false });
                }

                context.maxTickSpaces({
                    width: tickInterval,
                    height: heightForTicks,
                    noWrap: rotation !== null
                });
                return labelConfig;
            },
            y: () => {
                setAxisRange(context, 'x', [availHeight - bottom, top], isOffset ? availWidth : null);

                let widthForTicks = availWidth - axisNameHeight - tickSize - namePadding;
                if (widthForTicks <= minWidthBetweenTicks) {
                    widthForTicks = 0;
                    context.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                }

                context.maxTickSpaces({
                    width: widthForTicks,
                    height: availHeight,
                    noWrap: true
                });
                if (availWidth < axisNameHeight) {
                    context.renderConfig({ show: false });
                }
                return labelConfig;
            }
        },
        continous: {
            x: () => {
                labelConfig.smartTicks = false;
                const tickShifter = tickDimWidth / 2;

                const baseline = fixedBaseline ? 0 : tickShifter;

                setAxisRange(context, 'y', [baseline + left, availWidth - right - tickShifter],
                    isOffset ? availHeight : null);

                const range = context.range();

                // Get Tick widths and available space
                const totalTickWidth = allTickDimensions.length * (tickDimWidth + minWidthBetweenTicks);
                const availableWidth = range[1] - range[0];

                 // Rotate labels if not enough width
                if (availableWidth < totalTickWidth && labels.rotation !== null) {
                    if (availHeight - tickDimWidth - namePadding - tickSize > axisNameHeight) {
                        labelConfig.rotation = null;
                        context.renderConfig({
                            showInnerTicks: true,
                            showAxisName: true
                        });
                    } else {
                        labelConfig.rotation = -90;
                        context.renderConfig({
                            showInnerTicks: true,
                            showAxisName: availHeight - tickDimWidth - namePadding - tickSize > axisNameHeight

                        });
                    }
                }

                if (availHeight < axisNameHeight) {
                    context.renderConfig({ show: false });
                }
                return labelConfig;
            },
            y: () => {
                labelConfig.smartTicks = false;
                const tickShifter = tickDimensions.height / 2;
                const baseline = fixedBaseline ? 1 : tickShifter;

                setAxisRange(context, 'x', [availHeight - bottom - baseline, tickShifter + top],
                    isOffset ? availWidth : null);

                // Remove display of ticks if no space is left
                if (availWidth < tickDimWidth + axisNameHeight + namePadding) {
                    context.renderConfig({ showInnerTicks: false });
                    if (availWidth < axisNameHeight) {
                        context.renderConfig({ show: false });
                    }
                }
                return labelConfig;
            }
        }
    };
};
