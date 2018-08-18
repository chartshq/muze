import {
    selectElement,
    makeElement,
    pathInterpolators,
    Symbols
} from 'muze-utils';
import { updateStyle } from '../../helpers';

const line = Symbols.line;

/**
 * Draws a line from the points
 * Generates a svg path string
 * @param {Object} params Contains container, points and interpolate attribute.
 */
export const drawLine = (context) => {
    let filteredPoints;
    const { container, points, interpolate, connectNullData, className, style } = context;
    const mount = selectElement(container).attr('class', className);
    const curveInterpolatorFn = pathInterpolators[interpolate];
    const linepath = line()
                .curve(curveInterpolatorFn)
                .x(d => d.update.x)
                .y(d => d.update.y)
                .defined(d => d.update.y !== null);

    filteredPoints = points;
    if (connectNullData) {
        filteredPoints = points.filter(d => d.update.y !== null);
    }

    updateStyle(mount, style);
    return makeElement(mount, 'path', [1])
                    .transition()
                    .duration(1000)
                    .attr('d', linepath(filteredPoints))
                    .style('fill-opacity', 0);
};
