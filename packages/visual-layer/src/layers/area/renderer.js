import { area,
    curveLinear,
    curveCatmullRom
} from 'd3-shape';
import {
    easeFns,
    selectElement
} from 'muze-utils';

const curveInterpolators = {
        linear: curveLinear,
        catmullRom: curveCatmullRom
    },
    /**
     * Draws a line from the points
     * Generates a svg path string
     * @param {Object} params Contains container, points and interpolate attribute.
     */
    /* istanbul ignore next */ drawArea = (params) => {
        let filteredPoints;
        let selectionEnter;
        const { container, points, style, transition, className, connectNullData, interpolate } = params;

        const { effect: easeEffect, duration } = transition;
        const mount = selectElement(container);
        const curveInterpolatorFn = curveInterpolators[interpolate];
        const selection = mount.selectAll('path').data([1]);
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
        selectionEnter = selection.enter().append('path').attr('d', enterAreaPath(filteredPoints));
        selection.merge(selectionEnter).transition().ease(easeFns[easeEffect])
                        .duration(duration)
                        .attr('d', updateAreaPath(filteredPoints))
                        .each(function () {
                            const element = selectElement(this);
                            Object.keys(style).forEach(key => element.style(key, style[key]));
                        });
    };

export default drawArea;
