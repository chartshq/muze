/* global setTimeout */
import { selectElement, getEvent } from 'muze-utils';
import { generatePayloadFromEvent } from './helpers';

/**
 * Adds mouse interactions to target element.
 * @param {VisualUnit} instance instance of visual unit.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
export const longtouch = firebolt => (targetEl, behaviours) => {
    let event;
    let touchEnd;
    const dispatchBehaviour = function (args) {
        const payload = generatePayloadFromEvent(args, event, firebolt);
        behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, payload));
        event.stopPropagation();
    };

    touchEnd = false;
    event = getEvent();
    selectElement(targetEl).on('touchstart', (args) => {
        event = getEvent();
        touchEnd = false;
        setTimeout(() => {
            if (!touchEnd) {
                dispatchBehaviour(args);
            } else {
                behaviours.forEach(beh => firebolt.dispatchBehaviour(beh, {
                    criteria: null
                }));
            }
        }, 100);
    }).on('touchend', () => {
        touchEnd = true;
    });
};
