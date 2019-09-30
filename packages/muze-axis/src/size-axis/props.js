import { mergeRecursive } from 'muze-utils';

export const PROPS = {
    config: {
        sanitization: (context, value) => {
            context._userRange = value.range;
            return mergeRecursive(context._config || {}, value);
        }
    },
    domain: {
        sanitization: (context, value) => {
            context.scale().domain(value);
            return value;
        }
    },
    range: {},
    scale: {},
    uniqueValues: {}
};
