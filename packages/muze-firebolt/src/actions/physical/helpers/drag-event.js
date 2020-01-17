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
export const attachDragEvent = (targetEl, action, firebolt, touch) => {
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
        const newStartPos = Object.assign({}, startPos);
        const newEndPos = Object.assign({}, endPos);
        if (startPos.x > endPos.x) {
            newStartPos.x = endPos.x;
            newEndPos.x = startPos.x;
        }

        if (startPos.y > endPos.y) {
            const y = startPos.y;
            newStartPos.y = endPos.y;
            newEndPos.y = y;
        }
        const payload = getDragActionConfig(firebolt, {
            startPos: newStartPos,
            endPos: newEndPos
        });
        payload.dragging = true;
        payload.dragDiff = Math.abs(startPos.x - endPos.x) + Math.abs(startPos.y - endPos.y);
        firebolt.triggerPhysicalAction(action, payload);
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
        if (startPos.x > endPos.x) {
            const x = startPos.x;
            startPos.x = endPos.x;
            endPos.x = x;
        }

        if (startPos.y > endPos.y) {
            const y = startPos.y;
            startPos.y = endPos.y;
            endPos.y = y;
        }

        const payload = getDragActionConfig(firebolt, {
            startPos,
            endPos
        });
        payload.dragEnd = true;
        payload.hideSelBox = true;
        firebolt.triggerPhysicalAction(action, payload);
    }));
};

