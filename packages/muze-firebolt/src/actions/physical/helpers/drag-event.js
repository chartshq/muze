import {
    getEvent,
    getD3Drag
 } from 'muze-utils';

import getDragActionConfig from './drag-action-config';

/**
 * Adds dragging action to the target element.
 * @param {VisualUnit} instance Instance of visual unit.
 * @param {SVGElement} targetEl Element on which brushing action is needed.
 * @param {Array} behaviours Array of behaviours
 */
export const attachDragEvent = (targetEl, behaviours, firebolt, touch) => {
    let startPos = {};
    let endPos = {};
    let drawingInf;

    const d3Drag = getD3Drag();
    let touchStart;
    targetEl.call(d3Drag().on('start', () => {
        const event = getEvent();
        startPos = {
            x: event.x,
            y: event.y
        };
        drawingInf = firebolt.context.getDrawingContext();
        touchStart = new Date().getTime();
    }).on('drag', () => {
        const event = getEvent();
        endPos = {
            x: event.x,
            y: event.y
        };
        if (touch && Math.abs(startPos.x - endPos.x) <= 5) {
            return;
        }
        endPos.x = Math.max(0, Math.min(endPos.x, drawingInf.width));
        endPos.y = Math.max(0, Math.min(endPos.y, drawingInf.height));

        const payload = getDragActionConfig(firebolt.context.getSourceInfo(), {
            startPos,
            endPos
        }, firebolt.context.data().getFieldsConfig());
        behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, payload));
    }).on('end', () => {
        const event = getEvent();
        endPos = {
            x: event.x,
            y: event.y
        };
        const duration = new Date().getTime() - touchStart;

        if (touch && duration > 100 && Math.abs(startPos.x - endPos.x) <= 5) {
            return;
        }
        endPos.x = Math.max(0, Math.min(endPos.x, drawingInf.width));
        endPos.y = Math.max(0, Math.min(endPos.y, drawingInf.height));

        const payload = getDragActionConfig(firebolt.context.getSourceInfo(), {
            startPos,
            endPos,
            snap: true
        }, firebolt.context.data().getFieldsConfig());
        payload.dragEnd = true;
        behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, payload));
    }));
};

