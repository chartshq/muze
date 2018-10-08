import { mergeRecursive } from 'muze-utils';

export const PROPS = {
    availableSpace: {},
    axisDimensions: {},
    axisComponentDimensions: {},
    config: {
        sanitization: (context, value) => {
            if (value.labels && value.labels.rotation) {
                context._rotationLock = true;
            }
            const oldConfig = Object.assign({}, context._config || {});

            value = mergeRecursive(oldConfig, value);
            value.axisNamePadding = Math.max(value.axisNamePadding, 0);
            if (value.orientation !== oldConfig.orientation) {
                context.axis(context.createAxis(value));
            }
            context.store().commit('config', value);
            return value;
        }
    },
    logicalSpace: {},
    mount: {
        sanitization: (context, value) => {
            context.store().commit('mount', value);
            return value;
        }
    },
    range: {
        sanitization: (context, value) => {
            context.scale().range(value);
            context.logicalSpace(null);
            context.store().commit('range', value);
            return value;
        }
    },

    smartTicks: {},
    store: {},
    tickSize: {},
    maxTickSpaces: {}
};
