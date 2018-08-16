import { mergeRecursive } from 'muze-utils';
import { defaultConfig } from './default-config';
import { CONFIG, LAYERDEFS, AXES, WIDTH, HEIGHT, MOUNT, TRANSFORM, FIELDS, DATA } from './enums/reactive-props';

export default {
    [CONFIG]: {
        value: null,
        meta: {
            sanitization: (config, oldConfig) => (
                mergeRecursive(oldConfig || mergeRecursive({}, defaultConfig), config)
            ),
        }
    },
    [LAYERDEFS]: {
        value: null
    },
    [AXES]: {
        value: null,
        meta: {
            sanitization: (axes, prevAxes) => Object.assign(prevAxes || {}, axes)
        }
    },
    [WIDTH]: {
        value: null
    },
    [HEIGHT]: {
        value: null
    },
    [MOUNT]: {
        value: null
    },
    [TRANSFORM]: {
        value: null
    },
    [FIELDS]: {
        value: null
    },
    [DATA]: {
        value: null,
        meta: {
            preset: (data, context) => {
                if (context._cache) {
                    const cachedData = context.cachedData();
                    context.cachedData([...cachedData, data]);
                } else {
                    context.cachedData([data]);
                }
            }
        }
    }
};
