import { attachDragEvent } from './helpers/drag-event';

/**
 * Adds dragging action to the target element.
 * @param {VisualUnit} instance Instance of visual unit.
 * @param {SVGElement} targetEl Element on which brushing action is needed.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const drag = firebolt => (targetEl) => {
    attachDragEvent(targetEl, 'drag', firebolt);
};

export default drag;
