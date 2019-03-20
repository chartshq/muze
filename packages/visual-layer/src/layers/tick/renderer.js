import { selectElement, Symbols, pathInterpolators, linkHorizontal } from 'muze-utils';

const line = Symbols.line;

/**
 * Draws ticks by using d3 selection
 * @param  {Object} params Contains container element and points
 * @return {Selection} Ticks Selection
 */
export default /* istanbul ignore next */ (params) => {
    const { points, container, keyFn, className, interpolate } = params;
    const mount = selectElement(container);
    const ticks = mount.selectAll('path').data(points, keyFn);
    const ticksEnter = ticks.enter().append('path');

    mount.attr('class', className || '');
    ticksEnter.each(function (d) {
        const selection = selectElement(this);
        const enter = d.enter || {};
        Object.entries(enter).forEach(attr => (!isNaN(attr[1]) && selection.attr(attr[0], attr[1])));
    });
    const path = linkHorizontal().x(d => d.x).y(d => d);
    ticks.exit().remove();
    return ticks.merge(ticksEnter)
                    .each(function (d) {
                        const selection = selectElement(this);
                        const update = d.update;
                        const updateStyle = d.style || {};
                        const x0 = update.x0 !== undefined ? update.x0 : update.x;
                        const y0 = update.y0 !== undefined ? update.y0 : update.y;
                        const curveInterpolatorFn = pathInterpolators[interpolate];
                        const linepath = line()
                            .curve(curveInterpolatorFn)
                            .x(e => e[0])
                            .y(e => e[1]);
                        // const path = `M ${update.x} ${update.y} L ${x0} ${y0}`;
                        d.className && selection.classed(d.className, true);
                        selection.attr('d', linepath([[update.x, update.y], [x0, y0]]));
                        Object.entries(updateStyle).forEach(styleObj => selection.style(styleObj[0], styleObj[1]));
                    });
};

