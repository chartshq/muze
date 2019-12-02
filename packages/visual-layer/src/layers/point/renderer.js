/* global Element, document  */
import {
    makeElement,
    selectElement,
    easeFns,
    objectIterator,
    getSymbol,
    setStyles
} from 'muze-utils';

/**
 *
 *
 * @param {*} str
 *
 */
const checkPath = (str) => {
    if (/^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(str) && /[\dz]$/i.test(str) && str.length > 4) {
        return true;
    }
    return false;
};

/**
 *
 *
 * @param {*} d
 * @param {*} elem
 */
const createShape = function (d, groupElement) {
    const { shape, size, update, style } = d;

    if (shape instanceof Promise) {
        shape.then((res) => {
            d.shape = res;
            createShape(d, groupElement);
        });
    } else if (shape instanceof Element) {
        let newShape = shape.cloneNode(true);

        if (newShape.nodeName.toLowerCase() === 'img') {
            const src = newShape.src || newShape.href;
            newShape = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            newShape.setAttribute('href', src);
        }
        const shapeElement = selectElement(newShape);
        if (newShape.nodeName === 'path' || newShape.nodeName === 'image') {
            shapeElement.attr('transform', `scale(${size / 100})`);
        } else {
            shapeElement.attr('height', size);
            shapeElement.attr('width', size);
        }
        shapeElement.attr('x', -size / 2);
        shapeElement.attr('y', -size / 2);
        makeElement(groupElement, () => newShape, [1]);
    } else if (typeof shape === 'string') {
        let pathStr;
        if (checkPath(shape)) {
            pathStr = shape;
        } else {
            pathStr = getSymbol(shape).size(size)(update);
        }
        const pathEl = makeElement(groupElement, 'path', data => [data]).attr('d', pathStr);
        setStyles(pathEl, style);
    } else {
        d.shape = 'circle';
        createShape(d, groupElement);
    }
};

/**
 * Draws symbols using d3 symbol api
 * @param {Object} params Contains the svg container, points and other symbol related attributes.
 */
/* istanbul ignore next */ const drawSymbols = (params) => {
    const { layer, container, points, transition, className } = params;
    const { duration, effect, disabled } = transition;
    const mount = selectElement(container);
    const graphicElems = layer._graphicElems;
    mount.attr('class', className);
    return makeElement(mount, 'g', points, null, {
        enter: (group, d) => {
            const { enter } = d;
            group.attr('transform', `translate(${enter.x},${enter.y})`);
        },
        update: (group, d) => {
            createShape(d, group);
            graphicElems[d.rowId] = group;
            const { update, style } = d;
            objectIterator(style, key => group.style(key, style[key]));
            group.attr('class', className);
            group.classed(d.className, true);
            if (!disabled) {
                group = group.transition()
                    .duration(transition.duration)
                    .on('end', layer.registerAnimationDoneHook());
            }
            group.attr('transform', `translate(${update.x},${update.y})`);
        },
        exit: (exitGroup) => {
            if (!disabled) {
                exitGroup.transition().ease(easeFns[effect])
                .duration(duration)
                .on('end', () => exitGroup.remove())
                .style('fill-opacity', 0)
                .style('stroke-opacity', 0);
            } else {
                exitGroup.remove();
            }
        }
    }, params.keyFn);
};

export default drawSymbols;
