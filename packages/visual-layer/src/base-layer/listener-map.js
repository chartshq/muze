import { CommonProps } from 'muze-utils';
import { getValidTransform, getEncodingFieldInf } from '../helpers';
import * as PROPS from '../enums/props';

const renderLayer = (context) => {
    const mount = context.mount();
    if (mount) {
        context.render(mount);
        context.dependencies().throwback.commit(CommonProps.ON_LAYER_DRAW, true);
    }
};

export const listenerMap = (context, ns, metaInf) => [
    {
        props: [`${ns.local}.${PROPS.DATA}.${metaInf.subNamespace}`],
        listener: ([, data]) => {
            const config = context.config();
            const encodingValue = config.encoding;
            if (data && encodingValue) {
                const fieldsConfig = data.getFieldsConfig();
                const encodingFieldsInf = getEncodingFieldInf(encodingValue, fieldsConfig);
                context.encodingFieldsInf(encodingFieldsInf);
                context.transformType(getValidTransform(config, fieldsConfig, encodingFieldsInf));
                context._transformedData = context.getTransformedData(data, config,
                    context.transformType(), encodingFieldsInf);
                context._normalizedData = context.getNormalizedData(context._transformedData, fieldsConfig);
                const domain = context.calculateDomainFromData(context._normalizedData, context.encodingFieldsInf(),
                    context.data().getFieldsConfig());
                context.domain(domain);
            }
        },
        type: 'registerImmediateListener'
    },
    {
        props: [`${ns.local}.${PROPS.CONFIG}.${metaInf.subNamespace}`],
        listener: ([, config]) => {
            const calculateDomain = config.calculateDomain;
            if (calculateDomain === false) {
                const store = context.store();
                const namespaceInf = {
                    namespace: `local.layers.${context.metaInf().namespace}`,
                    key: 'renderListener'
                };

                store.unsubscribe(namespaceInf);
                store.registerChangeListener(`${ns.local}.${PROPS.DATA}.${metaInf.subNamespace}`,
                    () => {
                        renderLayer(context);
                    }, false, namespaceInf);
            }
        },
        type: 'registerImmediateListener'
    },
    {
        props: [`app.group.domain.y.${metaInf.unitRowIndex}00`,
            `app.group.domain.x.0${metaInf.unitColIndex}0`, 'app.group.domain.radius'],
        listener: () => {
            renderLayer(context);
        },
        type: 'registerChangeListener'
    }
];

