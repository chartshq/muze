import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, DETAIL, LAYERS, TRANSFORM, CONFIG } from '../enums/constants';

export const PROPS = {
    alias: {},
    data: {},
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
    registry: {
        sanitization: (context, value) => {
            if (context.resolver) {
                context.resolver().registry(value.cellRegistry);
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
