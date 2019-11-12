import { mergeRecursive } from 'muze-utils';

export const PROPS = {
    config: {
        sanitization: (context, value) => mergeRecursive(context._config || {}, value)
    },
    data: {},
    fieldName: {},
    legendContainer: {},
    measurement: {
        sanitization: (context, value) => {
            const measurement = mergeRecursive(context._measurement, value);
            ['padding', 'border', 'margin'].forEach((space) => {
                measurement[space] = Math.min(measurement[space] > 0 ? measurement[space] : 0,
                     measurement.maxWidth * 0.1, measurement.maxHeight * 0.1);
            });
            return measurement;
        }
    },
    logicalSpace: {},
    metaData: {
        onset: (context, value) => context.firebolt().attachPropagationListener(value)
    },
    range: {
        sanitization: (context, value) => {
            context.scale().range(value);
            context.resetLogicalSpace();
            context.store().commit('range', value);
            return value;
        }
    },
    scale: {},
    smartTicks: {},
    store: {},
    title: {
        sanitization: (context, value) => mergeRecursive(context._title || {}, value)
    },
    labelManager: {},
    minTickDistance: {},
    valueParser: {
        defaultValue: val => val
    }
};
