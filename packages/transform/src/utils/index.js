import {
    stack as d3Stack,
    stackOffsetDiverging,
    stackOrderNone,
    stackOrderAscending,
    stackOrderDescending
} from 'd3-shape';

import { nest } from 'd3-collection';

const stackOrders = {
        none: stackOrderNone,
        ascending: stackOrderAscending,
        descending: stackOrderDescending
    },
    stackOffsets = {
        diverging: stackOffsetDiverging
    },
    // eslint-disable-next-line require-jsdoc
    stack = params => d3Stack().keys(params.keys).offset(stackOffsets[params.offset])
                    .order(stackOrders[params.order])(params.data),
    /**
     * Groups the data into a hierarchical tree structure based on one or more fields.
     * @param { Object } params Configuration properties for nesting data
     * @param { Array.<Array> } params.data Data which needs to be grouped
     * @param { Array.<number> } params.keys Field indices by which the data will be grouped
     * @return { Array.<Object> } Grouped data array
     */
    nestCollection = (params) => {
        const nestFn = nest();
        params.keys.forEach(key => nestFn.key(d => d[key]));
        return nestFn.entries(params.data);
    };

export {
    stack,
    nestCollection
};
