/* global window, requestAnimationFrame, cancelAnimationFrame */
import { FieldType, DimensionSubtype, DateTimeFormatter, DM_DERIVATIVES, default as DataModel } from 'datamodel';

import {
    axisLeft,
    axisRight,
    axisTop,
    axisBottom
} from 'd3-axis';
import {
    symbolCircle,
    symbolCross,
    symbolDiamond,
    symbolSquare,
    symbolStar,
    symbolWye,
    symbolTriangle,
    symbol,
    stack as d3Stack,
    stackOffsetDiverging,
    stackOrderNone,
    stackOrderAscending,
    stackOrderDescending,
    stackOffsetNone,
    stackOffsetExpand,
    stackOffsetWiggle,
    pie,
    arc,
    line,
    curveLinear,
    curveStepAfter,
    curveStepBefore,
    curveStep,
    curveCatmullRom,
    area
} from 'd3-shape';
import { scaleBand } from 'd3-scale';
import { nest } from 'd3-collection';
import {
    interpolate,
    interpolateRgb,
    piecewise,
    interpolateNumber,
    interpolateHslLong
} from 'd3-interpolate';
import {
    easeCubic,
    easeBounce,
    easePoly,
    easeBack,
    easeCircle,
    easeLinear,
    easeElastic
} from 'd3-ease';
import {
    color,
    rgb,
    hsl
} from 'd3-color';
import { voronoi } from 'd3-voronoi';
import { dataSelect } from './DataSystem';
import * as scales from './scales';
import { DATA_TYPE, SORT_ORDER_ASCENDING, SORT_ORDER_DESCENDING, ReservedFields } from './enums';
import * as STACK_CONFIG from './enums/stack-config';

const { CATEGORICAL, TEMPORAL } = DimensionSubtype;
const { STRING, FUNCTION } = DATA_TYPE;
const { InvalidAwareTypes } = DataModel;
const HTMLElement = window.HTMLElement;

const isSimpleObject = (obj) => {
    let token;
    if (typeof obj === 'object') {
        if (obj === null) { return false; }
        token = Object.prototype.toString.call(obj);
        if (token === '[object Object]') {
            return (obj.constructor.toString().match(/^function (.*)\(\)/m) || [])[1] === 'Object';
        }
    }
    return false;
};

/**
 * Returns unique id
 * @return {string} Unique id string
 */
const
    getUniqueId = () => `id-${new Date().getTime()}${Math.round(Math.random() * 10000)}`;

/**
 * Deep copies an object and returns a new object.
 * @param {Object} o Object to clone
 * @return {Object} New Object.
 */
const clone = (o) => {
    const output = {};
    let v;
    for (const key in o) {
        if ({}.hasOwnProperty.call(o, key)) {
            v = o[key];
            output[key] = isSimpleObject(v) ? clone(v) : v;
        }
    }
    return output;
};

/**
* Checks the existence of keys in an object
* @param {Array} keys Set of keys which are to be checked
* @param {Object} obj whose keys are checked from the set of keys provided
* @return {Object} Error if the keys are absent, or the object itself
*/
const checkExistence = (keys, obj) => {
    const nonExistentKeys = [];
    keys.forEach((key) => {
        if (key in obj) {
            return;
        }
        nonExistentKeys.push(key);
    });
    return nonExistentKeys;
};

const sanitizeIP = {
    typeObj: (keys, obj) => {
        if (typeof obj !== 'object') {
            return Error('Argument type object expected');
        }

        const nonExistentKeys = checkExistence(keys, obj);
        if (nonExistentKeys.length) {
            return Error(`Missing keys from parameter ${nonExistentKeys.join(', ')}`);
        }
        return obj;
    },

    /* istanbul ignore next */ htmlElem: (elem) => {
        if (!(elem instanceof HTMLElement)) {
            return Error('HTMLElement required');
        }
        return elem;
    }
};

/**
 * Gets the maximum value from an array of objects for a given property name
 * @param  {Array.<Object>} data   Array of objects
 * @param  {string} field Field name
 * @return {number} Maximum value
 */
const getMax = (data, field) => Math.max(...data.map(d => d[field]));

/**
 * Gets the minimum value from an array of objects for a given property name
 * @param  {Array.<Object>} data   Array of objects
 * @param  {string} field Field name
 * @return {number} Minimum value
 */
const getMin = (data, field) => Math.min(...data.map(d => d[field]));

/**
 * Gets the domain from the data based on the field name and type of field
 * @param  {Array.<Object> | Array.<Array>} data       Data Array
 * @param  {Array.<string>} fields    Array of fields from where the domain will be calculated
 * @param {string} fieldType Type of field - nominal, quantitiative, temporal.
 * @return {Array} Usually contains a min and max value if field is quantitative or
 * an array of values if field type is nominal or ordinal
 */
const getDomainFromData = (data, fields, fieldType) => {
    let domain;
    const domArr = [];
    data = data[0] instanceof Array ? data : [data];

    switch (fieldType) {
    case CATEGORICAL:
        domain = [].concat(...data.map(arr => arr.map(d => d[fields[0]]).filter(d => d !== undefined)));
        break;
    default:
        for (let i = 0, len = data.length; i < len; i++) {
            const arr = data[i];
            const [field0, field1] = fields;
            const arr0 = arr.filter(d => !isNaN(d[field0]));
            const arr1 = arr.filter(d => !isNaN(d[field1]));
            if (arr0.length || arr1.length) {
                const firstMin = getMin(arr0, field0);
                const secondMin = getMin(arr1, field1);
                const firstMax = getMax(arr0, field0);
                const secondMax = getMax(arr1, field1);
                domArr.push([Math.min(firstMin, secondMin), Math.max(firstMax, secondMax)]);
            }
        }
        domain = domArr.length ? [Math.min(...domArr.map(d => d[0])), Math.max(...domArr.map(d => d[1]))] : [];
        break;
    }
    return domain;
};

