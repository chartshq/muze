import { InvalidAwareTypes } from 'muze-utils';

export const treatNullMeasures = (domainVal, scaledVal, minDomainScaledVal) => {
    if (domainVal instanceof InvalidAwareTypes) {
        return minDomainScaledVal;
    }
    return scaledVal;
};

export const resolveAxisConfig = (propVal, defaultVal, key, context) => {
    let resolvedVal;
    if (propVal instanceof Function) {
        resolvedVal = propVal(defaultVal, context);
    } else if (propVal instanceof Array) {
        resolvedVal = propVal;
    } else {
        resolvedVal = defaultVal;
    }
    return resolvedVal;
};
