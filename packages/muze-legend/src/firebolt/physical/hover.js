import { getEvent } from 'muze-utils';

/**
 * Adds mouse interactions to target element.
 * @param {Firebolt} Firebolt instance of firebolt.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const hover = firebolt => (targetEl) => {
    const dispatchBehaviour = function (args) {
        const event = getEvent();
        const payload = {
            criteria: firebolt.context.getCriteriaFromData(args)
        };
        firebolt.triggerPhysicalAction('hover', payload);
        event.stopPropagation();
    };

    targetEl.on('mouseover', dispatchBehaviour)
                    .on('mousemove', dispatchBehaviour)
                    .on('mouseout', () => {
                        const event = getEvent();
                        firebolt.triggerPhysicalAction('hover', {
                            criteria: null
                        });
                        event.stopPropagation();
                    });
};

export default hover;