const sanitizeDomainWhenEqual = (domain) => {
    if (domain[0] === domain[1]) {
        domain[0] = domain[0] > 0 ? 0 : domain[0];
        domain[1] = domain[1] > 0 ? domain[1] : 0;
    }
    return domain;
};

/**
 * Union Domain values
 * @param {Array.<Array>} domains Array of domain values
 * @param {string} fieldType type of field - dimension,measure or datetime.
 * @return {Array} Unioned domain of all domain values.
 */
const unionDomain = (domains, fieldType) => {
    let domain = [];
    domains = domains.filter(dom => dom && dom.length);
    if (domains.length) {
        if (fieldType === CATEGORICAL) {
            domain = [].concat(...domains);
        } else {
            domain = [Math.min(...domains.map(d => d[0])), Math.max(...domains.map(d => d[1]))];
        }
    }

    return domain;
};

const symbolFns = {
    circle: symbolCircle,
    cross: symbolCross,
    diamond: symbolDiamond,
    square: symbolSquare,
    star: symbolStar,
    wye: symbolWye,
    triangle: symbolTriangle
};

const easeFns = {
    cubic: easeCubic,
    bounce: easeBounce,
    linear: easeLinear,
    elastic: easeElastic,
    back: easeBack,
    poly: easePoly,
    circle: easeCircle
};

/**
 * Returns the maximum or minimum points of a compare value from an array of objects.
 * @param {Array} points Array of objects
 * @param {string} compareValue Key in the object on which the comparing will be done.
 * @param {string} minOrMax minimum or maximum.
 * @return {Object} Minimum or maximum point.
 */
const getExtremePoint = (points, compareValue, minOrMax) => {
    let extremePoint;
    let point;
    const len = points.length;
    let minOrMaxVal = minOrMax === 'max' ? -Infinity : Infinity;
    let val;

    for (let i = 0; i < len; i++) {
        point = points[i];
        val = point[compareValue];
        if (minOrMax === 'min' ? val < minOrMaxVal : val > minOrMaxVal) {
            minOrMaxVal = val;
            extremePoint = point;
        }
    }

    return extremePoint;
};

/**
 * Returns the minimum point of a compare value from an array of objects.
 * @param {Array} points Array of objects
 * @param {string} compareValue Key in the object on which the comparing will be done.
 * @return {Object} Minimum point.
 */
const getMinPoint = (points, compareValue) => getExtremePoint(points, compareValue, 'min');

/**
 * Returns the maximum point of a compare value from an array of objects.
 * @param {Array} points Array of objects
 * @param {string} compareValue Key in the object on which the comparing will be done.
 * @return {Object} Maximum point.
 */
const getMaxPoint = (points, compareValue) => getExtremePoint(points, compareValue, 'max');

/**
 * Gets the index of the closest value of the given value from the array.
 * @param {Array} arr Array of values
 * @param {number} value Value from which the nearest value will be calculated.
 * @param {string} side side property.
 * @return {number} index of the closest value
 */
/* istanbul ignore next */const getClosestIndexOf = (arr, value, side) => {
    let low = 0;
    const arrLen = arr.length;
    let high = arrLen - 1;

    let mid;
    let d1;
    let d2;

    while (low < high) {
        mid = Math.floor((low + high) / 2);
        d1 = Math.abs(arr[mid] - value);
        d2 = Math.abs(arr[mid + 1] - value);

        if (d2 <= d1) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    if (!side) {
        return high;
    }

    const highVal = arr[high];
    if (highVal === value) {
        return high;
    } else if (highVal > value) {
        if (high === 0) { return high; }
        return side === 'left' ? high - 1 : high;
    }
    if (high === arr.length - 1) { return high; }
    return side === 'left' ? high : high + 1;
};

const getNearestValue = (data, key) => {
    const filterData = data.filter(d => typeof d === 'number');
    return filterData[getClosestIndexOf(filterData, key)];
};

/**
 * Returns the browser window object
 * @return {Window} Window object
*/
const getWindow = () => window;

/**
 * Returns the browser window object
 * @return {Window} Window object
*/
const reqAnimFrame = (() => requestAnimationFrame)();

const cancelAnimFrame = (() => cancelAnimationFrame)();

/**
 * Capitalizes the first letter of the word
 * @param {string} text word
 * @return {string} Capitalized word
 */
const capitalizeFirst = (text) => {
    text = text.toLowerCase();

    return text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
};

/**
 *
 *
 * @param {*} arr
 */
const unique = (arr, fn = d => d) => {
    const vals = arr.reduce((acc, v) => {
        acc[fn(v)] = v;
        return acc;
    }, {});
    return Object.values(vals);
};

/**
 * Gets the minimum difference between two consecutive numbers  in an array.
 * @param {Array} arr Array of numbers
 * @param {number} index index of the value
 * @return {number} minimum difference between values
 */
/* istanbul ignore next */ const getMinDiff = (arr, index) => {
    let diff;
    let uniqueVals;
    if (index !== undefined) {
        uniqueVals = unique(arr.map(d => d[index]));
    } else {
        uniqueVals = unique(arr);
    }
    if (uniqueVals.length > 1) {
        diff = Math.abs(uniqueVals[1] - uniqueVals[0]);
        for (let i = 2, len = uniqueVals.length; i < len; i++) {
            diff = Math.min(diff, Math.abs(uniqueVals[i] - uniqueVals[i - 1]));
        }
    } else {
        diff = uniqueVals[0];
    }

    return diff;
};

/**
 * Returns the class name appended with a given id.
 * @param {string} cls class name
 * @param {string} id unique identifier
 * @param {string} prefix string needed to add before the classname
 * @return {string} qualified class name
 */
/* istanbul ignore next */const getQualifiedClassName = (cls, id, prefix) => {
    cls = cls.replace(/^\.*/, '');
    return [`${prefix}-${cls}`, `${prefix}-${cls}-${id}`];
};

/**
 * This method is used to set the default value for variables
 * without sullying the code with conditional statements.
 *
 * @export
 * @param {any} param The parameter to test.
 * @param {any} value The default value to assign.
 * @return {any} The value.
 */
/* istanbul ignore next */ const defaultValue = (param, value) => {
    if (typeof param === 'undefined' || (typeof param === 'object' && !param)) {
        return value;
    }
    return param;
};

/**
 * DESCRIPTION TODO
 *
 * @export
 * @param {Object} graph graph whose dependency order has to be generated
 * @return {Object}
 */
const getDependencyOrder = (graph) => {
    const dependencyOrder = [];
    const visited = {};
    const keys = Object.keys(graph);
    /**
     * DESCRIPTION TODO
     *
     * @export
     * @param {Object} name
     * @return {Object}
     */
    const visit = (name) => {
        if (dependencyOrder.length === keys.length) {
            return true;
        }
        visited[name] = true;
        const edges = graph[name];
        for (let e = 0; e < edges.length; e++) {
            const dep = edges[e];
            if (!visited[dep]) {
                visit(dep);
            }
        }

        dependencyOrder.push(name);
        return false;
    };

    for (let i = 0; i < keys.length; i++) {
        if (visit(keys[i], i)) break;
    }

    return dependencyOrder;
};

/**
 * Iterates over the properties of an object and applies the function
 *
 * @param {any} obj object to be iterated upon
 * @param {any} fn  function to be applied on it
 */
const objectIterator = (obj, fn) => {
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            fn(key, obj);
        }
    }
};

