import {
    getEvent,
    getD3Drag
 } from 'muze-utils';

import getDragActionConfig from './helpers/drag-action-config';

export const selectionBoxDrag = firebolt => (targetEl, behaviours, sideEffect) => {
    let subject;
    const onDrag = (payload) => {
        payload.sourceUnit = targetEl.data()[0].sourceUnit;
        behaviours.forEach(action => firebolt.dispatchBehaviour(action, payload));
    };
    const drawingInf = sideEffect.drawingContext()();
    const direction = sideEffect._direction;
    const xOffset = drawingInf.xOffset;
    const yOffset = drawingInf.yOffset;
    const d3Drag = getD3Drag();

    targetEl.call(d3Drag().on('start', () => {
        const event = getEvent();
        subject = event.subject;
        if (direction === 'horizontal') {
            subject.y -= yOffset;
        } else if (direction === 'vertical') {
            subject.x -= xOffset;
        } else {
            subject.y -= yOffset;
            subject.x -= xOffset;
        }
    }).on('drag', () => {
        let x;
        let y;
        let width = drawingInf.width;
        let height = drawingInf.height;

        const event = getEvent();
        subject.x += event.dx;
        subject.y += event.dy;
        x = Math.min(width - subject.width, Math.max(subject.x, 0));
        y = Math.min(height - subject.height, Math.max(subject.y, 0));

        if (direction === 'horizontal') {
            y = Math.min(drawingInf.boundHeight - subject.height, Math.max(subject.y, 0));
            height = drawingInf.height;
        } else if (direction === 'vertical') {
            x = Math.min(drawingInf.boundWidth - subject.width, Math.max(subject.x, 0));
            width = drawingInf.width;
        } else {
            y = Math.min(drawingInf.boundHeight - subject.height, Math.max(subject.y, 0));
            height = drawingInf.boundHeight;
            x = Math.min(drawingInf.boundWidth - subject.width, Math.max(subject.x, 0));
            width = drawingInf.boundWidth;
        }

        const y2 = y + subject.height;
        const x2 = x + subject.width;

        if (x >= 0 && x2 <= width && y >= 0 && y2 <= height) {
            const payload = getDragActionConfig(sideEffect.sourceInf()(), {
                startPos: {
                    x,
                    y
                },
                endPos: {
                    x: x2,
                    y: y2
                }
            }, firebolt.context.data().getFieldsConfig());
            onDrag(payload);
        }
    }).on('end', () => {
        const width = drawingInf.width;
        const height = drawingInf.height;
        const x = Math.min(width - subject.width, Math.max(subject.x, 0));
        const y = Math.min(height - subject.height, Math.max(subject.y, 0));
        const y2 = y + subject.height;
        const x2 = x + subject.width;

        if (x >= 0 && x2 <= width && y >= 0 && y2 <= height) {
            const payload = getDragActionConfig(sideEffect.sourceInf()(), {
                startPos: {
                    x,
                    y
                },
                endPos: {
                    x: x2,
                    y: y2
                },
                snap: true
            }, firebolt.context.data().getFieldsConfig());
            payload.dragEnd = true;
            onDrag(payload);
        }
    }));
};
