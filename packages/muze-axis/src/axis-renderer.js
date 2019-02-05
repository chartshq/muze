/**
 * This file exports functionality that is used to render axis.
 */
import { selectElement, makeElement, angleToRadian } from 'muze-utils';
import * as AxisOrientation from './enums/axis-orientation';
import { LINEAR, HIDDEN, BOTTOM, TOP } from './enums/constants';

/**
 *
 *
 * @param {*} instance
 * @param {*} container
 * @param {*} labelManager
 * @param {*} config
 */
const rotateAxis = (instance, tickText, labelManager) => {
    let rotation;
    const axis = instance.axis();
    const config = instance.config();
    const renderConfig = instance.renderConfig();
    const smartTicks = instance.smartTicks();
    const scale = axis.scale();
    const labelFunc = scale.ticks || scale.quantile || scale.domain;
    const ticks = labelFunc();
    const {
        orientation,
        fixedBaseline,
        type
    } = config;
    const {
        labels
    } = renderConfig;

    rotation = labels.rotation;

    const tickSize = instance.getTickSize();
    tickText.each(function (d, index) {
        let yShift;
        let xShift;
        let datum = smartTicks[index] ? smartTicks[index].text : d;

        const tickFormatter = axis.tickFormat() ? axis.tickFormat : null;

        const temp = tickSize ? (tickFormatter ? tickFormatter()(d) : datum) : '';

        datum = temp.toString();

        const tickLabelDim = labelManager.getOriSize(datum);

        const width = tickLabelDim.width * 0.5;
        const height = tickLabelDim.height * 0.5;

        if (rotation < 0) {
            rotation = 360 + rotation;
        }

        const quadrant = 4 - Math.floor(rotation / 90);
        const rotationNormalizer = ((quadrant % 2 === 0) ? rotation : 180 * Math.ceil(rotation / 180) - rotation) % 180;

        yShift = Math.sqrt(height ** 2 + width ** 2) * Math.sin(angleToRadian(rotationNormalizer));

        if ((quadrant === 3 || quadrant === 2) && !(rotationNormalizer > 67.5 && rotationNormalizer <= 90)) {
            yShift += height * 2;
        }
        xShift = width;

        if (rotation === 90) {
            xShift = height;
        } else if (rotation === 270) {
            xShift = -height;
        } else {
            xShift = 0;
        }

        if (orientation === AxisOrientation.TOP) {
            xShift = (fixedBaseline && ticks[0] === d && type === LINEAR) ? xShift + xShift / 2 : xShift;
            selectElement(this)
                            .attr('transform', `translate(${-xShift + tickSize}
                                ${-yShift - tickSize}) rotate(${rotation})`);
        } else {
            xShift = (fixedBaseline && ticks[0] === d && type === LINEAR) ? xShift - xShift / 2 : xShift;

            selectElement(this)
                            .attr('transform', `translate(${xShift - tickSize}
                                ${yShift + tickSize}) rotate(${rotation})`);
        }
        selectElement(this).transition()
                        .duration(1000).text(datum);
    });
    return tickText;
};

/**
 *
 *
 * @param {*} tickText
 * @param {*} axisInstance
 */
const changeTickOrientation = (selectContainer, axisInstance, tickSize) => {
    const {
        _smartTicks
    } = axisInstance;
    const config = axisInstance.config();
    const renderConfig = axisInstance.renderConfig();
    const labelManager = axisInstance.dependencies().labelManager;
    const {
        orientation,
        classPrefix
    } = config;
    const {
        labels
    } = renderConfig;
    const {
        rotation,
        smartTicks: isSmartTicks
    } = labels;

    const tickText = selectContainer.selectAll('.tick text');
    tickText.selectAll('tspan').remove();

   // rotate labels if not enough space is available
    if (rotation && (orientation === TOP || orientation === BOTTOM)) {
        rotateAxis(axisInstance, tickText, labelManager);
    } else if (!rotation && !isSmartTicks) {
        tickText.attr('transform', '');
    } else {
        tickText.text('');
        if (orientation === TOP || orientation === BOTTOM) {
            tickText.attr('y', 0)
                            .attr('x', 0)
                            .attr('transform', '')
                            .text('');
            const tspan = makeElement(tickText, 'tspan', (d, i) => {
                if (_smartTicks[i]) {
                    return _smartTicks[i].lines;
                } return [];
            }, `${classPrefix}-smart-text`);

            tspan.attr('dy', '0')
                            .style('opacity', '0')

                            .transition()
                            .duration(1000)
                            .on('end', axisInstance.registerAnimationDoneHook())
                            .attr('dy', (d, i) => {
                                if (orientation === BOTTOM || i !== 0) {
                                    return _smartTicks[0].oriTextHeight;
                                }
                                return -_smartTicks[0].oriTextHeight * (_smartTicks[0].lines.length - 1) - tickSize;
                            })
                            .style('opacity', 1)
                            .text(e => e)
                            .attr('x', 0);
        } else {
            const tspan = makeElement(tickText, 'tspan', (d, i) => _smartTicks[i].lines, `${classPrefix}-smart-text`);
            tspan.text(e => e);
        }
    }

    return tickText;
};

