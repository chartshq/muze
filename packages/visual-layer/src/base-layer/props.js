import { COORD_TYPES, mergeRecursive } from 'muze-utils';
import * as PROPS from '../enums/props';
import { encodingFieldInfRetriever } from '../helpers';

const { CARTESIAN } = COORD_TYPES;
export const props = {
    axes: {},
    mount: {},
    measurement: {},
    metaInf: {},
    [PROPS.CONFIG]: {
        value: null,
        sanitization: (context, config) => {
            context._customConfig = config;
            const constructor = context.constructor;
            const newConf = mergeRecursive({}, constructor.defaultConfig());

            return constructor.defaultPolicy(newConf, config);
        }
    },
    [PROPS.DATA]: {
        value: null,
        onset: (context, data) => {
            const config = context.config();
            if (data && config) {
                if (context._cacheEnabled) {
                    context._cachedData.push(data);
                } else {
                    context._cachedData = [data];
                }
                const encodingValue = config.encoding;
                if (data && encodingValue) {
                    const fieldsConfig = data.getFieldsConfig();
                    const encodingFieldsInf = encodingFieldInfRetriever[context.coord()](encodingValue, fieldsConfig);
                    context.encodingFieldsInf(encodingFieldsInf);
                    context.resolveTransformType();
                    context._transformedData = context.getTransformedData(data, config,
                        context.transformType(), encodingFieldsInf);
                    context._normalizedData = context.getNormalizedData(context._transformedData, fieldsConfig);
                    const domain = context.calculateDomainFromData(context._normalizedData, context.encodingFieldsInf(),
                        context.data().getFieldsConfig());
                    context.domain(domain);
                }
            }
        }
    },
    valueParser: {
        defaultValue: val => val
    },
    coord: {
        defaultValue: CARTESIAN
    }
};
