import { mergeRecursive, COORD_TYPES } from 'muze-utils';
import * as PROPS from '../enums/props';

const { POLAR, CARTESIAN } = COORD_TYPES;

const configSanitizer = {
    [POLAR]: (config) => {
        const encoding = config.encoding;
        if (!encoding.angle.field) {
            encoding.angle.field = encoding.color.field;
        }
        return config;
    },
    [CARTESIAN]: config => config
};
export const defaultOptions = {
    [PROPS.CONFIG]: {
        value: null,
        meta: {
            sanitization: (config, oldConfig, context) => {
                context._customConfig = config;
                const constructor = context.constructor;
                const newConf = mergeRecursive({}, constructor.defaultConfig());

                return constructor.defaultPolicy(configSanitizer[context.coord()](newConf), config);
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
};
