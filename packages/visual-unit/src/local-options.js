import { mergeRecursive } from 'muze-utils';
import { defaultConfig } from './default-config';
import { CONFIG, LAYERDEFS, WIDTH, HEIGHT, TRANSFORM, DATA, LAYERS } from './enums/reactive-props';

export default {
    [CONFIG]: {
        value: null,
        meta: {
            sanitization: (config, oldConfig) => (
                mergeRecursive(oldConfig || mergeRecursive({}, defaultConfig), config)
            )
        }
    },
    [LAYERDEFS]: {
        value: null
    },
    [WIDTH]: {
        value: null
    },
    [HEIGHT]: {
        value: null
    },
    [TRANSFORM]: {
        value: null
    },
    [LAYERS]: {
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
                    const oldData = context.data();
                    oldData && oldData.unsubscribe('propagation');
                    context.cachedData([data]);
                }
            }
        }
    }
};