const setFixedBaseline = (axisInstance) => {
    const {
        fixedBaseline
    } = axisInstance.config();
    const domain = axisInstance.domain();
    if (fixedBaseline && domain.length) {
        axisInstance.setFixedBaseline();
    }
};

/**
 *
 *
 * @param {*} textNode
 * @param {*} orientation
 * @param {*} measures
 */
const setAxisNamePos = (textNode, orientation, measures) => {
    const {
        axisNameHeight,
        yOffset,
        labelOffset,
        availableSpace
    } = measures;
    switch (orientation) {
    case AxisOrientation.LEFT:
        textNode.attr('transform',
            `translate(${-(availableSpace.width - axisNameHeight)},${yOffset + labelOffset})rotate(-90)`);
        break;
    case AxisOrientation.RIGHT:
        textNode.attr('transform',
             `translate(${(availableSpace.width - axisNameHeight)},${yOffset + labelOffset})rotate(90)`);
        break;
    case AxisOrientation.TOP:
        textNode.attr('transform',
             `translate(${availableSpace.width / 2},${-availableSpace.height + axisNameHeight})`);
        break;
    case AxisOrientation.BOTTOM:
        textNode.attr('transform',
             `translate(${availableSpace.width / 2},${availableSpace.height - axisNameHeight / 2})`);
        break;
    default:
    }
    return textNode;
};

/**
 * This method is used to render the axis inside an
 * svg container.
 *
 * @export
 * @param {Object} axisInstance the nput object required to render axis
 * @param {string} axisInstance.orientation the orientation of axis
 * @param {Object} axisInstance.scale instance of d3 scale
 * @param {SVGElement} axisInstance.container the container in which to render
 */
export function renderAxis (axisInstance) {
    const config = axisInstance.config();
    const renderConfig = axisInstance.renderConfig();
    const labelManager = axisInstance.dependencies().labelManager;
    const mount = axisInstance.mount();
    const range = axisInstance.range();
    const axis = axisInstance.axis();
    const scale = axisInstance.scale();
    const {
        _axisNameStyle: axisNameStyle,
        _tickLabelStyle: tickLabelStyle,
        _tickFormatter: axisTickFormatter,
        tickValues
     } = axisInstance;
    const {
        orientation,
        name,
        xOffset,
        yOffset,
        axisNamePadding,
        className,
        id,
        classPrefix
     } = config;
    const {
        show,
        showAxisName,
        labels
    } = renderConfig;

    if (!show) {
        return;
    }

    const tickSize = axisInstance.getTickSize();

    const selectContainer = makeElement(selectElement(mount), 'g', [axisInstance], `${className}`, {},
        key => key.config().id);

    // Set style for tick labels
    labelManager.setStyle(tickLabelStyle);

    const labelFunc = scale.ticks || scale.quantile || scale.domain;

    axis.tickFormat(axisTickFormatter(tickValues || axis.tickValues() || labelFunc()));

    // Get range(length of range)
    const availableSpace = Math.abs(range[0] - range[1]);

    // Get width and height taken by axis labels
    const labelProps = axisInstance.axisComponentDimensions().largestTickDimensions;

    // Draw axis ticks
    selectContainer.attr('transform', `translate(${xOffset},${yOffset})`);
    setFixedBaseline(axisInstance);
    if (labels.smartTicks === false || tickSize === 0) {
        selectContainer.transition()
                        .duration(1000)
                        .on('end', axisInstance.registerAnimationDoneHook())
                        .call(axis);
    } else {
        selectContainer.call(axis);
    }
    selectContainer.selectAll('.tick').classed(`${classPrefix}-ticks`, true);
    selectContainer.selectAll('.tick line').classed(`${classPrefix}-tick-lines`, true);

    // Set classes for ticks
    const tickText = selectContainer.selectAll('.tick text');
    tickText.classed(`${classPrefix}-ticks`, true)
                    .classed(`${classPrefix}-ticks-${id}`, true);

    changeTickOrientation(selectContainer, axisInstance, tickSize);

    // Create axis name
    const textNode = makeElement(selectContainer, 'text', [name], `${classPrefix}-axis-name`)
                    .attr('text-anchor', 'middle')
                    .classed(`${classPrefix}-axis-name-${id}`, true)
                    .text(d => d);

    // Hide axis name if show is off
    textNode.classed(HIDDEN, !showAxisName);

     // render labels based on orientation of axis
    const labelOffset = availableSpace / 2;

    // Set style for axis name
    labelManager.setStyle(axisNameStyle);
    const axisNameSpace = labelManager.getOriSize(name);
    const measures = {
        labelProps,
        tickSize,
        axisNamePadding,
        axisNameHeight: axisNameSpace.height,
        axisNameWidth: axisNameSpace.width,
        yOffset,
        xOffset,
        labelOffset,
        availableSpace: axisInstance.availableSpace()
    };
    // Set position for axis name
    setAxisNamePos(textNode, orientation, measures);
}
