import { InvalidAwareTypes, getObjProp } from 'muze-utils';

export const treatNullMeasures = (domainVal, scaledVal, minDomainScaledVal) => {
    if (domainVal instanceof InvalidAwareTypes) {
        return minDomainScaledVal;
    }
    return scaledVal;
};

export const resolveAxisConfig = (propVal, defaultVal, context) => {
    const constructor = getObjProp(propVal, 'constructor');
    switch (constructor) {
    case Function:
        return propVal(defaultVal, context);
    case Array:
        return propVal;
    default:
        return defaultVal;
    }
};

export const sanitizeRetinalConfig = (oldConfig, newConfig) => {
    const stops = newConfig.stops;
    if (!stops || stops <= 1 || isNaN(stops)) {
        newConfig.stops = oldConfig.stops;
    }
    return newConfig;
};
