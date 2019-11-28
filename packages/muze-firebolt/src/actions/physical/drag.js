import { attachDragEvent } from './helpers/drag-event';
import * as ACTION_NAMES from '../../enums/actions';

/**
 * Adds dragging action to the target element.
 * @param {VisualUnit} instance Instance of visual unit.
 * @param {SVGElement} targetEl Element on which brushing action is needed.
 * @param {Array} behaviours Array of behaviours
 */
/* istanbul ignore next */ const drag = firebolt => (targetEl) => {
    attachDragEvent(targetEl, ACTION_NAMES.DRAG, firebolt);
};

export default drag;
