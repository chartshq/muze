import { hslInterpolator, piecewiseInterpolator, numberInterpolator } from 'muze-utils';
import { CONTINOUS, DISCRETE } from '../enums/constants';
import { LINEAR, SEQUENTIAL, ORDINAL, QUANTILE } from '../enums/scale-type';
import { getHslString } from './props';

const getSteps = (domain, steps) => {
    let newSteps = [];

    if (steps instanceof Array) {
        newSteps = steps.slice().sort();
        newSteps = [...new Set([domain[0], ...steps, domain[1]])].sort();
    } else {
        const interpolator = numberInterpolator()(...domain);
        for (let i = 0; i <= steps; i++) {
            newSteps[i] = interpolator(i / steps);
        }
    }

    if (newSteps[0] < domain[0]) {
        newSteps.shift();
    }
    return { domain, newSteps };
};

const rangeSteps = (newSteps, range) => {
    let newRange = [];
    const maxRangeLength = Math.min(range.length, 18);

    if (newSteps.length > maxRangeLength) {
        const rangeCycles = Math.floor((newSteps.length) / maxRangeLength);
        for (let i = 0; i < rangeCycles; i++) {
            newRange = [...newRange, ...range];
        }
        newRange = [...newRange, ...range.slice(0, (newSteps.length) % maxRangeLength)];
    } else {
        newRange = range.slice(0, newSteps.length);
    }
    return { range: newRange };
};

/**
 *
 *
 * @param {*} domain
 * @returns
 */
const piecewiseDomain = (domain, steps, range) => {
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
const indexedDomainMeasure = (domain, steps, range) => {
    const uniqueVals = domain;
    return { domain, uniqueVals, scaleDomain: [0, 1], range };
};

/**
 *
 *
 * @param {*} domain
 * @returns
 */
const normalDomain = (domain, steps, range) => {
    const uniqueVals = domain;
    return { uniqueVals, domain, nice: true, range };
};

/**
 *
 *
 * @param {*} domain
 * @param {*} steps
 * @returns
 */
const steppedDomain = (domain, steps, range) => {
    const { domain: uniqueVals, newSteps } = getSteps(domain, steps);
    const { newRange } = rangeSteps(newSteps.length - 1, range);

    return { uniqueVals, domain: newSteps, nice: true, range: newRange };
};

const continousSteppedDomain = (domain, steps, range) => {
    const { domain: uniqueVals, newSteps } = getSteps(domain, steps);
    const { newRange } = rangeSteps(newSteps.length, range);

    return { uniqueVals, domain: newSteps, nice: true, range: newRange };
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
 * @param {*} steps
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
 * @param {*} steps
 */
export const strategyGetter = (domainType, rangeType, schemeType, steps) =>
     strategies(steps)[`${domainType}-${rangeType}-${schemeType || ''}`];
