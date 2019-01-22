import { mergeRecursive } from 'muze-utils';

export const PROPS = {

    config: {
        sanitization: (context, value) => {
            value = mergeRecursive(context._config, value);
            return value;
        }
    },
    manager: {},
    unitPositions: {},
    logicalSpace: {}
};