/**
 * This class creates a d3 voronoi for retrieving the nearest neighbour of any point from a set of two
 * dimensional points
 * @class Voronoi
 */
/* istanbul ignore next */ class Voronoi {
    /**
     * Initialize the voronoi with the data given.
     * @param {Array.<Object>} data Array of points.
     */
    constructor (data = []) {
        this._voronoi = voronoi().x(d => d.x).y(d => d.y);
        this.data(data);
    }

    /**
     * Sets the data to voronoi
     * @param {Array.<Object>} data Array of objects.
     * @return {Voronoi} Instance of voronoi.
     */
    data (data) {
        if (data) {
            this._voronoiFn = this._voronoi(data);
        }
        return this;
    }

    /**
     * Finds the closest point to the x and y position given.
     * @param {number} x x value
     * @param {number} y y value
     * @param {number} radius search radius.
     * @return {Object} Details of the nearest point.
     */
    find (x, y, radius) {
        return this._voronoiFn.find(x, y, radius);
    }
}

const getObjProp = (obj, ...fields) => {
    if (obj === undefined || obj === null) {
        return obj;
    }
    let retObj = obj;
    for (let i = 0, len = fields.length; i < len; i++) {
        retObj = retObj[fields[i]];
        if (retObj === undefined || retObj === null) {
            break;
        }
    }
    return retObj;
};

/**
 * Sanitize an input number / string mixed number. Currently dot in the no is not supported.
 *
 * @param {number | string} val pure number or string mixed number
 * @return {number | null}  Number if it can be extracted. Otherwise null
 */
const intSanitizer = (val) => {
    const arr = val.toString().match(/(\d+)(px)*/g);
    if (!arr) {
        // If only characters are passed
        return null;
    }

    return parseInt(arr[0], 10);
};

const generateGetterSetters = (context, props) => {
    Object.entries(props).forEach((propInfo) => {
        const prop = propInfo[0];
        const { sanitization, preset, onset, typeChecker, defaultValue: defVal } = propInfo[1];
        const prototype = context.constructor.prototype;
        if (!(Object.hasOwnProperty.call(prototype, prop))) {
            if (defVal) {
                context[`_${prop}`] = defVal;
            }
            context[prop] = (...params) => {
                if (params.length) {
                    let value = params[0];
                    if (sanitization) {
                        value = sanitization(context, params[0], context[`_${prop}`]);
                    }
                    if (preset) {
                        preset(context, value);
                    }
                    if (typeChecker && !typeChecker(value)) {
                        return context[`_${prop}`];
                    }
                    context[`_${prop}`] = value;
                    if (onset) {
                        onset(context, value);
                    }
                    return context;
                } return context[`_${prop}`];
            };
        }
    });
};

/**
 *
 *
 * @param {*} arr
 * @param {*} prop
 */
const getArraySum = (arr, prop) => arr.reduce((total, elem) => {
    total += prop ? elem[prop] : elem;
    return total;
}, 0);

/**
 *
 *
 * @param {*} arr1
 * @param {*} arr2
 *
 */
const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) { return false; }
    for (let i = arr1.length; i >= 0; i--) {
        if (arr1[i] !== arr2[i]) { return false; }
    }

    return true;
};

/* eslint valid-typeof:0 */
/**
 * Returns a validation function which can be used to validate variables against a type and value
 *
 * @param {any} type type of value that the object should have
 * @return {Object} validation function
 */
const isEqual = type => (oldVal, newVal) => {
    if (type === 'Array') {
        if (!oldVal) {
            return false;
        }
        return arraysEqual(oldVal, newVal);
    } else if (type === 'Object') {
        return Object.is(oldVal, newVal);
    } return oldVal === newVal;
};

