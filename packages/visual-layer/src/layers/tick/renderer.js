import { selectElement } from 'muze-utils';

/**
 * Draws ticks by using d3 selection
 * @param  {Object} params Contains container element and points
 * @return {Selection} Ticks Selection
 */
export default /* istanbul ignore next */ (params) => {
    const { points, container, keyFn, className } = params;
    const mount = selectElement(container);
    const ticks = mount.selectAll('path').data(points, keyFn);
    const ticksEnter = ticks.enter().append('path');

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
                        const update = d.update;
                        const updateStyle = d.style || {};
                        const x0 = update.x0 !== undefined ? update.x0 : update.x;
                        const y0 = update.y0 !== undefined ? update.y0 : update.y;
                        const path = `M ${update.x} ${update.y} L ${x0} ${y0}`;
                        d.className && selection.classed(d.className, true);
                        selection.attr('d', path);
                        Object.entries(updateStyle).forEach(styleObj => selection.style(styleObj[0], styleObj[1]));
                    });
};

