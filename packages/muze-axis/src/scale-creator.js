import { scales, colorSchemes } from 'muze-utils';

import {
    SEQUENTIAL,
    ORDINAL,
    LINEAR,
    CONTINOUS,
    THRESHOLD,
    QUANTIZE
} from './enums/constants';

import * as ScaleType from './enums/scale-type';

const {
    scaleLinear,
    scaleThreshold,
    scaleLog,
    scalePow,
    scaleIdentity,
    scaleOrdinal,
    scaleSequential,
    scaleQuantize,
    scaleQuantile,
    schemeCategory10,
    schemeCategory20,
    schemeCategory20b,
    scaleBand,
    scaleTime
} = scales;
export const scaleMap = {
    [ScaleType.LINEAR]: scaleLinear,
    [ScaleType.BAND]: scaleBand,
    [ScaleType.QUANTIZE]: scaleQuantize,
    [ScaleType.QUANTILE]: scaleQuantile,
    [ScaleType.THRESHOLD]: scaleThreshold,
    [ScaleType.SEQUENTIAL]: scaleSequential,
    [ScaleType.LOG]: scaleLog,
    [ScaleType.POW]: scalePow,
    [ScaleType.IDENTITY]: scaleIdentity,
    [ScaleType.TIME]: scaleTime,
    [ScaleType.COLOR]: scaleLinear,
    [ScaleType.ORDINAL]: scaleOrdinal
};
export const SCHEMES = {
    SCHEME1: schemeCategory10,
    SCHEME2: schemeCategory20,
    SCHEME3: schemeCategory20b
};

/**
 * Accepts a scheme in a string format and returns the scale from d3-scale-chromatic
 *
 * @export
 * @param {string} scheme a string representing the kind of scheme for the color axis
 * @return {Object} The corresponding scale from a scheme type from d3 chromatic scale
 */
export function getScheme (scheme) {
    if (scheme[0] === 'i') {
        return scaleSequential(colorSchemes[scheme]);
    }
    return scaleOrdinal(colorSchemes[scheme]);
}

/**
 *
 *
 * @export
 * @param {*} scheme
 *
 */
export function getSchemeType (scheme) {
    let schemeType = '';
    if (scheme && typeof (scheme) === 'string') {
        schemeType = scheme[0] === 'i' ? SEQUENTIAL : ORDINAL;
    } else {
        schemeType = ORDINAL;
    }
    return schemeType;
}

/**
 * This function is used to create a scale that is assigned to
 * an instance of axis.
 *
 * @export
 * @param {Object} params the input parameters to create a Scale object
 * @param {string} params.type the type of scale
 * @param {Array} params.range the range of scale
 * @return {Object} instance of scale
 */
export function createScale (params) {
    if (!params.type || !scaleMap[params.type]) {
        throw new Error(`${params.type} is not a valid scale type`);
    }
    if (!Array.isArray(params.range)) {
        throw new Error('range parameter must be an array');
    }
    let scaleFactory = null;
    const range = params.range;
    // @todo: do it using scale decorator
    if (params.type === LINEAR && params.interpolator) {
        scaleFactory = scaleMap[params.interpolator];
        if (params.interpolator === ScaleType.POW) {
            return scaleFactory().range(range).exponent(params.exponent);
        } else if (params.interpolator === ScaleType.LOG) {
            return scaleFactory().range(range).base([params.base]);
        }
    } else {
        scaleFactory = scaleMap[params.type];
    }

    if (params.type === QUANTIZE) {
        scaleFactory().nice();
    }
    return scaleFactory().range(range);
}

/**
 * This method is used to update the range of a scale
 * so that the core module can remain agnostic of the d3
 * scale api.
 *
 * @export
 * @param {Scale} scale Instance of d3 Scale.
 * @param {Array} range new range of the scale.
 * @return {Scale} Updated scale.
 */
export function updateScaleRange (scale, range) {
    return scale.range(range);
}

/**
 *
 *
 * @export
 * @param {*} domainType
 * @param {*} rangeType
 * @param {*} steps
 *
 */
export function getScaleType (domainType, rangeType, steps) {
    if (rangeType === CONTINOUS) {
        return LINEAR;
    }
    if (domainType === CONTINOUS) {
        if (steps instanceof Array) {
            return THRESHOLD;
        }
        return QUANTIZE;
    }
    return ORDINAL;
}
