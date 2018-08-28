import {
    getMousePos,
    getEvent,
    getD3Drag
 } from 'muze-utils';
import { HEIGHT, WIDTH, HORIZONTAL } from '../../enums/constants';

const getSelectionCriteria = (subject, axis, measures) => {
    let criteria = [];
    const {
        axisScale,
        axisType
    } = axis;
    const {
        startPos,
        endPos,
        selectionBoxMeasure,
        drawingInfMeasure,
        offset
    } = measures;
    const subjectStartPoint = subject[axisType];

    if (startPos[axisType] === endPos[axisType]) {
        criteria = [];
    } else if (subjectStartPoint + selectionBoxMeasure >= drawingInfMeasure + offset) {
        criteria = [axisScale.invert(drawingInfMeasure + offset - selectionBoxMeasure),
            axisScale.invert(drawingInfMeasure + offset)];
    } else if (subjectStartPoint - offset < offset) {
        criteria = [axisScale.invert(offset * 2), axisScale.invert(selectionBoxMeasure + offset * 2)];
    } else {
        criteria = [axisScale.invert(subjectStartPoint), axisScale.invert(subjectStartPoint + selectionBoxMeasure)];
    }
    axisType === 'x' ? criteria : criteria.reverse();
    return criteria;
};

export const selectionBoxDrag = firebolt => (targetEl, behaviours) => {
    let startPos = {};
    let payload;
    const endPos = {};
    const d3Drag = getD3Drag();
    const context = firebolt.context;
    const axisScale = context.axis().source().scale();
    const axisType = context.config().align === HORIZONTAL ? 'x' : 'y';
    const drawingInfMeasure = context.measurement().gradientDimensions[axisType === 'x' ?
        WIDTH : HEIGHT];
    const offset = axisScale.range()[axisType === 'x' ? 0 : 1];
    const measures = {
        drawingInfMeasure,
        offset
    };
    let subject = {};

    targetEl.call(d3Drag().on('start', function () {
        const event = getEvent();
        startPos = getMousePos(this, event.sourceEvent);
        subject = event.subject;
    }).on('drag', () => {
        const event = getEvent();
        const selectionBoxMeasure = subject[axisType === 'x' ? WIDTH : HEIGHT];

        subject.x += event.dx;
        subject.y += event.dy;

        measures.selectionBoxMeasure = selectionBoxMeasure;
        measures.startPos = startPos;
        measures.endPos = endPos;
        const criteria = getSelectionCriteria(subject, { axisScale, axisType }, measures);

        payload = {
            criteria: {
                [context.fieldName()]: criteria
            },
            fadeOut: true
        };
        firebolt.dispatchBehaviour(behaviours[0], payload);
    }).on('end', () => {
        const event = getEvent();
        const selectionBoxMeasure = subject[axisType === 'x' ? WIDTH : HEIGHT];
        measures.selectionBoxMeasure = selectionBoxMeasure;
        measures.startPos = startPos;
        measures.endPos = endPos;
        const criteria = getSelectionCriteria(event, { axisScale, axisType }, measures);
        payload = {
            criteria: {
                [context.fieldName()]: criteria
            },
            fadeOut: true,
            config: {
                transition: {
                    duration: 200
                }
            }
        };
        firebolt.dispatchBehaviour(behaviours[0], payload);
    }));
};

