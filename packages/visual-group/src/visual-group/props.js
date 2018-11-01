import { DATA_UPDATE_COUNTER } from '../enums/defaults';

export const PROPS = {
    alias: {},
    data: {
        sanitization: (context, value) => {
            if (context._data !== value) {
                const store = context.store();
                let hasDataUpdated = store.get(DATA_UPDATE_COUNTER);
                store.commit(DATA_UPDATE_COUNTER, ++hasDataUpdated);
            }
            return value;
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
    registry: {
        sanitization: (context, value) => {
            if (context.resolver) {
                context.resolver().registry(value.cellRegistry);
            }
            return value;
        }
    },
    selection: {},
    store: {}
};
