import { getQualifiedClassName } from 'muze-utils';
import { TOOLTIP_LEFT, TOOLTIP_RIGHT, ARROW_RIGHT, ARROW_LEFT } from './constants';

export const getArrowPos = (orient, dim, measurement, config) => {
    let arrowPos;
    const { x, y, boxHeight, boxWidth } = measurement;
    const arrowDisabled = config.arrow.disabled;
    const arrowWidth = arrowDisabled ? 0 : config.arrow.size;

    if (orient === ARROW_LEFT || orient === ARROW_RIGHT) {
        let start = 0;
        let diff = boxHeight / 2;
        const plotBottom = dim.y + dim.height;
        const boxBottom = y + boxHeight;

        if (dim.y > y) {
            start = dim.y - y;
            diff = (plotBottom >= boxBottom ? (boxBottom - dim.y) : dim.height) / 2;
        } else if (boxBottom > plotBottom) {
            diff = Math.abs(y - (dim.y + dim.height)) / 2;
        }
        arrowPos = start + diff - arrowWidth / 2;
    } else {
        let start = 0;
        let diff = boxWidth / 2;
        const plotRight = dim.x + dim.width;
        const boxRight = x + boxWidth;

        if (dim.x > x) {
            start = dim.x - x;
            diff = (plotRight >= boxRight ? (boxRight - dim.x) : dim.width) / 2;
        } else if (boxRight > plotRight) {
            diff = Math.abs(x - (dim.x + dim.width)) / 2;
        }
        arrowPos = start + diff - arrowWidth / 2;
    }
    return arrowPos;
};

/**
 * Places the arrow in the specified arrow position. It also applies appropriate arrow
 * class name to the arrow element.
 * @param {string} position Left, bottom or right position of the arrow;
 * @param {number} arrowPos position of arrow in pixels
 * @return {Tooltip} Instance of tooltip.
 */
export const placeArrow = (context, position, arrowPos) => {
    const tooltipArrow = context._tooltipArrow;
    const tooltipBackground = context._tooltipBackground;
    const config = context._config;
    const classPrefix = config.classPrefix;
    const arrowConf = config.arrow;
    const className = getQualifiedClassName(arrowConf.defClassName, context._id, config.classPrefix);

    tooltipArrow.style('display', 'block');
    tooltipArrow.attr('class', `${className.join(' ')}`);
    if (position === TOOLTIP_LEFT || position === TOOLTIP_RIGHT) {
        tooltipArrow.style('top', `${arrowPos}px`);
        tooltipArrow.style('left', '');
        tooltipBackground.style('top', `${arrowPos}px`);
        tooltipBackground.style('left', '');
    } else {
        tooltipArrow.style('top', '');
        tooltipArrow.style('left', `${arrowPos}px`);
        tooltipBackground.style('top', '');
        tooltipBackground.style('left', `${arrowPos}px`);
    }
    tooltipArrow.classed(`${classPrefix}-tooltip-arrow`, true);
    tooltipArrow.classed(`${classPrefix}-tooltip-arrow-${context._arrowOrientation}`, false);
    tooltipArrow.classed(`${classPrefix}-tooltip-arrow-${position}`, true);
    tooltipBackground.classed(`${classPrefix}-tooltip-background-arrow`, true);
    tooltipBackground.classed(`${classPrefix}-tooltip-background-arrow-${context._arrowOrientation}`, false);
    tooltipBackground.classed(`${classPrefix}-tooltip-background-arrow-${position}`, true);
    return this;
};

export const reorderContainers = (parentContainer, className) => {
    parentContainer.selectAll(className).sort((a, b) => a - b);
};
