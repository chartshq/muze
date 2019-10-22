import {
    selectElement,
    makeElement,
    pathInterpolators,
    Symbols,
    setStyles
} from 'muze-utils';
import { updateStyle } from '../../helpers';

const line = Symbols.line;

const filterFn = (d) => {
    const { update } = d;
    return update.y !== null && update.x !== null;
};

const settIndexHelper = (elem, index) => {
    const {x, y} = elem ? elem.update : {};
    if (x !== null && y !== null) {
        return index;
    }
    return -1;
}

const settIndexPrevOrNext = (arr, index, indexesObj) => {
    const prev = settIndexHelper(arr[index - 1], index - 1);
    const next = settIndexHelper(arr[index + 1], index + 1);

    prev >= 0  && indexesObj.prevOfNull.push(prev);
    next >= 0 && indexesObj.nextOfNull.push(next);
};

const getborderIndexes = (arr) => {
    const indexes = {
        prevOfNull: [],
        nextOfNull: []
    };
    arr.forEach((value, index) => {
        const { update } = value;
        if (update.y === null || update.x === null) {
            settIndexPrevOrNext(arr, index, indexes);
        }
    });
    return indexes;
};

const makeStartEndPair = (arr, borderIndexes) => {
    const pairArray = [];
    const { prevOfNull, nextOfNull} = borderIndexes;
    const length = prevOfNull.length;
    if (!length) {
        return pairArray;
    }

    for (let i = 0; i < length; i++) {
        const pair = [];
        const prevValue = arr[prevOfNull[i]];
        const nextValue = arr[nextOfNull[i]];
        if (prevValue) {
            pair.push(prevValue);
        }
        if (nextValue) {
            pair.push(nextValue);
        }
        pairArray.push(pair);
    }
    return pairArray;
};

const sanitizeNullConfig = (arr) => {
    const borderIndexes = getborderIndexes(arr);
    return makeStartEndPair(arr, borderIndexes);
};

const getELementsForLine = (params) => {
    const { mount, data, className, layer, strokeStyle, linepath, transition } = params;
    let element = makeElement(mount, 'path', data.length ? [data[0].className] : [], className);
    element.attr('d', linepath(data));
    element.attr('class', d => d);
    setStyles(element, strokeStyle);
    if (!transition.disabled) {
        element = element.transition()
            .duration(transition.duration)
            .on('end', layer.registerAnimationDoneHook());
    }
    element.attr('d', linepath(data)).style('fill-opacity', 0);
    return element;
};

/**
 * Draws a line from the points
 * Generates a svg path string
 * @param {Object} params Contains container, points and interpolate attribute.
 */
export const drawLine = (context) => {
    const { layer, container, points, interpolate, connectNullData, className, style, transition } = context;
    const strokeStyle = layer.config().nullDataLineStyle;
    const nullDataLineClass = layer.config().nullDataLineClass;
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
        strokeStyle: undefined,
        layer,
        linepath,
        transition
    });
    const sanitizedPoints = sanitizeNullConfig(points);
    sanitizedPoints.map((d) => {
        if (connectNullData && d.length > 1) {
            getELementsForLine({
                mount,
                data: d,
                strokeStyle,
                className:`.${className}-${nullDataLineClass}`,
                layer,
                linepath,
                transition
            });
        }
        return null;
    });
    return elementWithNullData;
};
