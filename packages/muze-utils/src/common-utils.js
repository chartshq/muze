/* global window, requestAnimationFrame, cancelAnimationFrame */
import { FieldType, DimensionSubtype, DateTimeFormatter } from 'datamodel';
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
import Model from 'hyperdis';
import { dataSelect } from './DataSystem';
import * as STACK_CONFIG from './enums/stack-config';
import { DM_OPERATION_GROUP } from './enums';

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
const getMax = (data, field) => Math.max(...data.filter(d => !isNaN(d[field])).map(d => d[field]));

/**
 * Gets the minimum value from an array of objects for a given property name
 * @param  {Array.<Object>} data   Array of objects
 * @param  {string} field Field name
 * @return {number} Minimum value
 */
const getMin = (data, field) => Math.min(...data.filter(d => !isNaN(d[field])).map(d => d[field]));

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
    let domArr;
    data = data[0] instanceof Array ? data : [data];
    switch (fieldType) {
    case DimensionSubtype.CATEGORICAL:
        domain = [].concat(...data.map(arr => arr.map(d => d[fields[0]]).filter(d => d !== undefined)));
        break;
    default:
        domArr = data.map((arr) => {
            const firstMin = getMin(arr, fields[0]);
            const secondMin = getMin(arr, fields[1]);
            const firstMax = getMax(arr, fields[0]);
            const secondMax = getMax(arr, fields[1]);
            return [Math.min(firstMin, secondMin), Math.max(firstMax, secondMax)];
        });
        domain = [Math.min(...domArr.map(d => d[0])), Math.max(...domArr.map(d => d[1]))];
        break;
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
    let domain;
    domains = domains.filter(dom => dom && dom.length);
    if (fieldType === DimensionSubtype.CATEGORICAL) {
        domain = domain = [].concat(...domains);
    } else {
        domain = [Math.min(...domains.map(d => d[0])), Math.max(...domains.map(d => d[1]))];
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
const unique = arr => ([...new Set(arr)]);

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
    constructor (data) {
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

const addListenerToNamespace = (namespaceInf, fn, context) => {
    let key = namespaceInf.key;
    const namespace = namespaceInf.namespace;
    if (namespace) {
        !context._listeners[namespace] && (context._listeners[namespace] = []);
        if (!key) {
            key = Object.keys(context._listeners[namespace]).length;
        }
        context._listeners[namespace][key] = fn;
    } else {
        key = Object.keys(context._listeners).length;
        context._listeners[key] = fn;
    }
};

/**
 *
 *
 * @param {*} obj
 * @param {*} fields
 *
 */
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
 * Methods to handle changes to table configuration and reactivity are handled by this
 * class.
 */
/**
 *  Common store class
 *
 * @class Store
 */
class Store {
    /**
     * Creates an instance of Store.
     * @param {Object} config The object to create the state store with.
     * @memberof Store
     */
    constructor (config) {
        // create reactive model
        this.model = Model.create(config);
        this._listeners = {};
    }

    /**
     * This method returns a plain JSON object
     * with all the fields in the state store.
     *
     * @return {Object} Serialized representation of state store.
     * @memberof Store
     */
    serialize () {
        return this.model.serialize();
    }

    /**
     * This method is used to update the value of a property in the state store.
     *
     * @param {string} propName The name of the property.
     * @param {number} value The new value of the property.
     * @memberof Store
     */
    commit (propName, value) {
        // check if appropriate enum has been used
        this.model.prop(propName, value);
    }

    /**
     * This method is used to register a callbacl that will execute
     * when one or more properties change.
     *
     * @param {string | Array} propNames name of property or array of props.
     * @param {Function} callBack The callback to execute.
     * @memberof Store
     */
    /* istanbul ignore next */registerChangeListener (propNames, callBack, instantCall, namespaceInf = {}) {
        let props = propNames;
        if (!Array.isArray(propNames)) {
            props = [propNames];
        }
        const fn = this.model.next(props, callBack, instantCall);
        addListenerToNamespace(namespaceInf, fn, this);
        return this;
    }
    /**
     * This method is used to register a callbacl that will execute
     * when one or more properties change.
     *
     * @param {string | Array} propNames name of property or array of props.
     * @param {Function} callBack The callback to execute.
     * @memberof Store
     */
    /* istanbul ignore next */ registerImmediateListener (propNames, callBack, instantCall, namespaceInf = {}) {
        let props = propNames;
        if (!Array.isArray(propNames)) {
            props = [propNames];
        }
        const fn = this.model.on(props, callBack, instantCall);
        addListenerToNamespace(namespaceInf, fn, this);
        return this;
    }
    /**
     * This method is used to get the name of the property
     * from the state store.
     *
     * @param {string} propName The name of the field in state store.
     * @return {any} The value of the field.
     * @memberof Store
     */
    get (propName) {
        return this.model.prop(propName);
    }

    /**
     * This method is used to register a computed property that is computed every time
     * the store value changes.
     *
     * @param {string} propName The name of the property to create.
     * @param {Function} callBack The function to execute when depemdent props change.
     * @memberof Store
     */
    computed (propName, callBack) {
        return this.model.calculatedProp(propName, callBack);
    }

    append (propName, value) {
        this.model.append(propName, value);
        return this;
    }

    unsubscribeAll () {
        Object.values(this._listeners).forEach(fn => fn());
        return this;
    }

    unsubscribe (namespaceInf = {}) {
        const { namespace, key } = namespaceInf;
        const listeners = this._listeners[namespace];
        if (key) {
            const fn = getObjProp(listeners, key);
            fn && fn();
        } else {
            Object.values(listeners).forEach(fn => fn());
            this._listeners[namespace] = [];
        }
        return this;
    }
}

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

/**
 * Setter getter creator from config
 * Format
 *  PROPERTRY_NAME: {
 *      value: // default value of the property,
 *      meta: {
 *          typeCheck: // The setter value will be checked using this. If the value is function then the setter value
 *                     // is passed as args. (Optional)
 *          typeExpected: // The output of typecheck action will be tested against this. Truthy value will set the
 *                       // value to the setter
 *          sanitizaiton: // Need for sanitization before type is checked
 *      }
 *  }
 *
 * @param {Object} holder an empty object on which the getters and setters will be mounted
 * @param {Object} options options config based on which the getters and setters are determined.
 * @param {Hyperdis} model optional model to attach the property. If not sent new moel is created.
 * @return {Array}
 */
const transactor = (holder, options, model, namespaceInf = {}) => {
    let conf;
    const store = model && model instanceof Model ? model : Model.create({});
    const stateProps = {};
    for (const prop in options) {
        if ({}.hasOwnProperty.call(options, prop)) {
            conf = options[prop];
            const addAsMethod = conf.meta ? conf.meta.addAsMethod : true;
            let nameSpaceProp;
            const namespace = namespaceInf.namespace;
            if (namespace) {
                nameSpaceProp = `${namespace}.${prop}`;
            } else {
                nameSpaceProp = prop;
            }
            if (!store.prop(`${nameSpaceProp}`)) {
                stateProps[prop] = conf.value;
            }
            if (addAsMethod !== false) {
                holder[prop] = ((context, meta, nsProp) => (...params) => {
                    let val;
                    let compareTo;
                    const paramsLen = params.length;
                    const prevVal = store.prop(nsProp);
                    if (paramsLen) {
                        // If parameters are passed then it's a setter
                        const spreadParams = meta && meta.spreadParams;
                        val = params;
                        const values = [];
                        if (meta) {
                            for (let i = 0; i < paramsLen; i++) {
                                val = params[i];
                                const sanitization = meta.sanitization && (spreadParams ? meta.sanitization[i] :
                                    meta.sanitization);
                                const typeCheck = meta.typeCheck && (spreadParams ? meta.typeCheck[i] : meta.typeCheck);
                                if (sanitization && typeof sanitization === 'function') {
                                    // Sanitize if required
                                    val = sanitization(val, prevVal, holder);
                                }

                                if (typeCheck) {
                                    // Checking if a setter is valid
                                    if (typeof typeCheck === 'function') {
                                        let typeExpected = meta.typeExpected;
                                        if (typeExpected && spreadParams) {
                                            typeExpected = typeExpected[i];
                                        }
                                        if (typeExpected) {
                                            compareTo = typeExpected;
                                        } else {
                                            compareTo = true;
                                        }

                                        if (typeCheck(val) === compareTo) {
                                            values.push(val);
                                        }
                                    } else if (typeof typeCheck === 'string') {
                                        if (typeCheck === 'constructor') {
                                            const typeExpected = spreadParams ? meta.typeExpected[i] :
                                                meta.typeExpected;
                                            if (val && (val.constructor.name === typeExpected)) {
                                                values.push(val);
                                            }
                                        }
                                    } else {
                                        // context.prop(key, val);
                                        values.push(val);
                                    }
                                } else {
                                    values.push(val);
                                }
                            }
                            const preset = meta.preset;
                            const oldValues = context.prop(nsProp);
                            preset && preset(values[0], holder);
                            if (spreadParams) {
                                oldValues.forEach((value, i) => {
                                    if (values[i] === undefined) {
                                        values[i] = value;
                                    }
                                });
                            }
                            values.length && context.prop(nsProp, spreadParams ? values : values[0]);
                        } else {
                            context.prop(nsProp, spreadParams ? val : val[0]);
                        }
                        return holder;
                    }
                // No parameters are passed hence its a getter
                    return context.prop(nsProp);
                })(store, conf.meta, nameSpaceProp);
            }
        }
    }

    if (namespaceInf.namespace === undefined) {
        store.append(stateProps);
    } else {
        const namespace = namespaceInf.namespace;
        store.append(namespace, stateProps);
    }

    return [holder, store];
};

/**
 *
 *
 * @param {*} context
 * @param {*} props
 */
const generateGetterSetters = (context, props) => {
    Object.entries(props).forEach((propInfo) => {
        const prop = propInfo[0];
        const typeChecker = propInfo[1].typeChecker;
        const defVal = propInfo[1].defaultValue;
        const sanitization = propInfo[1].sanitization;
        const prototype = context.constructor.prototype;
        if (!(Object.hasOwnProperty.call(prototype, prop))) {
            if (defVal) {
                context[`_${prop}`] = defVal;
            }
            context[prop] = (...params) => {
                if (params.length) {
                    let value = params[0];
                    if (sanitization) {
                        value = sanitization(context, params[0]);
                    }
                    if (typeChecker && !typeChecker(value)) {
                        return context[`_${prop}`];
                    }
                    context[`_${prop}`] = value;
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
    transactionItems.forEach(item => transactionModel.on(item, ([, newVal]) => transactionEndpoint[item](newVal)));

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
    let selection = sel || dataSelect([]);

    selection = selection.data(data, idFn);

    const enter = selection.enter().append(appendObj);
    const mergedSelection = enter.merge(selection);

    selection.exit() && selection.exit().remove();
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
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    const a = result[4] ? parseInt(result[4], 16) : 1;
    return rgbToHsv(r, g, b, a);
};

const detectColor = (col) => {
    const matchRgb = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
    const matchHsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g;

    // Source :  https://gist.github.com/sethlopezme/d072b945969a3cc2cc11
     // eslint-disable-next-line
    const matchRgba = /rgba?\(((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*?){2}(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,?\s*([01]\.?\d*?)?\)/;
     // eslint-disable-next-line
    const matchHsla = /^hsla\((0|360|35\d|3[0-4]\d|[12]\d\d|0?\d?\d),(0|100|\d{1,2})%,(0|100|\d{1,2})%,(0?\.\d|1(\.0)?)\)$/;
    const matchHex = /^#([0-9a-f]{3}){1,2}$/i;

    if (matchRgb.test(col) || matchRgba.test(col)) {
        return 'rgb';
    } else if (matchHsl.test(col) || matchHsla.test(col)) {
        return 'hsl';
    } else if (matchHex.test(col)) {
        return 'hex';
    } return col;
};

/**
 *
 *
 * @param {*} model
 * @param {*} propModel
 *
 */
const filterPropagationModel = (model, propModel, measures) => {
    const { data, schema } = propModel.getData();
    let filteredModel;
    if (schema.length) {
        const fieldMap = model.getFieldsConfig();
        filteredModel = model.select((fields) => {
            const include = data.some(row => schema.every((propField, idx) => {
                if (!measures && (!(propField.name in fieldMap) ||
                        fieldMap[propField.name].def.type === FieldType.MEASURE)) {
                    return true;
                }
                return row[idx] === fields[propField.name].valueOf();
            }));
            return include;
        }, {
            saveChild: false
        });
    } else {
        filteredModel = propModel;
    }

    return filteredModel;
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
const getDataModelFromRange = (dataModel, criteria, mode) => {
    if (criteria === null) {
        return null;
    }
    const selFields = Object.keys(criteria);
    const selFn = fields => selFields.every((field) => {
        const val = fields[field].value;
        const range = criteria[field][0] instanceof Array ? criteria[field][0] : criteria[field];
        if (typeof range[0] === 'string') {
            return range.find(d => d === val) !== undefined;
        }
        return range ? val >= range[0] && val <= range[1] : true;
    });

    return dataModel.select(selFn, {
        saveChild: false,
        mode
    });
};

/**
 *
 *
 * @param {*} dataModel
 * @param {*} identifiers
 *
 */
const getDataModelFromIdentifiers = (dataModel, identifiers, mode) => {
    let filteredDataModel;
    if (identifiers instanceof Array) {
        const fieldsConfig = dataModel.getFieldsConfig();

        const dataArr = identifiers.slice(1, identifiers.length);
        if (identifiers instanceof Function) {
            filteredDataModel = identifiers(dataModel, {}, false);
        } else if (identifiers instanceof Array && identifiers[0].length) {
            const filteredSchema = identifiers[0].filter(d => d in fieldsConfig);
            filteredDataModel = dataModel.select((fields) => {
                let include = true;
                filteredSchema.forEach((propField, idx) => {
                    const value = fields[propField].valueOf();
                    const index = dataArr.findIndex(d => d[idx] === value);
                    include = include && index !== -1;
                });
                return include;
            }, {
                saveChild: false,
                mode
            });
        }
    } else {
        filteredDataModel = getDataModelFromRange(dataModel, identifiers, mode);
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
            const namespace = params[0];
            let ns = null;
            if (namespace) {
                ns = namespace.local;
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
                if (!commonTuples[dm1Key] && !commonTuples[dm2Key]) {
                    !tuples1[dm1Key] && (tuples1[dm1Key] = {});
                    !tuples2[dm2Key] && (tuples2[dm2Key] = {});
                    row1.forEach((value, idx) => {
                        tuples1[dm1Key][schema1[idx].name] = value;
                    });
                    row2.forEach((value, idx) => {
                        tuples2[dm2Key][schema2[idx].name] = value;
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
        if (fieldObj.subtype() === DimensionSubtype.TEMPORAL) {
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

const retrieveNearestGroupByReducers = (dataModel, ...measureFieldNames) => {
    let nearestReducers = {};
    let next = dataModel;
    do {
        const derivations = next.getDerivations();
        if (derivations) {
            const groupDerivation = derivations.reverse().find(derivation => derivation.op === DM_OPERATION_GROUP);
            if (groupDerivation) {
                nearestReducers = groupDerivation.criteria || {};
                break;
            }
        }
    } while (next = next.getParent());

    const filteredReducers = {};
    const measures = dataModel.getFieldspace().getMeasure();
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

    return filteredReducers;
};

export {
    require,
    Scales,
    Symbols,
    pathInterpolators,
    stack,
    nestCollection,
    getSymbol,
    transformColors,
    detectColor,
    hexToHsv,
    hslToRgb,
    rgbToHsv,
    hsvToRgb,
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
    filterPropagationModel,
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
    Store,
    getDependencyOrder,
    objectIterator,
    intSanitizer,
    transactor,
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
    formatTemporal,
    createSelection,
    temporalFields,
    retrieveNearestGroupByReducers
};
