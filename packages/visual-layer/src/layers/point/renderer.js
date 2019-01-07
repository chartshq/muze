/* global Element, document  */
import {
    makeElement,
    selectElement,
    easeFns,
    objectIterator,
    getSymbol
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
const createShape = function (d, elem) {
    const groupElement = selectElement(elem);
    const { shape, size, update } = d;

    if (shape instanceof Promise) {
        shape.then((res) => {
            d.shape = res;
            createShape(d, elem);
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
        selectElement(groupElement.node().appendChild(newShape));
    } else if (typeof shape === 'string') {
        let pathStr;
        if (checkPath(shape)) {
            pathStr = shape;
        } else {
            pathStr = getSymbol(shape).size(size)(update);
        }
        makeElement(groupElement, 'path', data => [data]).attr('d', pathStr);
    } else {
        d.shape = 'circle';
        createShape(d, elem);
    }
};

/**
 * Draws symbols using d3 symbol api
 * @param {Object} params Contains the svg container, points and other symbol related attributes.
 */
/* istanbul ignore next */ const drawSymbols = (params) => {
    let mergedGroups;
    const { layer, container, points, transition, className } = params;
    const { duration, effect, disabled } = transition;
    const mount = selectElement(container);

    mount.attr('class', className);
    const symbolGroups = mount.selectAll('g').data(points, params.keyFn);
    const symbolEnter = symbolGroups.enter().append('g').attr('transform', d => `translate(${d.enter.x},${d.enter.y})`);
    mergedGroups = symbolGroups.merge(symbolEnter)
                    .each(function (d) {
                        createShape(d, this);
                    });
    mergedGroups = disabled ? mergedGroups :
        mergedGroups.transition()
        .duration(transition.duration)
        .on('end', layer.registerAnimationDoneHook());
    mergedGroups.attr('transform', d => `translate(${d.update.x},${d.update.y})`)
                    .each(function (d) {
                        const style = d.style;
                        const element = selectElement(this);
                        objectIterator(style, key => element.style(key, style[key]));
                        element.attr('class', `${className}`);
                        element.classed(d.className, true);
                    });

    const exitGroups = symbolGroups.exit();
    if (!disabled) {
        exitGroups.transition().ease(easeFns[effect])
                        .duration(duration)
                        .on('end', function () {
                            selectElement(this).remove();
                        })
                        .style('fill-opacity', 0)
                        .style('stroke-opacity', 0);
    } else {
        exitGroups.remove();
    }
};

export default drawSymbols;
