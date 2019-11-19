import { piecewiseInterpolator,
        hslInterpolator,
        sanitizeDomainWhenEqual, getReadableTicks } from 'muze-utils';
import { CONTINOUS, DISCRETE } from '../enums/constants';
import { LINEAR, SEQUENTIAL, ORDINAL, QUANTILE } from '../enums/scale-type';
import { getHslString } from './props';
import { treatNullMeasures } from '../helper';

const getStops = (domain, stops) => {
    let newStops = [];

    if (stops instanceof Array) {
        newStops = stops.slice().sort();
        newStops = [...new Set([domain[0], ...stops, domain[1]])].sort();
    } else {
        newStops = getReadableTicks(domain, stops);
    }
    return { domain, newStops };
};

const rangeStops = (newStopsLength, range) => {
    let newRange = [];
    const maxRangeLength = Math.min(range.length, 18);

    if (newStopsLength > maxRangeLength) {
        const interpolator = piecewiseInterpolator()(hslInterpolator(), range.map(e => getHslString(e)));
        for (let i = 0; i < newStopsLength; i++) {
            newRange[i] = interpolator(i / (newStopsLength - 1));
        }
    } else {
        newRange = range.slice(0, newStopsLength);
    }
    return { newRange };
};

/**
*
*
* @param {*} domain
*
*/
const indexedDomain = (domain) => {
    const uniqueVals = domain;
    const retDomain = domain.map((d, i) => (i) / (domain.length - 1));
    return { domain: retDomain, uniqueVals, scaleDomain: [0, 1] };
};

/**
 *
 *
 * @param {*} domain
 *
 */
const indexedDomainMeasure = (domain, stops, range) => {
    const uniqueVals = domain;
    return { domain, uniqueVals, scaleDomain: [0, 1], range };
};

/**
 *
 *
 * @param {*} domain
 *
 */
const normalDomain = (domain, stops, range) => {
    const uniqueVals = domain;
    return { uniqueVals, domain, nice: true, range };
};

/**
 *
 *
 * @param {*} domain
 * @param {*} stops
 *
 */
const steppedDomain = (domain, stops, range) => {
    const { domain: uniqueVals, newStops } = getStops(domain, stops);
    const { newRange } = rangeStops(newStops.length - 1, range);

    return { uniqueVals, domain: newStops, nice: true, range: newRange };
};

const continousSteppedDomain = (domain, stops, range) => {
    const { domain: uniqueVals, newStops } = getStops(sanitizeDomainWhenEqual(domain), range.length - 1);
    const hslRange = range.map(e => getHslString(e));
    return { uniqueVals, domain: newStops, nice: true, range: hslRange };
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 * @param {*} domain
 * @param {*} uniqueVals
 *
 */
const uniqueRange = (domainValue, scale, domain, uniqueVals) => {
    const index = uniqueVals.indexOf(domainValue);
    const numVal = domain[index];
    return scale(numVal);
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 * @param {*} domain
 *
 */
const indexedRange = (domainValue, scale, domain) => {
    const numVal = (domainValue - domain[0]) / (domain[domain.length - 1] - domain[0]);

    return treatNullMeasures(domainValue, scale(numVal), scale(0));
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 */
const normalRange = (domainValue, scale, domain) => treatNullMeasures(domainValue, scale(domainValue),
    scale(domain[0]));

/**
 *
 *
 * @param {*} stops
 */
const strategies = () => ({
    [`${CONTINOUS}-${CONTINOUS}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domainRange: () => indexedDomainMeasure,
        value: () => indexedRange
    },
    [`${CONTINOUS}-${DISCRETE}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domainRange: () => indexedDomainMeasure,
        value: () => indexedRange
    },
    [`${DISCRETE}-${DISCRETE}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domainRange: () => indexedDomain,
        value: () => uniqueRange
    },
    [`${DISCRETE}-${DISCRETE}-${ORDINAL}`]: {
        scale: ORDINAL,
        domainRange: () => normalDomain,
        value: () => normalRange
    },
    [`${CONTINOUS}-${CONTINOUS}-${ORDINAL}`]: {
        scale: LINEAR,
        domainRange: () => continousSteppedDomain,
        value: () => normalRange
    },
    [`${CONTINOUS}-${DISCRETE}-${ORDINAL}`]: {
        scale: QUANTILE,
        domainRange: () => steppedDomain,
        value: () => normalRange

    }
});

/**
 *
 *
 * @param {*} domainType
 * @param {*} rangeType
 * @param {*} schemeType
 * @param {*} stops
 */
export const strategyGetter = (domainType, rangeType, schemeType) =>
    strategies()[`${domainType}-${rangeType}-${schemeType || ''}`];
