import { getEvent } from 'muze-utils';
import { generatePayloadFromEvent } from './helpers';

/**
 * Adds mouse interactions to target element.
 * @param {VisualUnit} instance instance of visual unit.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const click = firebolt => (targetEl, behaviours) => {
    const dispatchBehaviour = function (args) {
        const event = getEvent();
        const payload = generatePayloadFromEvent(args, event, firebolt);
        behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, payload));
        event.stopPropagation();
    };

    targetEl.on('click', dispatchBehaviour);
};
export default click;
