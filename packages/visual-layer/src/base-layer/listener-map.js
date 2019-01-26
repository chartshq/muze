import { CommonProps, STATE_NAMESPACES } from 'muze-utils';
import { getEncodingFieldInf } from '../helpers';
import * as PROPS from '../enums/props';

const renderLayer = (context) => {
    const mount = context.mount();
    if (mount) {
        context.render(mount);
        context.dependencies().throwback.commit(CommonProps.ON_LAYER_DRAW, true);
    }
};

export const listenerMap = (context, ns) => [
    {
        props: [`${ns.local}.${PROPS.DATA}`],
        listener: ([, data]) => {
            const config = context.config();
            const encodingValue = config.encoding;
            if (data && encodingValue) {
                const fieldsConfig = data.getFieldsConfig();
                const encodingFieldsInf = getEncodingFieldInf(encodingValue, fieldsConfig);
                context.encodingFieldsInf(encodingFieldsInf);
                context.resolveTransformType();
                context._transformedData = context.getTransformedData(data, config,
                    context.transformType(), encodingFieldsInf);
                context._normalizedData = context.getNormalizedData(context._transformedData, fieldsConfig);
                const domain = context.calculateDomainFromData(context._normalizedData, context.encodingFieldsInf(),
                    context.data().getFieldsConfig());
                context._domain = domain;
                !context._updateLock && context.domain(domain);
            }
        },
        type: 'registerImmediateListener'
    },
    {
        props: [`${ns.local}.${PROPS.CONFIG}`],
        listener: ([, config]) => {
            const calculateDomain = config.calculateDomain;
            const props = context.getRenderProps();
            const store = context.store();
            const namespaceInf = {
                namespace: `${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}.${context.metaInf().namespace}`,
                key: 'renderListener'
            };
            store.unsubscribe(namespaceInf);
            if (calculateDomain === false) {
                props.push(`${ns.local}.${PROPS.DATA}`);
            }
            store.registerChangeListener(props,
                () => {
                    renderLayer(context);
                }, false, namespaceInf);
        },
        type: 'registerImmediateListener'
    }
];

