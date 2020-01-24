import {
    easeFns,
    selectElement,
    pathInterpolators,
    Symbols
} from 'muze-utils';

const area = Symbols.area;

/**
 * Draws a line from the points
 * Generates a svg path string
 * @param {Object} params Contains container, points and interpolate attribute.
 */
const /* istanbul ignore next */ drawArea = (params) => {
    const { layer, container, style, points, transition, className, interpolate, connectNullData } = params;
    const graphicElems = layer._graphicElems;
    const { effect: easeEffect, duration } = transition;
    const mount = selectElement(container);
    const curveInterpolatorFn = pathInterpolators[interpolate];
    const selection = mount.selectAll('path').data(points.length ? [points] : []);
    const [enterAreaPath, updateAreaPath] = ['enter', 'update'].map(e => area().curve(curveInterpolatorFn)
                    .x(d => d[e].x)
                    .y1(d => d[e].y)
                    .y0(d => d[e].y0)
                    .defined(d => d[e].y !== null));

    mount.attr('class', className);

    let filteredPoints = points;
    if (connectNullData) {
        filteredPoints = filteredPoints.filter(d => d.update.y !== null);
    }
    const selectionEnter = selection
        .enter()
        .append('path')
        .attr('d', enterAreaPath(filteredPoints))
        .each((d) => {
            d.forEach((dd) => {
                if (dd.rowId !== null) {
                    graphicElems[dd.rowId] = mount.select('path');
                }
            });
        });

    selection.merge(selectionEnter).transition().ease(easeFns[easeEffect])
                    .duration(duration)
                    .on('end', layer.registerAnimationDoneHook())
                    .attr('d', updateAreaPath(filteredPoints))
                    .each(function () {
                        const element = selectElement(this);
                        Object.keys(style).forEach(key => element.style(key, style[key]));
                    });
};

export default drawArea;
