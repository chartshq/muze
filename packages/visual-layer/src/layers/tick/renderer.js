import { selectElement, Symbols, pathInterpolators } from 'muze-utils';

const line = Symbols.line;

/**
 * Draws ticks by using d3 selection
 * @param  {Object} params Contains container element and points
 * @return {Selection} Ticks Selection
 */
export default /* istanbul ignore next */ (params) => {
    const { points, container, keyFn, className, interpolate, layer } = params;
    const mount = selectElement(container);
    const ticks = mount.selectAll('path').data(points, keyFn);
    const ticksEnter = ticks.enter().append('path');
    const graphicElems = layer._graphicElems;
    mount.attr('class', className || '');
    ticksEnter.each(function (d) {
        const selection = selectElement(this);
        const enter = d.enter || {};
        Object.entries(enter).forEach(attr => (!isNaN(attr[1]) && selection.attr(attr[0], attr[1])));
    });

    ticks.exit().remove();
    return ticks.merge(ticksEnter)
                    .each(function (d) {
                        const selection = selectElement(this);
                        graphicElems[d.rowId] = selection;
                        const update = d.update;
                        const updateStyle = d.style || {};
                        const x0 = update.x0 !== undefined ? update.x0 : update.x;
                        const y0 = update.y0 !== undefined ? update.y0 : update.y;
                        const curveInterpolatorFn = pathInterpolators[interpolate];
                        const linepath = line()
                            .curve(curveInterpolatorFn)
                            .x(e => e[0])
                            .y(e => e[1]);
                        d.className && selection.classed(d.className, true);
                        selection.attr('d', linepath([[update.x, update.y], [x0, y0]]));
                        Object.entries(updateStyle).forEach(styleObj => selection.style(styleObj[0], styleObj[1]));
                    });
};

