/**
 * This file exports functions to create or modify the scale of a plot.
 */
import {
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
    scaleTime,
   } from 'd3-scale';

import {
     schemeDark2,
     schemePaired,
     schemeAccent,
     schemePastel1,
     schemePastel2,
     schemeSet1,
     schemeSet2,
     schemeSet3,
     schemeBlues,
     schemeBrBG,
     schemePRGn,
     schemePiYG,

     interpolateBrBG,
     interpolatePRGn,
     interpolatePiYG,
     interpolatePuOr,
     interpolateRdBu,
     interpolateRdGy,
     interpolateRdYlBu,
     interpolateRdYlGn,
     interpolateSpectral,

     interpolateBlues,
     interpolateGreens,
     interpolateGreys,
     interpolateOranges,
     interpolatePurples,
     interpolateReds,

     interpolateViridis,
     interpolateInferno,
     interpolateMagma,
     interpolatePlasma,
     interpolateWarm,
     interpolateCool,
     interpolateCubehelixDefault,
     interpolateBuGn,
     interpolateBuPu,
     interpolateGnBu,
     interpolateOrRd,
     interpolatePuBuGn,
     interpolatePuBu,
     interpolatePuRd,
     interpolateRdPu,
     interpolateYlGnBu,
     interpolateYlGn,
     interpolateYlOrBr,
     interpolateYlOrRd,
     interpolateRainbow
     } from 'd3-scale-chromatic';

import {
    SEQUENTIAL,
    ORDINAL,
    LINEAR,
    CONTINOUS,
    THRESHOLD,
    QUANTIZE
} from './enums/constants';

import * as ScaleType from './enums/scale-type';

const scaleMap = {
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
    [ScaleType.ORDINAL]: scaleOrdinal,
    scaleSequential
};

const schemes = {
    /* Categorical schemes */
    schemeAccent,
    schemeBlues,
    schemeDark2,
    schemePaired,
    schemePastel1,
    schemePastel2,
    schemeSet1,
    schemeSet2,
    schemeSet3,
    schemeBrBG,
    schemePRGn,
    schemePiYG,

    /* Diverging schemes */
    interpolateBrBG,
    interpolatePRGn,
    interpolatePiYG,
    interpolatePuOr,
    interpolateRdBu,
    interpolateRdGy,
    interpolateRdYlBu,
    interpolateRdYlGn,
    interpolateSpectral,

    /* Sequential-single hue */
    interpolateBlues,
    interpolateGreens,
    interpolateGreys,
    interpolateOranges,
    interpolatePurples,
    interpolateReds,

     /* Sequential-multi hue */
    interpolateViridis,
    interpolateInferno,
    interpolateMagma,
    interpolatePlasma,
    interpolateWarm,
    interpolateCool,
    interpolateCubehelixDefault,
    interpolateBuGn,
    interpolateBuPu,
    interpolateGnBu,
    interpolateOrRd,
    interpolatePuBuGn,
    interpolatePuBu,
    interpolatePuRd,
    interpolateRdPu,
    interpolateYlGnBu,
    interpolateYlGn,
    interpolateYlOrBr,
    interpolateYlOrRd,
    /* Cyclical Schemes */
    interpolateRainbow,

    [ScaleType.BAND]: scaleBand,
    [ScaleType.QUANTIZE]: scaleQuantize,
    [ScaleType.QUANTILE]: scaleQuantile,
    [ScaleType.TIME]: scaleTime,
    [ScaleType.COLOR]: scaleLinear,
    [ScaleType.ORDINAL]: scaleOrdinal,
};

export const SCHEMES = {
    SCHEME1: schemeCategory10,
    SCHEME2: schemeCategory20,
    SCHEME3: schemeCategory20b,
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
        return scaleSequential(schemes[scheme]);
    }
    return scaleOrdinal(schemes[scheme]);
}

/**
 *
 *
 * @export
 * @param {*} scheme
 * @returns
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
 * @returns
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
