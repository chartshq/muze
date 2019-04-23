import { STATE_NAMESPACES } from 'muze-utils';
import * as PROPS from '../enums/props';
import { encodingFieldInfRetriever } from '../helpers';

export const listenerMap = [
    {
        props: [`${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}.${PROPS.DATA}`],
        type: 'registerImmediateListener',
        listener: (context, [, data]) => {
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
                    if (config.calculateDomain !== false) {
                        const domain = context.calculateDomainFromData(context._normalizedData,
                            context.encodingFieldsInf(), context.data().getFieldsConfig());
                        context.domain(domain);
                    }
                }
            }
        },
        namespace: context => context.metaInf().namespace
    }
];
