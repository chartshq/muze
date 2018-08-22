import { hslInterpolator, piecewiseInterpolator, numberInterpolator } from 'muze-utils';
import { CONTINOUS, DISCRETE } from '../enums/constants';
import { LINEAR, SEQUENTIAL, ORDINAL, QUANTILE } from '../enums/scale-type';
import { getHslString } from './props';

const getStops = (domain, stops) => {
    let newStops = [];

    if (stops instanceof Array) {
        newStops = stops.slice().sort();
        newStops = [...new Set([domain[0], ...stops, domain[1]])].sort();
    } else {
        const interpolator = numberInterpolator()(...domain);
        for (let i = 0; i <= stops; i++) {
            newStops[i] = interpolator(i / stops);
        }
    }

    if (newStops[0] < domain[0]) {
        newStops.shift();
    }
    return { domain, newStops };
};

const rangeStops = (newStopsLength, range) => {
    let newRange = [];
    const maxRangeLength = Math.min(range.length, 18);

    if (newStopsLength > maxRangeLength) {
        const rangeCycles = Math.floor((newStopsLength) / maxRangeLength);
        for (let i = 0; i < rangeCycles; i++) {
            newRange = [...newRange, ...range];
        }
        newRange = [...newRange, ...range.slice(0, (newStopsLength) % maxRangeLength)];
    } else {
        newRange = range.slice(0, newStopsLength);
    }
    return { newRange };
};

/**
 *
 *
 * @param {*} domain
 * @returns
 */
const piecewiseDomain = (domain, stops, range) => {
    let newRange = [];
    const uniqueVals = domain;
    const retDomain = domain.map((d, i) => (i) / (domain.length - 1));
    const hslValues = range.map(e => getHslString(e));
    const fn = piecewiseInterpolator()(hslInterpolator(), [...hslValues]);
    newRange = retDomain.map(e => fn(e));
    return { domain: retDomain, uniqueVals, scaleDomain: [0, 1], range: newRange };
};

/**
*
*
* @param {*} domain
* @returns
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
 * @returns
 */
const indexedDomainMeasure = (domain, stops, range) => {
    const uniqueVals = domain;
    return { domain, uniqueVals, scaleDomain: [0, 1], range };
};

/**
 *
 *
 * @param {*} domain
 * @returns
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
 * @returns
 */
const steppedDomain = (domain, stops, range) => {
    const { domain: uniqueVals, newStops } = getStops(domain, stops);
    const { newRange } = rangeStops(newStops.length - 1, range);

    return { uniqueVals, domain: newStops, nice: true, range: newRange };
};

const continousSteppedDomain = (domain, stops, range) => {
    const { domain: uniqueVals, newStops } = getStops(domain, stops);

    const { newRange } = rangeStops(newStops.length, range);

    return { uniqueVals, domain: newStops, nice: true, range: newRange };
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 * @param {*} domain
 * @param {*} uniqueVals
 * @returns
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
 * @returns
 */
const indexedRange = (domainValue, scale, domain) => {
    const numVal = (domainValue - domain[0]) / (domain[domain.length - 1] - domain[0]);

    return scale(numVal);
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 */
const normalRange = (domainValue, scale) => scale(domainValue);

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
    [`${DISCRETE}-${CONTINOUS}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domainRange: () => indexedDomain,
        value: () => uniqueRange
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
    [`${DISCRETE}-${CONTINOUS}-${ORDINAL}`]: {
        scale: ORDINAL,
        domainRange: () => piecewiseDomain,
        value: () => normalRange

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
export const strategyGetter = (domainType, rangeType, schemeType, stops) =>
     strategies(stops)[`${domainType}-${rangeType}-${schemeType || ''}`];
