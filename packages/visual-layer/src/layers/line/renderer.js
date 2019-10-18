import {
    selectElement,
    makeElement,
    pathInterpolators,
    Symbols
} from 'muze-utils';
import { updateStyle } from '../../helpers';
import { STROKE_DASHARRAY } from '../../enums/constants';

const line = Symbols.line;

const filterFn = (d) => {
    const { update } = d;
    return update.y !== null && update.x !== null;
};

const getELementsForLine = (params) => {
    const { mount, data, className, layer, strokeStyle, linepath, transition } = params
    let element = makeElement(mount, 'path', data.length ? [data[0].className] : [], `.${className}`);
    element.attr('d', linepath(data))
    element.attr('class', d => d);
    if (!transition.disabled) {
        element = element.transition()
            .duration(transition.duration)
            .on('end', layer.registerAnimationDoneHook());
    }
    const styleKey = strokeStyle ? STROKE_DASHARRAY : 'fill-opacity'; 
    const styleValue = strokeStyle ? strokeStyle : 0 ; 
    element.attr('d', linepath(data)).style(styleKey, (styleValue))
    return element;
};

/**
 * Draws a line from the points
 * Generates a svg path string
 * @param {Object} params Contains container, points and interpolate attribute.
 */
export const drawLine = (context) => {
    const { layer, container, points, interpolate, connectNullData, className, style, transition } = context;
    const strokeStyle = layer.config().nullDataLineStyle[STROKE_DASHARRAY];
    const mount = selectElement(container).attr('class', className);
    const curveInterpolatorFn = pathInterpolators[interpolate];
    const linepath = line()
        .curve(curveInterpolatorFn)
        .x(d => d.update.x)
        .y(d => d.update.y)
        .defined(filterFn);

    updateStyle(mount, style);

    const elementWithNullData = getELementsForLine({
        mount,
        data: points,
        className: 'p1',
        strokeStyle: undefined,
        layer,
        linepath,
        transition
    });

    if (connectNullData) {
        getELementsForLine({
            mount,
            data: points.filter(filterFn),
            className: 'p2',
            strokeStyle,
            layer,
            linepath,
            transition
        });
    }
    return elementWithNullData;
};
