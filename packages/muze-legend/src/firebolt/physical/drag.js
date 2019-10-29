import {
    getEvent,
    getD3Drag
 } from 'muze-utils';

/**
 * Adds dragging action to the target element.
 * @param {firebolt} firebolt firebolt
 * @param {SVGElement} targetEl Element on which brushing action is needed.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const drag = firebolt => (targetEl, behaviours) => {
    let startPos = {};
    let endPos = {};
    let payload;
    const d3Drag = getD3Drag();
    const context = firebolt.context;
    const boundingBox = context.measurement().gradientDimensions;
    const axisType = context.config().align === 'horizontal' ? 'x' : 'y';
    const axisScale = context.axis().source().scale();
    const rangeShifter = axisScale.range()[axisType === 'x' ? 0 : 1];

    targetEl.call(d3Drag().on('start', () => {
        const event = getEvent();
        startPos = {
            x: event.x,
            y: event.y
        };
    }).on('drag', () => {
        const event = getEvent();

        endPos = {
            x: event.x,
            y: event.y
        };
        endPos.x = Math.max(0, Math.min(endPos.x, boundingBox.width));
        endPos.y = Math.max(0, Math.min(endPos.y, boundingBox.height));

        payload = {
            criteria: {
                [context.fieldName()]: [axisScale.invert(startPos[axisType] + rangeShifter * 2),
                    axisScale.invert(endPos[axisType] + rangeShifter * 2)].sort((a, b) => a - b)
            }
        };
        behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, payload));
    }).on('end', () => {
        const event = getEvent();

        endPos = {
            x: event.x,
            y: event.y
        };
        endPos.x = Math.max(0, Math.min(endPos.x, boundingBox.width));
        endPos.y = Math.max(0, Math.min(endPos.y, boundingBox.height));
        if (startPos[axisType] === endPos[axisType]) {
            payload = {
                criteria: null
            };
        } else {
            payload = {
                criteria: {
                    [context.fieldName()]: [axisScale.invert(startPos[axisType] + rangeShifter * 2),
                        axisScale.invert(endPos[axisType] + rangeShifter * 2)].sort((a, b) => a - b)
                }
            };
        }
        behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, payload));
    }));
};

export default drag;
