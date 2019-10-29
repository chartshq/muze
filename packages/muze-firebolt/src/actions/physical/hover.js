import { getClientPoint, getEvent } from 'muze-utils';
import { CONSOLIDATED, FRAGMENTED } from '../../enums/constants';

/**
 * Adds mouse interactions to target element.
 * @param {Firebolt} instance instance of firebolt.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const hover = firebolt => (targetEl, behaviours) => {
    const dispatchBehaviour = function (args) {
        const event = getEvent();
        const context = firebolt.context;
        const tooltipConf = context.config().interaction.tooltip;
        const mode = tooltipConf.mode;
        const pos = getClientPoint(context.getDrawingContext().svgContainer, event);
        const nearestPoint = context.getNearestPoint(pos.x, pos.y, {
            getAllPoints: mode === CONSOLIDATED || mode === FRAGMENTED,
            data: args,
            event
        });
        const payload = {
            criteria: nearestPoint ? nearestPoint.id : null,
            showInPosition: nearestPoint.showInPosition,
            target: nearestPoint.target,
            position: pos,
            mode
        };

        behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, payload));
        event.stopPropagation();
    };

    targetEl.on('mouseover', dispatchBehaviour)
                    .on('mousemove', dispatchBehaviour)
                    .on('mouseout', () => {
                        behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, {
                            criteria: null
                        }));
                    });
};

export default hover;
