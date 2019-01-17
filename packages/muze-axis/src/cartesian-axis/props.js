import { mergeRecursive } from 'muze-utils';
import { hasAxesConfigChanged } from './helper';

export const PROPS = {
    availableSpace: {},
    axisDimensions: {},
    axisComponentDimensions: {},
    config: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._config || {});
            const newValue = mergeRecursive({}, oldConfig);
            value = mergeRecursive(newValue, value);

            value.axisNamePadding = Math.max(value.axisNamePadding, 0);
            if (value.orientation !== oldConfig.orientation) {
                context.axis(context.createAxis(value));
            }
            const shouldAxesScaleUpdate = hasAxesConfigChanged(value, oldConfig, ['interpolator', 'exponent', 'base']);

            // Update scale and axis
            if (shouldAxesScaleUpdate) {
                context._scale = context.createScale(value);
                context._axis = context.createAxis(value);
            }
            context.attachedFormatter = context.getTickFormatter(value);

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
