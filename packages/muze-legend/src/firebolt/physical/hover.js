import { getEvent } from 'muze-utils';

/**
 * Adds mouse interactions to target element.
 * @param {Firebolt} Firebolt instance of firebolt.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const hover = firebolt => (targetEl, behaviours) => {
    const dispatchBehaviour = function (args) {
        const event = getEvent();
        const payload = {
            criteria: firebolt.context.getCriteriaFromData(args)
        };
        behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, payload));
        event.stopPropagation();
    };

    targetEl.on('mouseover', dispatchBehaviour)
                    .on('mousemove', dispatchBehaviour)
                    .on('mouseout', () => {
                        const event = getEvent();
                        behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, {
                            criteria: null
                        }));
                        event.stopPropagation();
                    });
};

export default hover;
