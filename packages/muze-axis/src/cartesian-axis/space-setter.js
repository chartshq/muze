import { BOTTOM, TOP } from '../enums/axis-orientation';

const setAxisRange = (context, type, rangeBounds, offset) => {
    context.range(rangeBounds);
    offset && context.config({ [`${type}Offset`]: offset });
};

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

export const spaceSetter = (context, spaceConfig) => {
    let tickInterval;
    let heightForTicks;
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
        orientation,
        fixedBaseline,
        axisNamePadding,
        tickValues
    } = context.config();
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

    return {
        time: {
            x: () => {
                const tickShifter = tickDimWidth / 2;

                setAxisRange(context, 'y', adjustRange(minDiff,
                    [tickShifter, availWidth - left - right - tickShifter], domain, orientation),
                        isOffset ? availHeight : null);

                tickInterval = ((availWidth) / context.getTickValues().length)
                                     - minTickDistance.width;

                heightForTicks = availHeight - axisNameDimensions.availHeight - tickSize - namePadding;

                if (tickInterval < minTickSpace.width && rotation !== 0) {
                    // set smart ticks and rotation config
                    labelConfig.rotation = labels.rotation === null ? -90 : rotation;

                    // Remove ticks if not enough height
                    if (tickInterval < minTickSpace.height) {
                        heightForTicks = availHeight;
                        tickInterval = minTickSpace.height;
                        context.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                    }
                }
                if (availHeight < axisNameHeight) {
                    context.renderConfig({ show: false });
                }

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

                setAxisRange(context, 'x', adjustRange(minDiff,
                    [availHeight - top - bottom - tickShifter, tickShifter], domain, orientation),
                        isOffset ? availWidth : null);

                if ((availWidth - axisNameHeight - namePadding) <= minTickDistance.width) {
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
                tickInterval = ((range[1] - range[0]) / (tickValues || domain).length) - minTickDistance.width;

                // Get height available for ticks
                heightForTicks = availHeight - axisNameHeight - tickSize - namePadding;

                if (tickInterval < minTickSpace.width && rotation !== 0) {
                    // set smart ticks and rotation config
                    labelConfig.rotation = rotation === null ? -90 : rotation;
                    labelConfig.smartTicks = false;

                    // Ticks with overlapping height
                    if (tickInterval < minTickSpace.height) {
                        heightForTicks = 0;
                        tickInterval = 0;
                        context.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                        context.range([minTickSpace.height / 2, availWidth - minTickSpace.height / 2]);
                    }
                } else if (tickValues) {
                    const interval = (availWidth / domain.length) - minTickDistance.width;
                    if (interval < minTickSpace.width) {
                        context.range([minTickSpace.height / 2, availWidth - minTickSpace.height / 2]);
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

                let widthForTicks = availWidth;
                if (availWidth - axisNameHeight - namePadding <= minTickDistance.width) {
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
                const tickShifter = tickDimensions.width / 2;
                const baseline = fixedBaseline ? 0 : tickShifter;

                setAxisRange(context, 'y', [baseline + left, availWidth - right - tickShifter],
                    isOffset ? availHeight : null);

                const range = context.range();

                // Get Tick widths and available space
                const totalTickWidth = allTickDimensions.length * (tickDimensions.width + minTickDistance.width);
                const availableSpace = range[1] - range[0];

                 // Rotate labels if not enough width
                if (availableSpace < totalTickWidth && labels.rotation === null) {
                    labelConfig.rotation = -90;
                }

                // Remove ticks if not enough height
                if (availHeight - axisNameHeight - namePadding < tickDimensions.height) {
                    context.renderConfig({ showInnerTicks: false });
                    if (availHeight < axisNameHeight) {
                        context.renderConfig({ show: false });
                    }
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
                if (availWidth < tickDimensions.width + axisNameHeight + namePadding) {
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
