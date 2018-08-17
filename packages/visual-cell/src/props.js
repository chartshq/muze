
import { mergeRecursive } from 'muze-utils';
import { GEOM, TEXT, AXIS, BLANK } from './enums/cell-type';

const DEFAULT_PROPS = {
    mount: {},
    availHeight: {},
    availWidth: {},
    config: {
        sanitization: (context, value) => mergeRecursive(context._config, value)
    },
    logicalSpace: {},
    source: {}
};

let geomProps = {
    data: {},
    caption: {},
    config: {},
    axes: {
        sanitization: (context, value) => Object.assign(context._axes, value)
    },
    facetByFields: {},
    fields: {},
    transform: {},
    layerDef: {}
};

export const PROPS = {
    [TEXT]: DEFAULT_PROPS,
    [GEOM]: mergeRecursive(geomProps, DEFAULT_PROPS),
    [AXIS]: DEFAULT_PROPS,
    [BLANK]: DEFAULT_PROPS,
};
