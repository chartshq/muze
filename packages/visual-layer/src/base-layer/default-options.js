import { mergeRecursive } from 'muze-utils';
import * as PROPS from '../enums/props';

export const defaultOptions = {
    [PROPS.CONFIG]: {
        value: null,
        meta: {
            sanitization: (config, oldConfig, context) => {
                context._customConfig = config;
                const constructor = context.constructor;
                const newConf = mergeRecursive({}, constructor.defaultConfig());
                return constructor.defaultPolicy(newConf, config);
            }
        }
    },
    [PROPS.DATA]: {
        value: null,
        meta: {
            preset: (data, context) => {
                if (context._cacheEnabled) {
                    context._cachedData.push(data);
                } else {
                    context._cachedData = [data];
                }
            }
        }
    }
    // [PROPS.MOUNT]: {
    //     value: null
    // },
    // [PROPS.AXES]: {
    //     value: null
    // },
    // [PROPS.MEASUREMENT]: {
    //     value: null
    // }
};
