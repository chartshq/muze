import { mergeRecursive, DataModel } from 'muze-utils';
import { defaultConfig } from './default-config';
import { CONFIG, LAYERDEFS, TRANSFORM, DATA, LAYERS, TRANSFORMEDDATA } from './enums/reactive-props';
import { sanitizeLayerDef } from './helper';

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
        value: null,
        meta: {
            preset: layerDef => sanitizeLayerDef(layerDef)
        }
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
            typeCheck: d => d instanceof DataModel,
            preset: (data, context) => {
                if (context._cache) {
                    const cachedData = context.cachedData();
                    context.cachedData([...cachedData, data]);
                } else {
                    const oldData = context.cachedData()[0];
                    oldData && oldData.unsubscribe('propagation');
                    context.cachedData([data]);
                }
            }
        }
    },
    [TRANSFORMEDDATA]: {
        value: null
    },
    width: {
        value: null
    },
    height: {
        value: null
    }
};
