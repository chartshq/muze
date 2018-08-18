import {
    stack as d3Stack,
    stackOffsetDiverging,
    stackOrderNone,
    stackOrderAscending,
    stackOrderDescending,
    stackOffsetNone,
    stackOffsetExpand,
    stackOffsetWiggle
} from 'd3-shape';
import { nest } from 'd3-collection';
import * as STACK_CONFIG from '../enums/stack-config';

const stackOrders = {
    [STACK_CONFIG.ORDER_NONE]: stackOrderNone,
    [STACK_CONFIG.ORDER_ASCENDING]: stackOrderAscending,
    [STACK_CONFIG.ORDER_DESCENDING]: stackOrderDescending
};
const stackOffsets = {
    [STACK_CONFIG.OFFSET_DIVERGING]: stackOffsetDiverging,
    [STACK_CONFIG.OFFSET_NONE]: stackOffsetNone,
    [STACK_CONFIG.OFFSET_EXPAND]: stackOffsetExpand,
    [STACK_CONFIG.OFFSET_WIGGLE]: stackOffsetWiggle
};
// eslint-disable-next-line require-jsdoc
const stack = params => d3Stack().keys(params.keys).offset(stackOffsets[params.offset])
                .order(stackOrders[params.order])(params.data);
/**
 * Groups the data into a hierarchical tree structure based on one or more fields.
 * @param { Object } params Configuration properties for nesting data
 * @param { Array.<Array> } params.data Data which needs to be grouped
 * @param { Array.<number> } params.keys Field indices by which the data will be grouped
 * @return { Array.<Object> } Grouped data array
 */
const nestCollection = (params) => {
    const nestFn = nest();
    params.keys.forEach(key => nestFn.key(d => d[key]));
    return nestFn.entries(params.data);
};

export {
    stack,
    nestCollection
};
