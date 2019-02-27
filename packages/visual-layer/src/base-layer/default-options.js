import { mergeRecursive, COORD_TYPES, getObjProp } from 'muze-utils';
import * as PROPS from '../enums/props';

const { POLAR, CARTESIAN } = COORD_TYPES;

const configSanitizer = {
    [POLAR]: (config) => {
        const encoding = config.encoding;
        if (!encoding.angle.field) {
            encoding.angle.field = encoding.color.field;
        }
        if (!getObjProp(encoding.angle0, 'field')) {
            encoding.angle0 = Object.assign(encoding.angle0 || {}, {
                field: encoding.angle.field
            });
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

                return constructor.defaultPolicy(newConf, configSanitizer[context.coord()](config));
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
