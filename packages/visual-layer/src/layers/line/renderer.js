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

const putIndexePrevOrNext = (arr, index, indexesObj) => {
    const updateNext = arr[index + 1].update;
    const updatePrevious = arr[index - 1].update;
    if (updatePrevious.y !== null && updatePrevious.x !== null) {
        indexesObj.prevOfNull.push(index - 1);
    }
    if (updateNext.y !== null && updateNext.x !== null) {
        indexesObj.nextOfNull.push(index + 1);
    }
};

const getSideIndexes = (arr) => {
    const indexes = {
        prevOfNull: [],
        nextOfNull: []
    };
    arr.forEach((value, index) => {
        const { update } = value;
        if (update.y === null || update.x === null) {
            putIndexePrevOrNext(arr, index, indexes);
        }
    });
    return indexes;
};

const makeStartEndPair = (arr, sideIndexes) => {
    const pairsArray = [];
    const length = sideIndexes.prevOfNull.length;
    if (!length) {
        return pairsArray;
    }

    for (let i = 0; i < length; i++) {
        const pair = [];
        const prevValue = arr[sideIndexes.prevOfNull[i]];
        const nextValue = arr[sideIndexes.nextOfNull[i]];
        if (prevValue) {
            pair.push(prevValue);
        }
        if (nextValue) {
            pair.push(nextValue);
        }
        pairsArray.push(pair);
    }
    return pairsArray;
};

const sanitizeNullConfig = (arr) => {
    const sideIndexes = getSideIndexes(arr);
    return makeStartEndPair(arr, sideIndexes);
};

const getELementsForLine = (params) => {
    const { mount, data, className, layer, strokeStyle, linepath, transition } = params;
    let element = makeElement(mount, 'path', data.length ? [data[0].className] : [], `.${className}`);
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
        if (connectNullData) {
            d.length > 1 && getELementsForLine({
                mount,
                data: d,
                strokeStyle,
                layer,
                linepath,
                transition
            });
        }
        return null;
    });
    return elementWithNullData;
};
