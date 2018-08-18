import { makeElement } from 'muze-utils';
import { easeCubic } from 'd3-ease';

/**
 *
 *
 * @param {*} elem
 * @param {*} datum
 * @param {*} index
 * @param {*} context
 */
const transitionBars = (elem, datum, index, context) => {
    const { transition, classnameFn } = context;
    const { duration, disabled } = transition;
    const selection = elem;
    const selTransition = disabled ? selection : selection.transition().duration(duration).ease(easeCubic);
    const update = datum.update || datum;
    const updateStyle = datum.style || {};
    classnameFn && selection.classed(classnameFn(datum, index), true);
    Object.entries(update).forEach(attr => (!isNaN(attr[1]) && selTransition.attr(attr[0], attr[1])));
    Object.entries(updateStyle).forEach(styleObj => selection.style(styleObj[0], styleObj[1]));
};

/**
 *
 *
 * @param {*} elem
 * @param {*} d
 */
const barEnterFn = (elem, d) => {
    const selection = elem;
    const enter = d.enter || {};
    Object.entries(enter).forEach(attr => (!isNaN(attr[1]) && selection.attr(attr[0], attr[1])));
};

/**
 * Draws rectangles by using d3 selection
 * @param  {Object} params Contains container element and points
 * @return {Selection} Bar Selection
 */
/* istanbul ignore next */ export const drawRects = (params) => {
    const { points, container, keyFn } = params;
    const updateFns = {
        enter (elem, d) { barEnterFn(elem, d); },
        update (elem, d, i) { transitionBars(elem, d, i, params); }
    };
    return makeElement(container, 'rect', points, null, updateFns, keyFn);
};
