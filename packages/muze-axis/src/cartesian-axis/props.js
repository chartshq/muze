import { mergeRecursive } from 'muze-utils';
import { hasAxesConfigChanged } from './helper';

export const PROPS = {
    availableSpace: {},
    axisDimensions: {},
    axisComponentDimensions: {},
    config: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._config || {});
            const mockedOldConfig = mergeRecursive({}, oldConfig);
            value = mergeRecursive(mockedOldConfig, value);

            value.axisNamePadding = Math.max(value.axisNamePadding, 0);
            const shouldAxesScaleUpdate = hasAxesConfigChanged(
                value, oldConfig, ['interpolator', 'exponent', 'base', 'orientation']
            );
            const tickFormatter = context.sanitizeTickFormatter(value);

            if (shouldAxesScaleUpdate) {
                context._scale = context.createScale(value);
                context._axis = context.createAxis(value);
            }

            context._tickFormatter = ticks => tickFormatter(ticks);

            context.resetRenderConfig(value);
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
    maxTickSpaces: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._maxTickSpaces || {});
            value = mergeRecursive(oldConfig, value);
            return value;
        }
    },
    valueParser: {
        defaultValue: val => val
    }
};
