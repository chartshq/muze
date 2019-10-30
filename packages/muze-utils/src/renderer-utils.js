import { select, event as d3event, selection, clientPoint } from 'd3-selection';
import { drag as d3drag } from 'd3-drag';
import 'd3-transition';
import { mergeRecursive } from './common-utils';
/**
 * This function takes a raw DOM element or
 * a string and returns a d3 selection of that element.
 *
 * @param {HTMLElement | string} element The element to wrap in d3 selection.
 * @return {Selection} Instance of d3 selection.
 */
const selectElement = element => select(element);

/**
 * It creates a new d3 element on the parent element
 * @param  {Selection} parent Element to which the element is to be appended
 * @param  {Object} elemType Type of the new element
 * @param  {Array} data Data for the new element
 * @param  {Object} selector classname/id/tagname for the element
 * @return {HTMLElement} Newly Created Element
 */
const makeElement = (parent, elemType, data, selector, callbacks = {}, keyFn) => {
    if ((parent instanceof HTMLElement || parent instanceof SVGElement)) {
        parent = selectElement(parent);
    }

    const selectorVal = selector ? selector[0] : null;
    let selectorType = null;
    let actualSelector = null;
    let element = null;
    let enterSel = null;
    let mergeSel = null;
    let filter;
    if (selectorVal) {
        if (selectorVal === '#') {
            selectorType = 'id';
            actualSelector = selector;
        } else {
            selectorType = 'class';
            actualSelector = selector[0] === '.' ? selector : `.${selector}`;
        }
    } else {
        actualSelector = elemType;
        filter = true;
    }
    element = parent.selectAll(actualSelector);

    filter && (element = element.filter(function () {
        return this.parentNode === parent.node();
    }));
    element = element.data(data, keyFn);

    enterSel = element.enter()
                            .append(elemType || 'div');
    callbacks.enter && enterSel.each(function (...params) {
        callbacks.enter(selectElement(this), ...params);
    });

    mergeSel = enterSel.merge(element);
    callbacks.update && mergeSel.each(function (...params) {
        callbacks.update(selectElement(this), ...params);
    });
    if (selectorType === 'class') {
        mergeSel.classed(selectorVal === '.' ? selector.substring(1, selector.length) : selector, true);
    } else if (selectorType === 'id') {
        mergeSel.attr('id', selector.substring(1, selector.length));
    }
    const exitSel = element.exit();

    if (callbacks.exit) {
        exitSel.each(function (...params) {
            callbacks.exit(selectElement(this), ...params);
        });
    } else {
        exitSel.remove();
    }
    return mergeSel;
};

/**
 * This function applies styles to an element
 *  @param  {Object} elem Element Selection
 * @param  {Object} styleObj Style Object to be applied
 * @return {Element} Newly Created Element
*/
const applyStyle = (elem, styleObj) => {
    Object.entries(styleObj).forEach((d) => {
        elem.style(d[0], d[1]);
    }, this);
    return elem;
};

/**
 * This function appends a dom element in another element.
 * @param {HTMLElement | SVGElement} element1 The element in which to append the second element
 * @param {HTMLElement | SVGElement} element2 The element which will be appended.
 */
const appendElement = (element1, element2) => {
    element1.appendChild(element2);
};

/**
 * Sets the attributes to the element.
 * @param {HTMLElement | SVGElement} element Element on which attributes will be applied
 * @param {Object} attrs Attributes which need to be applied
 */
const setElementAttrs = (element, attrs) => {
    for (const key in attrs) {
        if ({}.hasOwnProperty.call(attrs, key)) {
            element.attr(key, attrs[key]);
        }
    }
};

/**
 * Sets attributes in the svg or html element
 * @param {SVGElement | HTMLElement} element The element on which attrs will be applied
 * @param {Array.<Object>} attrs Array of attributes
 * @param {string} className className of elements to select.
 * @return {SVGElement | HTMLElement} SVGElement or html element.
 */
const setAttrs = (element, attrs, className) => {
    if (!(element instanceof selection)) {
        element = selectElement(element);
    }
    className !== undefined ? element.selectAll(`.${className}`).each(function () {
        setElementAttrs(select(this), attrs);
    }) : setElementAttrs(element, attrs);
    return element;
};

/**
 * Adds a css class to elements which passes the filter function.If filter function is not given,
 * then all elements will be applied the class.
 * @param {HTMLElement | SVGElement} element element
 * @param {string} className css class
 * @param {string} selector css selector
 * @param {Function} filterFn filter method.
 */
const addClass = (element, className, selector, filterFn) => {
    select(element).selectAll(selector).each(function (data) {
        const elem = select(this);
        filterFn ? filterFn(data) && elem.classed(className, true) :
                elem.classed(className, true);
    });
};

/**
 * Removes the css class from elements which passes the filter function.If filter function is not given,
 * then all elements will be applied the class.
 * @param {HTMLElement | SVGElement} element element
 * @param {string} className css class
 * @param {string} selector css selector
 * @param {Function} filterFn filter method.
 */
