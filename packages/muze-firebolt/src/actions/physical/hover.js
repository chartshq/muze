import { getClientPoint, getEvent } from 'muze-utils';
import * as ACTION_NAMES from '../../enums/actions';

/**
 * Adds mouse interactions to target element.
 * @param {Firebolt} instance instance of firebolt.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const hover = firebolt => (targetEl) => {
    const dispatchBehaviour = function (args) {
        const event = getEvent();
        const context = firebolt.context;
        const tooltipConf = context.config().interaction.tooltip;
        const mode = tooltipConf.mode;
        const pos = getClientPoint(context.getDrawingContext().svgContainer, event);
        const nearestPoint = context.getNearestPoint(pos.x, pos.y, {
            getAllPoints: true,
            data: args,
            event
        });
        const payload = {
            criteria: nearestPoint ? nearestPoint.id : null,
            getAllPoints: false,
            showInPosition: nearestPoint.showInPosition,
            target: nearestPoint.target,
            position: pos,
            mode
        };
        // console.log('payload', payload.criteria);
        firebolt.triggerPhysicalAction(ACTION_NAMES.HOVER, payload);
        event.stopPropagation();
    };

    targetEl.on('mouseover', dispatchBehaviour)
                    .on('mousemove', dispatchBehaviour)
                    .on('mouseout', () => {
                        firebolt.triggerPhysicalAction(ACTION_NAMES.HOVER, {
                            criteria: null
                        });
                    });
};

export default hover;
