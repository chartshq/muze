import {
    selectElement,
    Symbols,
    pathInterpolators,
    makeElement
} from 'muze-utils';

const line = Symbols.line;

/**
 * Draws ticks by using d3 selection
 * @param  {Object} params Contains container element and points
 * @return {Selection} Ticks Selection
 */
export default /* istanbul ignore next */ (params) => {
    const { points, container, keyFn, className, interpolate, layer, transition } = params;
    const { disabled } = transition;

    const mount = selectElement(container);
    const graphicElems = layer._graphicElems;
    mount.attr('class', className);

    return makeElement(mount, 'g', points, null, {
        enter: (group, d) => {
            const enter = d.enter || {};
            Object.entries(enter).forEach(attr => (!isNaN(attr[1]) && group.attr(attr[0], attr[1])));
        },
        update: (group, d) => {
            const pathElem = makeElement(group, 'path', [1]);
            graphicElems[d.rowId] = group;
            const { update, style } = d;
            group.attr('class', className);
            group.classed(d.className, true);

            const x0 = update.x0 !== undefined ? update.x0 : update.x;
            const y0 = update.y0 !== undefined ? update.y0 : update.y;
            const curveInterpolatorFn = pathInterpolators[interpolate];
            const linepath = line()
            .curve(curveInterpolatorFn)
            .x(e => e[0])
            .y(e => e[1]);

            d.className && group.classed(d.className, true);
            pathElem.attr('d', linepath([[update.x, update.y], [x0, y0]]));
            if (!disabled) {
                group = group.transition()
                    .duration(transition.duration)
                    .on('end', layer.registerAnimationDoneHook());
            }
            Object.entries(style).forEach(styleObj => group.style(styleObj[0], styleObj[1]));
        },
        exit: (exitGroup) => {
            exitGroup.remove();
        }
    }, keyFn);
};