/**
 * Description @todo
 *
 * @param {any} transactionModel @todo
 * @param {any} transactionEndpoint @todo
 * @param {any} transactionItems @todo
 * @return {any} @todo
 */
const enableChainedTransaction = (transactionModel, transactionEndpoint, transactionItems) =>
    transactionItems.forEach(item => transactionModel
        .registerImmediateListener(item, ([, newVal]) => transactionEndpoint[item](newVal)));

/**
 * Chceks if the element is istanceof HTMLElement
 *
 * @param {Object} elem any JS Object
 */
const isHTMLElem = elem => elem instanceof HTMLElement;

const ERROR_MSG = {
    INTERFACE_IMPL: 'Method not implemented'
};

/**
 * Merges the sink object in the source by recursively iterating through the object properties
 * @param {Object} source Source Object
 * @param {Object} sink Sink Object
 * @return {Object} Merged object
 */
const mergeRecursive = (source, sink) => {
    for (const prop in sink) {
        if (isSimpleObject(source[prop]) && isSimpleObject(sink[prop])) {
            mergeRecursive(source[prop], sink[prop]);
        } else if (sink[prop] instanceof Object && sink[prop].constructor === Object) {
            source[prop] = {};
            mergeRecursive(source[prop], sink[prop]);
        } else {
            source[prop] = sink[prop];
        }
    }
    return source;
};

/**
 * Creates a selection set from a data set with corresponding attributes
 *
 * @export
 * @param {Selection} sel contains previous selection
 * @param {Object} appendObj Object to be appended
 * @param {Array} data Data based on which the selection is entered/updated/removed
 * @param {Object} [attrs={}] Attributes to be set on the data
 * @return {Selection} Merged selection
 */
const createSelection = (sel, appendObj, data, idFn) => {
    let selection = sel || dataSelect(idFn);

    selection = selection.data(data);

    const enter = selection.enter().append(appendObj);
    const mergedSelection = enter.merge(selection);

    const exitSelection = selection.exit();
    exitSelection.getObjects().forEach(inst => inst.remove());
    exitSelection.remove();
    return mergedSelection;
};

const interpolateArray = (data, fitCount) => {
    const linearInterpolate = function (before, after, atPoint) {
        return before + (after - before) * atPoint;
    };
    const newData = [];
    const springFactor = ((data.length - 1) / (fitCount - 1));
    newData[0] = data[0]; // for new allocation
    for (let i = 1; i < fitCount - 1; i++) {
        const tmp = i * springFactor;
        const before = (Math.floor(tmp)).toFixed();
        const after = (Math.ceil(tmp)).toFixed();
        const atPoint = tmp - before;
        newData[i] = linearInterpolate(data[before], data[after], atPoint);
    }
    newData[fitCount - 1] = data[data.length - 1]; // for new allocation
    return newData;
};

/**
 *
 *
 * @param {*} fn
 */
const nextFrame = (fn) => {
    setTimeout(() => {
        fn();
    }, 0);
};

/**
 *
 *
 * @param {*} angle
 */
const angleToRadian = angle => angle * Math.PI / 180;

/**
 *
 *
 * @param {*} newName
 * @param {*} oldName
 */
const replaceCSSPrefix = () => {
    // @todo
};

/**
 * Gets the  interpolator function from d3 color
 *
 */
const interpolator = () => interpolate;

/**
 * Gets the number interpolator from d3 color
 *
 */
const numberInterpolator = () => interpolateNumber;

/**
 * Gets the rgb interpolator from d3 color
 *
 */
const colorInterpolator = () => interpolateRgb;

/**
 * Gets the hsl interpolator from d3 color
 *
 */
const hslInterpolator = () => interpolateHslLong;

const transformColors = () => ({
    color,
    rgb,
    hsl
});

/**
 * Gets the piecewise interpolator from d3 color
 *
 */
const piecewiseInterpolator = () => piecewise;

function hue2rgb (p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
const hslToRgb = (h, s, l, a = 1) => {
    let r;
    let g;
    let b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255, a];
};

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
const rgbToHsv = (r, g, b, a = 1) => {
    r = +r; g = +g; b = +b; a = +a;
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
        }
        h /= 6;
    }
    return [h, s, l, a];
};

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
const hsvToRgb = (h, s, v, a = 1) => {
    let r;
    let g;
    let b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: break;
    }

    return [r * 255, g * 255, b * 255, a];
};

const hexToHsv = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? rgbToHsv(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : '';
};

const RGBAtoRGB = (r, g, b, a, r2 = 255, g2 = 255, b2 = 255) => {
    const r3 = Math.round(((1 - a) * r2) + (a * r));
    const g3 = Math.round(((1 - a) * g2) + (a * g));
    const b3 = Math.round(((1 - a) * b2) + (a * b));
    return `rgb(${r3},${g3},${b3})`;
};

const hslaToRgb = (h, s, l, a) => {
    const [r, g, b, a1] = hslToRgb(h, s, l, a);
    return RGBAtoRGB(r, g, b, a1);
};

