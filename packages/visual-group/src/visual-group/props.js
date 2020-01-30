import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, DETAIL, LAYERS, TRANSFORM, CONFIG } from '../enums/constants';

export const PROPS = {
    alias: {},
    data: {
        preset: (context) => {
            context._prevData = null;
        }
    },
    cornerMatrices: {
        defaultValue: {
            topLeft: [],
            topRight: [],
            bottomLeft: [],
            bottomRight: []
        }
    },
    groupType: {},

    metaData: {
        defaultValue: {
            border: {}
        }
    },
    placeholderInfo: {
        defaultValue: {}
    },
    resolver: {},
    valueParser: {
        defaultValue: val => val
    },
    registry: {
        sanitization: (context, value) => {
            if (context.resolver) {
                context.resolver().registry({
                    cells: value.cellRegistry,
                    VisualUnit: value.VisualUnit
                });
            }
            return value;
        }
    },
    selection: {},
    [CONFIG]: {},
    [ROWS]: {},
    [COLUMNS]: {},
    [COLOR]: {},
    [SHAPE]: {},
    [SIZE]: {},
    [DETAIL]: {},
    [LAYERS]: {},
    [TRANSFORM]: {}
};
