import { mergeRecursive } from 'muze-utils';

export const PROPS = {
    availableSpace: {},
    axisDimensions: {},
    axisComponentDimensions: {},
    config: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._config || {});
            value = mergeRecursive(oldConfig, value);
            value.axisNamePadding = Math.max(value.axisNamePadding, 0);
            if (value.orientation !== oldConfig.orientation) {
                context.axis(context.createAxis(value));
            }
            const {
                labels,
                show,
                showInnerTicks,
                showOuterTicks,
                showAxisName
            } = value;
            context.renderConfig({
                labels,
                show,
                showInnerTicks,
                showOuterTicks,
                showAxisName
            });
            return value;
        }
    },
    renderConfig: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._renderConfig || {});
            value = mergeRecursive(oldConfig, value);
            return value;
        }
    },
    logicalSpace: {},
    mount: {
    },
    range: {
        sanitization: (context, value) => {
            context.scale().range(value);
            context.logicalSpace(null);
            return value;
        }
    },

    smartTicks: {},
    tickSize: {},
    maxTickSpaces: {}
};
