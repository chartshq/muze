/**
 * Adds mouse interactions to target element.
 * @param {VisualUnit} instance instance of visual unit.
 * @param {SVGElement} targetEl Element on which the event listeners will be attached.
 * @param {Array} behaviours Array of behaviours
 */
const click = firebolt => (targetEl, behaviours) => {
    const dispatchBehaviour = function (args) {
        const payload = {
            criteria: firebolt.context.getCriteriaFromData(args)
        };
        behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, payload));
    };

    targetEl.on('click', dispatchBehaviour);
};

export default click;
