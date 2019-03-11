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
    minSpacing: {},
    source: {}
};

const geomProps = {
    data: {},
    caption: {},
    config: {},
    axes: {},
    facetByFields: {},
    fields: {},
    transform: {},
    layerDef: {},
    detailFields: {}
};

const textProps = {
    smartText: {}
};
export const PROPS = {
    [GEOM]: mergeRecursive(geomProps, DEFAULT_PROPS),
    [TEXT]: mergeRecursive(textProps, DEFAULT_PROPS),
    [AXIS]: DEFAULT_PROPS,
    [BLANK]: DEFAULT_PROPS
};