const removeClass = (element, className, selector, filterFn) => {
    select(element).selectAll(selector).each(function (data) {
        const elem = select(this);
        filterFn ? filterFn(data) && elem.classed(className, false) :
                elem.classed(className, false);
    });
};

/**
 * Sets styles in the svg or html element
 * @param {SVGElement | HTMLElement} element The element on which styles will be applied
 * @param {Array.<Object>} styles Array of style attributes
 * @return {SVGElement | HTMLElement} SVGElement or html element.
 */
const setStyles = (element, styles) => {
    if (!(element instanceof selection)) {
        element = selectElement(element);
    }
    for (const key in styles) {
        if ({}.hasOwnProperty.call(styles, key)) {
            element.style(key, styles[key]);
        }
    }
    return element;
};

/**
 * Creates svg or html elements by binding data to the selection.Removes extra elements
 * on exit.
 * @param {Object} params Parameter object
 * @param {SVGElement | HTMLElement} params.container Container element where all elements will be appended
 * @param {string} params.selector Selector by which elements will be selected from dom
 * @param {string} params.append Append tag
 * @param {Function} params.each Function which will be executed for each data point and element.
 */
const createElements = (params) => {
    const container = select(params.container);
    let data;

    data = params.data;
    if (typeof data === 'number') {
        data = Array(data).fill().map((d, i) => i);
    }
    const sel = container.selectAll(params.selector).filter(function () {
        return this.parentNode === container.node();
    }).data(data);

    const selectionMerge = sel.enter().append(params.append).merge(sel).each(function (d, i) {
        params.each(d, select(this), i);
    });

    selectionMerge.attr('class', params.className || '');
    sel.exit().remove();
};

/**
 * Clips an element with given measurement. Basically it is used to hide overflowing portions
 * of any element.
 * @param {SVGElement} container svg element which needs to be clipped.
 * @param {Object} measurement Dimensions of the clipped rectangle.
 * @param {string} id Unique id of the clip element
 */
const clipElement = (container, measurement, id) => {
    const clipPathElement = makeElement(select(container), 'clipPath', [1], `#${id}`);
    const clipPathRect = makeElement(clipPathElement, 'rect', [1]);
    clipPathRect.attr('x', measurement.x)
                    .attr('y', measurement.x)
                    .attr('width', measurement.width)
                    .attr('height', measurement.height);
    clipPathElement.attr('clip-path', `url(#${id})`);
};

/**
 * Returns the element of the corresponding classname.
 * @param {HTMLElement | SVGElement} node html or svg node element.
 * @param {string} className css class to be applied.
 * @return {HTMLElement | SVGElement} html or svg element.
 */
const getElementsByClassName = (node, className) => select(node).selectAll(className).nodes();

/**
 * Gets the mouse position relative to an svg type of element
 * @param {SVGElement} element Any svg element like rect, circle, etc.
 * @param {Event} event Event object.
 * @return {Object} x and y position relative to the container element passed.
 */
const getMousePos = (element, event) => {
    const boundingClientRect = element.getBoundingClientRect();
    return {
        x: event.x - boundingClientRect.x,
        y: event.y - boundingClientRect.y
    };
};

const getClientPoint = (...params) => {
    const pos = clientPoint(...params);
    return {
        x: pos[0],
        y: pos[1]
    };
};

/** This function appends a dom element in another element.
 * @param {Object} tag The tag name of the element to append
 * @param {Object} mount Mount point fo the element
 * @return {Object} selection of the appended element
 */
const createElement = (tag, mount) => select(mount).append(tag).node();

/**
 * Gets the d3 event function
 * @return {Object} d3 event
 */
const getEvent = () => d3event;

/**
 * Gets the d3 drag function
 * @return {Object} d3 drag
 */
const getD3Drag = () => d3drag;

const getSmartComputedStyle = (group, css) => {
    let textEl;
    const testText = 'W';
    const mandatoryStyle = {
        'fill-opacity': 0
    };
    const className = typeof css === 'string' ? css : (css instanceof Array ? css.join(' ') : undefined);

    if (group.node() instanceof HTMLElement) {
        textEl = group.append('div').html(testText);
    } else {
        textEl = group.append('text').text(testText);
    }

    if (className) {
        textEl.attr('class', className);
    } else if (typeof css === 'object') {
        delete css['fill-opacity'];
        mergeRecursive(mandatoryStyle, css);
    }

    textEl.style(mandatoryStyle);
    const computedStyle = window.getComputedStyle(textEl.node());
    const styleForSmartLabel = {
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        fontStyle: computedStyle.fontStyle
    };

    textEl.remove();

    return styleForSmartLabel;
};

const hasTouch = () => 'ontouchstart' in document.documentElement;

export {
    hasTouch,
    selectElement,
    makeElement,
    applyStyle,
    addClass,
    removeClass,
    appendElement,
    setAttrs,
    setStyles,
    createElement,
    createElements,
    clipElement,
    getElementsByClassName,
    getMousePos,
    getEvent,
    getD3Drag,
    getSmartComputedStyle,
    getClientPoint
};
