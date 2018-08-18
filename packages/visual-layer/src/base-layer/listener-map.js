import { getValidTransform, getEncodingFieldInf } from '../helpers';
import * as PROPS from '../enums/props';

export const listenerMap = context => [
    {
        props: [PROPS.TRANSFORMED_DATA],
        listener: fetch => fetch(PROPS.DATA, PROPS.CONFIG, (dataModel, config) => {
            const dataModelValue = dataModel.value;
            const configValue = config.value;
            const encodingValue = configValue && configValue.encoding;
            if (dataModelValue && encodingValue) {
                const fieldsConfig = dataModelValue.getFieldsConfig();
                const encodingFieldsInf = getEncodingFieldInf(encodingValue, fieldsConfig);
                context.encodingFieldsInf(encodingFieldsInf);
                context.transformType(getValidTransform(configValue, fieldsConfig, encodingFieldsInf));
                return context.getTransformedData(dataModelValue, configValue, context.transformType(),
                    encodingFieldsInf);
            }
            return null;
        }),
        type: 'computed'
    },
    {
        props: [PROPS.NORMALIZED_DATA],
        listener: fetch => fetch(PROPS.TRANSFORMED_DATA, (transformedData) => {
            const transformedDataValue = transformedData.value;
            if (transformedDataValue) {
                const fieldsConfig = context.data().getFieldsConfig();
                return context.getNormalizedData(transformedDataValue, fieldsConfig);
            }
            return null;
        }),
        type: 'computed'
    },
    {
        props: [PROPS.DOMAIN],
        listener: fetch => fetch(PROPS.NORMALIZED_DATA, (normalizedData) => {
            const normalizedDataValue = normalizedData.value;
            if (normalizedDataValue) {
                return context.calculateDomainFromData(normalizedDataValue, context.encodingFieldsInf(),
                    context.data().getFieldsConfig());
            }
            return null;
        }),
        type: 'computed'
    },
    {
        props: [PROPS.MOUNT, PROPS.DATA, PROPS.AXES, PROPS.CONFIG],
        listener: (mountPoint, dataModel, axes, config) => {
            if (mountPoint[1] && dataModel[1] && config[1] && axes[1]) {
                context.render(mountPoint[1]);
                context.dependencies().throwback.commit('onlayerdraw', true);
            }
        },
        type: 'registerChangeListener'
    }
];

