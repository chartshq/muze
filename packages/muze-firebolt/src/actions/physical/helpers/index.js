import { getClientPoint } from 'muze-utils';

export const generatePayloadFromEvent = function (args, event, firebolt) {
    const context = firebolt.context;
    const pos = getClientPoint(context.getDrawingContext().svgContainer, event.touches ? event.touches[0] : event);
    const nearestPoint = context.getNearestPoint(pos.x, pos.y, {
        data: args,
        event
    });
    return {
        criteria: nearestPoint ? nearestPoint.id : null,
        showInPosition: nearestPoint.showInPosition,
        target: nearestPoint.target,
        position: pos
    };
};
