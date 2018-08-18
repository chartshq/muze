import { colorInterpolator, piecewiseInterpolator, numberInterpolator } from 'muze-utils';
import { CONTINOUS, DISCRETE } from '../enums/constants';
import { LINEAR, SEQUENTIAL, ORDINAL, THRESHOLD } from '../enums/scale-type';

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
const indexedDomainMeasure = (domain) => {
    const uniqueVals = domain;
    return { domain, uniqueVals, scaleDomain: [0, 1] };
};

/**
 *
 *
 * @param {*} domain
 * @returns
 */
const normalDomain = (domain) => {
    const uniqueVals = domain;
    return { uniqueVals, domain, nice: true };
};

/**
 *
 *
 * @param {*} domain
 * @param {*} steps
 * @returns
 */
const steppedDomain = (domain, steps) => {
    let newSteps = [];
    if (steps instanceof Array) {
        newSteps = steps.slice().sort();
    } else {
        const interpolator = numberInterpolator()(...domain);
        for (let i = 0; i <= steps; i++) {
            newSteps[i] = interpolator(i / steps);
        }
    }
    const uniqueVals = domain;
    if (newSteps[0] < domain[0]) {
        newSteps.shift();
    }
    const retDomain = newSteps;
    return { uniqueVals, domain: retDomain, nice: true };
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
const pieceWiseRange = (domainValue, scale, domain, uniqueVals) => {
    const index = uniqueVals.indexOf(domainValue);
    const numVal = domain[index];
    const fn = piecewiseInterpolator()(colorInterpolator(), [...scale.range()]);
    return fn(numVal);
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
        domain: () => indexedDomainMeasure,
        range: () => indexedRange
    },
    [`${DISCRETE}-${CONTINOUS}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domain: () => indexedDomain,
        range: () => uniqueRange,
    },
    [`${CONTINOUS}-${DISCRETE}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domain: () => indexedDomainMeasure,
        range: () => indexedRange
    },
    [`${DISCRETE}-${DISCRETE}-${SEQUENTIAL}`]: {
        scale: SEQUENTIAL,
        domain: () => indexedDomain,
        range: () => uniqueRange,
    },
    [`${DISCRETE}-${CONTINOUS}-${ORDINAL}`]: {
        scale: LINEAR,
        domain: () => indexedDomain,
        range: (range) => {
            if (range.length) {
                return pieceWiseRange;
            } return indexedRange;
        }
    },
    [`${DISCRETE}-${DISCRETE}-${ORDINAL}`]: {
        scale: ORDINAL,
        domain: () => normalDomain,
        range: () => normalRange,
    },
    [`${CONTINOUS}-${CONTINOUS}-${ORDINAL}`]: {
        scale: LINEAR,
        domain: () => normalDomain,
        range: () => normalRange,
    },
    [`${CONTINOUS}-${DISCRETE}-${ORDINAL}`]: {
        scale: THRESHOLD,
        domain: () => steppedDomain,
        range: () => normalRange

    },
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
