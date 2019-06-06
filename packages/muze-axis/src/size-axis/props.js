import { mergeRecursive } from 'muze-utils';
import { sanitizeRetinalConfig } from '../helper';

export const PROPS = {
    config: {
        sanitization: (context, value) => {
            const defCon = mergeRecursive({}, context.constructor.defaultConfig());
            const oldConfig = mergeRecursive(defCon, context.config());

            const newConfig = mergeRecursive(oldConfig, sanitizeRetinalConfig(oldConfig, value));
            return newConfig;
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
