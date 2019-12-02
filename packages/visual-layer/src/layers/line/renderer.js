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

const containsNull = (elem) => {
    const { x, y } = elem ? elem.update : {};
    if (x === null || y === null) {
        return true;
    }
    return false;
};

const settIndexPrevOrNext = (arr, index, indexesObj) => {
    const prevContainsNull = containsNull(arr[index - 1], index - 1);
    const nextContainsNull = containsNull(arr[index + 1], index + 1);

    !prevContainsNull && indexesObj.prevOfNull.push(index - 1);
    !nextContainsNull && indexesObj.nextOfNull.push(index + 1);
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
    const { prevOfNull, nextOfNull } = borderIndexes;
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

const getElementsForLine = (params) => {
    const { mount, data, className, layer, strokeStyle, linepath, transition, updateFns } = params;
    let element = makeElement(mount, 'path', data.length ? [data] : [], className, updateFns);
    element.attr('class', (d, i) => d[i].className);
    setStyles(element, strokeStyle);
    if (!transition.disabled) {
        element = element.transition()
        .duration(transition.duration)
        .on('end', layer.registerAnimationDoneHook());
    }
    element.attr('d', linepath(data))
                    .style('fill-opacity', 0);
    return element;
};

/**
 * Draws a line from the points
 * Generates a svg path string
 * @param {Object} params Contains container, points and interpolate attribute.
 */
export const drawLine = (context) => {
    const { layer, container, points, interpolate, connectNullData, className, style, transition } = context;
    const containerSelection = selectElement(container);
    const strokeStyle = layer.config().nullDataLineStyle;
    const nullDataLineClass = layer.config().nullDataLineClass;
    const mount = containerSelection.attr('class', className);
    const curveInterpolatorFn = pathInterpolators[interpolate];
    const linepath = line()
        .curve(curveInterpolatorFn)
        .x(d => d.update.x)
        .y(d => d.update.y)
        .defined(filterFn);

    const graphicElems = layer._graphicElems;
    const updateFns = {
        update: (group, d) => {
            d.forEach((dd) => {
                graphicElems[dd.rowId] = containerSelection;
            });
        }
    };

    updateStyle(mount, style);

    const elementWithNullData = getElementsForLine({
        mount,
        data: points,
        strokeStyle: undefined,
        layer,
        linepath,
        transition,
        updateFns
    });
    const sanitizedPoints = sanitizeNullConfig(points);

    sanitizedPoints.map((d) => {
        if (connectNullData && d.length > 1) {
            getElementsForLine({
                mount,
                data: d,
                strokeStyle,
                className: `.${className}-${nullDataLineClass}`,
                layer,
                linepath,
                transition,
                updateFns
            });
        }
        return null;
    });
    return elementWithNullData;
};
