import { COORD_TYPES, mergeRecursive } from 'muze-utils';
import * as PROPS from '../enums/props';

const { CARTESIAN } = COORD_TYPES;
export const props = {
    axes: {},
    mount: {},
    measurement: {},
    metaInf: {},
    valueParser: {
        defaultValue: val => val
    },
    coord: {
        defaultValue: CARTESIAN
    },
    [PROPS.CONFIG]: {
        value: null,
        sanitization: (context, config) => {
            context._customConfig = config;
            const constructor = context.constructor;
            const newConf = mergeRecursive({}, constructor.defaultConfig());

            return constructor.defaultPolicy(newConf, config);
        }
    },
    encodingTransform: {},
    encodingFieldsInf: {},
    dependencies: {},
    dataProps: {}
};
