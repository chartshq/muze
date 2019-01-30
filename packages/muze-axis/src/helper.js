import { InvalidAwareTypes } from 'muze-utils';

export const treatNullMeasures = (domainVal, scaledVal, minDomainScaledVal) => {
    if (domainVal instanceof InvalidAwareTypes) {
        return minDomainScaledVal;
    }
    return scaledVal;
};