const detectColor = (col) => {
    const matchRgb = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
    const matchHsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g;

    // Source :  https://gist.github.com/sethlopezme/d072b945969a3cc2cc11
    // eslint-disable-next-line
    const matchRgba = /rgba?\(((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*?){2}(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,?\s*([01]\.?\d*?)?\)/;
    // eslint-disable-next-line
    const matchHsla = /^hsla\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/;
    const matchHex = /^#([0-9a-f]{3}){1,2}$/i;

    if (matchRgb.test(col) || matchRgba.test(col)) {
        return 'rgb';
    } else if (matchHsl.test(col) || matchHsla.test(col)) {
        return 'hsl';
    } else if (matchHex.test(col)) {
        return 'hex';
    } return col;
};

function RGBAToHexA (rgba) {
    const sep = rgba.indexOf(',') > -1 ? ',' : ' ';
    rgba = rgba.substr(5).split(')')[0].split(sep);

  // Strip the slash if using space-separated syntax
    if (rgba.indexOf('/') > -1) { rgba.splice(3, 1); }

    for (const R in rgba) {
        const r = rgba[R];
        if (r.indexOf('%') > -1) {
            const p = r.substr(0, r.length - 1) / 100;

            if (R < 3) {
                rgba[R] = Math.round(p * 255);
            } else {
                rgba[R] = p;
            }
        }
    }

    let r = (+rgba[0]).toString(16);
    let g = (+rgba[1]).toString(16);
    let b = (+rgba[2]).toString(16);
    let a = Math.round(+rgba[3] * 255).toString(16);

    if (r.length === 1) { r = `0${r}`; }
    if (g.length === 1) { g = `0${g}`; }
    if (b.length === 1) { b = `0${b}`; }
    if (a.length === 1) { a = `0${a}`; }

    return `#${r}${g}${b}${a}`;
}

const transformToHex = (datumStyle, colorType) => {
    if (colorType === 'rgb') {
        const [r, g, b, a] = datumStyle.replace(/[^\d,]/g, '').split(',');
        const aa = a || 1;

        const rgbaString = `rgba(${r}, ${g}, ${b}, ${aa})`;
        return RGBAToHexA(rgbaString);
    }
    // Add methods to handle hsl and hex conversion
    return null;
};

const assembleModelFromIdentifiers = (model, identifiers) => {
    let schema = [];
    let data;
    const fieldMap = model.getFieldsConfig();
    if (identifiers.length) {
        const fields = identifiers[0];
        const len = fields.length;
        for (let i = 0; i < len; i++) {
            const field = fields[i];
            const fieldObj = fieldMap[field] && Object.assign({}, fieldMap[field].def);
            if (fieldObj) {
                schema.push(Object.assign(fieldObj));
            }
        }

        data = [];
        const header = identifiers[0];
        for (let i = 1; i < identifiers.length; i += 1) {
            const vals = identifiers[i];
            const temp = {};
            vals.forEach((fieldVal, cIdx) => {
                temp[header[cIdx]] = fieldVal;
            });
            data.push(temp);
        }
    } else {
        data = [];
        schema = [];
    }

    return new model.constructor(data, schema);
};

/**
 *
 *
 * @param {*} dataModel
 * @param {*} criteria
 *
 */
const getDataModelFromRange = (dataModel, criteria, mode, criteriaFields) => {
    if (criteria === null) return null;
    const fieldsConfig = dataModel.getFieldsConfig();
    const selFields = criteriaFields || Object.keys(criteria).filter(d => d in fieldsConfig);
    const selFn = fields => selFields.every((field) => {
        const fieldValue = fields[field].internalValue;
        const range = criteria[field][0] instanceof Array ? criteria[field][0] : criteria[field];

        if (typeof range[0] === STRING) {
            return range.find(d => d === fieldValue) !== undefined;
        }

        if (range) {
            // Check if the selected bar value lies insid e the selection box
            return fieldValue >= range[0] && fieldValue <= range[1];
        }

        return false;
    });

    return dataModel.select(selFn, {
        saveChild: false,
        mode
    });
};

const getArrayIndexMap = arr => arr.reduce((acc, value, i) => {
    acc[value] = i;
    return acc;
}, {});
/**
 *
 *
 * @param {*} dataModel
 * @param {*} identifiers
 *
 */
const getDataModelFromIdentifiers = (dataModel, identifiers, mode, hasBarLayer) => {
    let filteredDataModel;
    if (identifiers instanceof Array) {
        const fieldsConfig = dataModel.getFieldsConfig();

        const dataArr = identifiers.slice(1, identifiers.length);
        if (identifiers instanceof Function) {
            filteredDataModel = identifiers(dataModel, {}, false);
        } else if (identifiers instanceof Array && identifiers[0].length) {
            const filteredSchema = identifiers[0].filter(d => d in fieldsConfig || d === ReservedFields.ROW_ID);
            filteredDataModel = dataModel.select((fields, rowId) => {
                let include = true;
                filteredSchema.forEach((propField, idx) => {
                    const value = propField === ReservedFields.ROW_ID ? rowId : fields[propField].internalValue;
                    const index = dataArr.findIndex(d => d[idx] === value);
                    include = include && index !== -1;
                });
                return include;
            }, {
                saveChild: false,
                mode
            });
        } else {
            filteredDataModel = dataModel.select(() => false, {
                saveChild: false,
                mode
            });
        }
    } else {
        filteredDataModel = getDataModelFromRange(dataModel, identifiers, mode, hasBarLayer);
    }
    return filteredDataModel;
};

/**
 *
 *
 * @param {*} context
 * @param {*} listenerMap
 */
const registerListeners = (context, listenerMap, ...params) => {
    const propListenerMap = listenerMap(context, ...params);
    for (const key in propListenerMap) {
        if ({}.hasOwnProperty.call(propListenerMap, key)) {
            const { namespace } = params[1];
            let ns = null;
            if (namespace) {
                ns = namespace;
            }
            const mapObj = propListenerMap[key];
            const propType = mapObj.type;
            const props = mapObj.props;
            const listenerFn = mapObj.listener;
            context.store()[propType](props, listenerFn, false, {
                namespace: ns
            });
        }
    }
};

const isValidValue = value => !isNaN(value) && value !== -Infinity && value !== Infinity;
/**
 *
 *
 * @param {*} str
 *
 */
const escapeHTML = (str) => {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    const htmlEscaper = /[&<>"'/]/g;
    return (`${str}`).replace(htmlEscaper, match => htmlEscapes[match]);
};

/**
 *
 *
 * @param {*} arr
 */
const transposeArray = arr => arr[0].map((col, i) => arr.map(row => row[i]));
const toArray = arr => (arr instanceof Array ? arr : [arr]);
const extendsClass = (cls, extendsFrom, found) => {
    if (!cls) {
        return false;
    }
    const prototype = cls.prototype;
    if (prototype instanceof extendsFrom) {
        found = true;
    } else {
        found = extendsClass(prototype, extendsFrom, found);
    }
    return found;
};

/**
 *
 * @param {*} dm1
 * @param {*} dm2
 */
const concatModels = (dm1, dm2) => {
    const dataObj1 = dm1.getData();
    const dataObj2 = dm2.getData();
    const data1 = dataObj1.data;
    const data2 = dataObj2.data;
    const schema1 = dataObj1.schema;
    const schema2 = dataObj2.schema;
    const tuples1 = {};
    const tuples2 = {};
    const commonTuples = {};
    for (let i = 0; i < data1.length; i++) {
        for (let ii = 0; ii < data2.length; ii++) {
            const row1 = data1[i];
            const row2 = data2[ii];
            const dim1Values = row1.filter((d, idx) => schema1[idx].type === FieldType.DIMENSION);
            const dim2Values = row2.filter((d, idx) => schema2[idx].type === FieldType.DIMENSION);
            const allDimSame = dim1Values.every(value => dim2Values.indexOf(value) !== -1);
            if (allDimSame) {
                const key = dim1Values.join();
                !commonTuples[key] && (commonTuples[key] = {});
                row1.forEach((value, idx) => {
                    commonTuples[key][schema1[idx].name] = value;
                });
                row2.forEach((value, idx) => {
                    commonTuples[key][schema2[idx].name] = value;
                });
            } else {
                const dm1Key = dim1Values.join();
                const dm2Key = dim2Values.join();
                if (!commonTuples[dm1Key]) {
                    !commonTuples[dm1Key] && (commonTuples[dm1Key] = {});
                    row1.forEach((value, idx) => {
                        commonTuples[dm1Key][schema1[idx].name] = value;
                    });
                }
                if (!commonTuples[dm2Key]) {
                    !commonTuples[dm2Key] && (commonTuples[dm2Key] = {});
                    row2.forEach((value, idx) => {
                        commonTuples[dm2Key][schema2[idx].name] = value;
                    });
                }
            }
        }
    }

    const commonSchema = [...schema1, ...schema2.filter(s2 => schema1.findIndex(s1 => s1.name === s2.name) === -1)];
    const data = [...Object.values(tuples1), ...Object.values(tuples2), ...Object.values(commonTuples)];
    return [data, commonSchema];
};

const getSymbol = type => symbol().type(symbolFns[type]);

const stackOrders = {
    [STACK_CONFIG.ORDER_NONE]: stackOrderNone,
    [STACK_CONFIG.ORDER_ASCENDING]: stackOrderAscending,
    [STACK_CONFIG.ORDER_DESCENDING]: stackOrderDescending
};
const stackOffsets = {
    [STACK_CONFIG.OFFSET_DIVERGING]: stackOffsetDiverging,
    [STACK_CONFIG.OFFSET_NONE]: stackOffsetNone,
    [STACK_CONFIG.OFFSET_EXPAND]: stackOffsetExpand,
    [STACK_CONFIG.OFFSET_WIGGLE]: stackOffsetWiggle
};

// eslint-disable-next-line require-jsdoc
const stack = params => d3Stack().keys(params.keys).offset(stackOffsets[params.offset])
    .order(stackOrders[params.order])(params.data);

/**
 * Groups the data into a hierarchical tree structure based on one or more fields.
 * @param { Object } params Configuration properties for nesting data
 * @param { Array.<Array> } params.data Data which needs to be grouped
 * @param { Array.<number> } params.keys Field indices by which the data will be grouped
 * @return { Array.<Object> } Grouped data array
 */
const nestCollection = (params) => {
    const nestFn = nest();
    params.keys.forEach(key => nestFn.key(d => d[key]));
    return nestFn.entries(params.data);
};

/**
 * Returns array difference, elements in array A, not in Array B
 * @param { Array.<number> } arr Data which needs to be grouped
 * @param { Array.<number> } arr1 Field indices by which the data will be grouped
 * @return { Array.<number> } Returns the array difference (A - B)
 */
const getArrayDiff = (arr, arr1) => arr.filter(el => arr1.indexOf(el) < 0);

const pathInterpolators = {
    curveLinear,
    curveStepAfter,
    curveStepBefore,
    curveStep,
    curveCatmullRom,
    stepAfter: curveStepAfter,
    catmullRom: curveCatmullRom,
    step: curveStep,
    stepBefore: curveStepBefore,
    linear: curveLinear
};

const Symbols = {
    axisLeft,
    axisRight,
    axisTop,
    axisBottom,
    line,
    area,
    pie,
    arc,
    nest
};

const Scales = {
    band: scaleBand
};

const getSmallestDiff = (points) => {
    points = points.sort((a, b) => a - b);
    let minDiff = points[1] - points[0];
    for (let i = 2; i < points.length; i++) {
        minDiff = Math.min(minDiff, points[i] - points[i - 1]);
    }

    return minDiff;
};

const timeFormats = {
    millisecond: '%A, %b %e, %H:%M:%S.%L',
    second: '%A, %b %e, %H:%M:%S',
    minute: '%A, %b %e, %H:%M',
    hour: '%A, %b %e, %H:%M',
    day: '%A, %b %e, %Y',
    month: '%B %Y',
    year: '%Y'
};

const timeDurations = [
    ['millisecond', 'second', 'minute', 'hour', 'day', 'month', 'year'],
    [1, 1000, 60000, 3600000, 86400000, 2592000000, 31536000000]
];

const getNearestInterval = (interval) => {
    const index = getClosestIndexOf(timeDurations[1], interval);
    return timeDurations[0][index];
};

const formatTemporal = (value, interval) => {
    const nearestInterval = getNearestInterval(interval);
    return DateTimeFormatter.formatAs(value, timeFormats[nearestInterval]);
};

const temporalFields = (dataModel) => {
    const filteredFields = {};
    Object.entries(dataModel.getFieldspace().getDimension()).forEach(([fieldName, fieldObj]) => {
        if (fieldObj.subtype() === TEMPORAL) {
            filteredFields[fieldName] = fieldObj;
        }
    });
    return filteredFields;
};

const require = (lookupWhat, lookupDetails) => ({
    resolvable: (store) => {
        const lookupTarget = store[lookupWhat];
        const depArr = lookupDetails.slice(0, lookupDetails.length - 1);
        const fn = lookupDetails[lookupDetails.length - 1]; // fn

        const deps = depArr.map(str => lookupTarget[str]);
        return {
            fn: fn(...deps),
            depArr
        };
    }
});

const nextAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        setTimeout(callback, 16);
    };

const getValueParser = config => (val) => {
    if (InvalidAwareTypes.getInvalidType(val)) {
        return val in config ? config[val] : `${val}`;
    }
    return val;
};

const retrieveNearestGroupByReducers = (dataModel, ...measureFieldNames) => {
    const filteredReducers = {};
    if (dataModel instanceof DataModel) {
        const derivations = [...dataModel.getDerivations().reverse(), ...dataModel.getAncestorDerivations().reverse()];
        const nearestReducers = defaultValue(
            getObjProp(derivations.find(derv => derv.op === DM_DERIVATIVES.GROUPBY), 'criteria'), {});

        const measures = dataModel.getFieldspace().getMeasure();
        measureFieldNames = measureFieldNames.length ? measureFieldNames : Object.keys(measures);
        measureFieldNames.forEach((measureName) => {
            if (nearestReducers[measureName]) {
                filteredReducers[measureName] = nearestReducers[measureName];
            } else {
                const measureField = measures[measureName];
                if (measureField) {
                    filteredReducers[measureName] = measureField.defAggFn();
                }
            }
        });
    }
    return filteredReducers;
};

const retrieveFieldDisplayName = (dm, fieldName) => dm.getFieldspace().fieldsObj()[fieldName].displayName();
/**
 * Fetches the nearest sort operation details by traversing the chain of parent DataModels
 * @param {Object} dataModel Instance of DataModel
 *
 * @return {Array|null} sort criteria, null if no sort operation found
 */
const nearestSortingDetails = (dataModel) => {
    const allDerivations = [...dataModel.getAncestorDerivations(), ...dataModel.getDerivations()];
    const nearestSortDerivation = allDerivations.reverse().find(derivation => derivation.op === DM_DERIVATIVES.SORT);

    return nearestSortDerivation ? nearestSortDerivation.criteria : null;
};

const sortingOrder = (a, b) => {
    const sortOrder = !(a instanceof InvalidAwareTypes || b instanceof InvalidAwareTypes)
    ? a.localeCompare(b)
    : 1;
    return sortOrder;
};

/**
 * Map containing key, value sortingOrder pairs
 */
const sortOrderMap = {
    [SORT_ORDER_ASCENDING]: (firstVal, secondVal) => sortingOrder(firstVal, secondVal),
    [SORT_ORDER_DESCENDING]: (firstVal, secondVal) => sortingOrder(secondVal, firstVal)
};

/**
 * Sort categorical field based on it's sorting order
 * @param {string} sortOrder Order by which field is to be sorted (asc or desc or func)
 * @param {string} firstVal First sort parameter
 * @param {string} secondVal Second sort parameter
 * @return {number} position|null if sort order is invalid
*/
const sortCategoricalField = (sortOrder, firstVal, secondVal) => {
    const sortOrderType = typeof sortOrder;

    if (sortOrderType === FUNCTION) {
        return sortOrder(firstVal, secondVal);
    } else if (sortOrderType === STRING) {
        if (!sortOrderMap[sortOrder]) return null;
        return sortOrderMap[sortOrder](firstVal, secondVal);
    }
    return null;
};

const intersect = (arr1, arr2, accessors = [v => v, v => v]) => {
    const [fn1, fn2] = accessors;
    const set = new Set(arr2.map(v => fn2(v)));
    return arr1.filter(value => set.has(fn1(value)));
};

const difference = (arr1, arr2, accessors = [v => v, v => v]) => {
    const [fn1, fn2] = accessors;
    const set = new Set(arr2.map(v => fn2(v)));
    return arr1.filter(value => !set.has(fn1(value)));
};

const partition = (array, filterFn) => array.reduce((acc, v, i) => {
    const pass = filterFn(v, i, array);

    pass ? acc[0].push(v) : acc[1].push(v);
    return acc;
}, [[], []]);

const mix = superclass => ({
    with: (...mixins) => mixins.reduce((cls, mixin) => mixin(cls), superclass)
});

const componentRegistry = (comps) => {
    const reg = Object.assign({}, comps);
    const regObj = {
        register: (def, customKey) => {
            const key = customKey || def.formalName();

            reg[key] = def;
            return regObj;
        },
        get: () => reg
    };

    return regObj;
};

const getReadableTicks = (domain, steps) => {
    // scaling the axis based on steps provided
    const orderedDomain = [Math.min(...domain), Math.max(...domain)];
    if (steps < 3) {
        return orderedDomain;
    }

    const tempScale = scales.scaleQuantize().domain(orderedDomain).nice();
    let tempAxis = null;
    let legendTicks = null;

    tempAxis = Symbols.axisBottom().scale(tempScale);

    legendTicks = tempAxis.scale().ticks(steps);

    if (Math.max(...legendTicks) < orderedDomain[1]) {
        // legendTicks.pop();
        legendTicks.push(orderedDomain[1]);
    }
    if (Math.min(...legendTicks) > orderedDomain[0]) {
        // legendTicks.shift();
        legendTicks.unshift(orderedDomain[0]);
    }
    return legendTicks;
};

const RGBAToHSLA = (r, g, b, a = 1) => {
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    // Calculate hue
    // No difference
    if (delta === 0) {
        h = 0;
    } else if (cmax === r) {
        // Red is max
        h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
        // Green is max
        h = (b - r) / delta + 2;
    } else {
        // Blue is max
        h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0) { h += 360; }
    // Calculate lightness
    l = (cmax + cmin) / 2;
    // Calculate saturation
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return {
        color: `hsla(${h},${s}%,${l}%,${a})`,
        code: [h, s, l, a]
    };
};

const transformColor = (rgbaValues, { h = 0, s = 0, l = 0, a }, datum, apply) => {
    const [origH, origS, origL, origA] = RGBAToHSLA(...rgbaValues).code;
    const sanitizedA = parseFloat(a || origA, 10);
    const newH = origH + h;
    const newS = origS + s;
    const newL = origL + l;
    let newA = sanitizedA + 1;

    if (!apply) {
        newA = sanitizedA - 1;
    }

    const finalcolor = {
        color: `hsla(${newH},${newS}%,${newL}%,${newA})`,
        hsla: [newH, newS, newL, newA]
    };
    return finalcolor;
};

const pointWithinCircle = (c, point) => {
    const { x: cx, y: cy, r } = c;
    const { x, y } = point;

    const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2);
    return dist <= r;
};

/**
 * Generates a function which performs an intersection (dataModel select)
 * operation for multiple fields
 * @param {Array} targetData - Nested array with field and values in the format:
 * [
 *  [field1, field2]
 *  [val1, val2]
 * ]
 * @param {Object} dm - The dataModel instance
 * @return {Function} filter function
 */
const dmMultipleSelection = (targetData, dm) => {
    const targetFields = targetData[0];
    const targetVals = targetData.slice(1, targetData.length);
    const payloadMap = targetVals.reduce((acc, v) => {
        acc[v] = v;
        return acc;
    }, {});
    const measures = Object.keys(dm.getFieldspace().getMeasure());

    const filterFn = (fields, i) => {
        const row = `${targetFields.map((field) => {
            let val;
            if (field === ReservedFields.MEASURE_NAMES) {
                val = measures;
            } else if (field === ReservedFields.ROW_ID) {
                val = i;
            } else {
                const currentField = fields[field];
                const isFieldInvalid = currentField instanceof InvalidAwareTypes;

                val = isFieldInvalid ? currentField.value() : (currentField || {}).internalValue;
            }
            return val;
        })}`;
        return row in payloadMap;
    };
    return filterFn;
};

const getIndexMap = (arr, prop) => arr.reduce((acc, v, i) => {
    const key = prop ? v[prop] : v;
    acc[key] = i;
    return acc;
}, {});

export {
    getIndexMap,
    arraysEqual,
    componentRegistry,
    mix,
    partition,
    getArrayIndexMap,
    getValueParser,
    require,
    intersect,
    difference,
    Scales,
    Symbols,
    pathInterpolators,
    stack,
    nestCollection,
    getArrayDiff,
    getSymbol,
    transformColor,
    transformColors,
    detectColor,
    hexToHsv,
    hslToRgb,
    rgbToHsv,
    transformToHex,
    hsvToRgb,
    hslaToRgb,
    concatModels,
    toArray,
    angleToRadian,
    escapeHTML,
    generateGetterSetters,
    getArraySum,
    interpolator,
    piecewiseInterpolator,
    getDataModelFromIdentifiers,
    getDataModelFromRange,
    colorInterpolator,
    numberInterpolator,
    ERROR_MSG,
    reqAnimFrame,
    nextAnimFrame,
    transposeArray,
    cancelAnimFrame,
    getMax,
    getMin,
    getDomainFromData,
    getUniqueId,
    mergeRecursive,
    unionDomain,
    symbolFns,
    easeFns,
    unique,
    clone,
    isEqual,
    interpolateArray,
    getMinPoint,
    defaultValue,
    getMaxPoint,
    getClosestIndexOf,
    Voronoi,
    checkExistence,
    sanitizeIP,
    getMinDiff,
    capitalizeFirst,
    getWindow,
    getQualifiedClassName,
    getDependencyOrder,
    objectIterator,
    intSanitizer,
    enableChainedTransaction,
    isHTMLElem,
    isSimpleObject,
    nextFrame,
    registerListeners,
    replaceCSSPrefix,
    getObjProp,
    extendsClass,
    assembleModelFromIdentifiers,
    isValidValue,
    hslInterpolator,
    getSmallestDiff,
    getNearestValue,
    retrieveNearestGroupByReducers,
    nearestSortingDetails,
    createSelection,
    formatTemporal,
    temporalFields,
    retrieveFieldDisplayName,
    sanitizeDomainWhenEqual,
    sortCategoricalField,
    getReadableTicks,
    dmMultipleSelection,
    pointWithinCircle
};
