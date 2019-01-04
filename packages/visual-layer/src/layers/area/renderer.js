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
    let filteredPoints;
    const { layer, container, points, style, transition, className, connectNullData, interpolate } = params;

    const { effect: easeEffect, duration } = transition;
    const mount = selectElement(container);
    const curveInterpolatorFn = pathInterpolators[interpolate];
    const selection = mount.selectAll('path').data([params.points]);
    const [enterAreaPath, updateAreaPath] = ['enter', 'update'].map(e => area().curve(curveInterpolatorFn)
                    .x(d => d[e].x)
                    .y1(d => d[e].y)
                    .y0(d => d[e].y0)
                    .defined(d => d[e].y !== null
            ));

    filteredPoints = points;
    mount.attr('class', className);
    if (connectNullData) {
        filteredPoints = points.filter(d => d.update.y !== null);
    }
    const selectionEnter = selection.enter().append('path').attr('d', enterAreaPath(filteredPoints));
    selection.merge(selectionEnter).transition().ease(easeFns[easeEffect])
                    .duration(duration)
                    .on('end', layer.registerAnimationDoneHook())
                    .attr('d', updateAreaPath(filteredPoints))
                    .each(function (d) {
                        const element = selectElement(this);

                        element.classed(d[0].className, true);
                        Object.keys(style).forEach(key => element.style(key, style[key]));
                    });
};

export default drawArea;
