import { mergeRecursive } from 'muze-utils';

export const PROPS = {
    config: {
        sanitization: (context, value) => mergeRecursive(context._config || {}, value)
    },
    maxMeasures: {},
    availableSpace: {},
    logicalSpace: {}
};
