import { numberInterpolator, piecewiseInterpolator, getActualStopsFromDomain } from 'muze-utils';
import { CONTINOUS, DISCRETE } from '../enums/constants';
import { LINEAR, THRESHOLD } from '../enums/scale-type';
import { treatNullMeasures } from '../helper';

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
 * @param {*} stops
 *
 */
const steppedDomain = (originalDomain, stops) => {
    const actualStops = stops instanceof Array ? stops : stops - 1;
    const { newStops } = getActualStopsFromDomain(originalDomain, actualStops);
    return { uniqueVals: newStops, domain: newStops, nice: true };
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
const discreteRange = (domainValue, scale, domain) => {
    const numVal = (domainValue - domain[0]) / (domain[domain.length - 1] - domain[0]);
    const interpolator = numberInterpolator()(...scale.range());
    return treatNullMeasures(domainValue, interpolator(numVal), interpolator(domain[0]));
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 * @param {*} domain
 *
 */
const pieceWiseRange = (domainValue, scale, domain, uniqueVals) => {
    const index = uniqueVals.indexOf(domainValue);
    const numVal = domain[index];
    const fn = piecewiseInterpolator()(numberInterpolator(), [...scale.range()]);
    return fn(numVal);
};

/**
 *
 *
 * @param {*} domainValue
 * @param {*} scale
 */
const normalRange = (domainValue, scale, domain) =>
    treatNullMeasures(domainValue, scale(domainValue), scale(domain[0]));

/**
 *
 *
 * @param {*} stops
 */
const strategies = {
    [`${DISCRETE}-${CONTINOUS}`]: {
        scale: LINEAR,
        domain: indexedDomain,
        range: pieceWiseRange
    },
    [`${CONTINOUS}-${CONTINOUS}`]: {
        scale: LINEAR,
        domain: steppedDomain,
        // domain: normalDomain,
        range: normalRange
    },
    [`${CONTINOUS}-${DISCRETE}`]: {
        scale: THRESHOLD,
        domain: steppedDomain,
        range: discreteRange
    }
};

/**
 *
 *
 * @param {*} domainType
 * @param {*} rangeType
 * @param {*} schemeType
 * @param {*} stops
 */
export const strategyGetter = (domainType, rangeType) =>
     strategies[`${domainType}-${rangeType}`];
