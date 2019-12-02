import { getEvent } from 'muze-utils';
import { generatePayloadFromEvent } from './helpers';
import * as ACTION_NAMES from '../../enums/actions';

/**
 * Adds mouse interactions to target element.
 * @param {VisualUnit} instance instance of visual unit.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const click = firebolt => (targetEl) => {
    const dispatchBehaviour = function (args) {
        const event = getEvent();
        const payload = generatePayloadFromEvent(args, event, firebolt);
        firebolt.triggerPhysicalAction(ACTION_NAMES.CLICK, payload);
        event.stopPropagation();
    };

    targetEl.on('click', dispatchBehaviour);
};
export default click;
