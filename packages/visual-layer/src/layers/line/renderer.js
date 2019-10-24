import {
    selectElement,
    makeElement,
    pathInterpolators,
    Symbols
} from 'muze-utils';
import { updateStyle } from '../../helpers';

const line = Symbols.line;

const filterFn = (d) => {
    const { update } = d;
    return update.y !== null && update.x !== null;
};

/**
 * Draws a line from the points
 * Generates a svg path string
 * @param {Object} params Contains container, points and interpolate attribute.
 */
export const drawLine = (context) => {
    let filteredPoints;
    const { layer, container, points, interpolate, connectNullData, className, style, transition } = context;
    const containerSelection = selectElement(container);
    const mount = containerSelection.attr('class', className);
    const curveInterpolatorFn = pathInterpolators[interpolate];
    const linepath = line()
                .curve(curveInterpolatorFn)
                .x(d => d.update.x)
                .y(d => d.update.y)
                .defined(filterFn);

    filteredPoints = points;
    if (connectNullData) {
        filteredPoints = points.filter(filterFn);
    }

    const graphicElems = layer._graphicElems;
    const updateFns = {
        update: (group, d) => {
            d.forEach((dd) => {
                graphicElems[dd.rowId] = containerSelection;
            });
        }
    };

    updateStyle(mount, style);
    let element = makeElement(mount, 'path', points.length ? [points] : [], null, updateFns);
    element.attr('class', (d, i) => d[i].className);
    if (!transition.disabled) {
        element = element.transition()
        .duration(transition.duration)
        .on('end', layer.registerAnimationDoneHook());
    }
    element.attr('d', linepath(filteredPoints))
                    .style('fill-opacity', 0);
    return element;
};
