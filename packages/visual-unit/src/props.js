import { mergeRecursive } from 'muze-utils';
import { FACET_BY_FIELDS, RETINAL_FIELDS, PARENT_ALIAS, LAYERS, CACHED_DATA } from './enums/constants';

export const PROPS = {
    [FACET_BY_FIELDS]: {},
    [RETINAL_FIELDS]: {},
    [PARENT_ALIAS]: {},
    [LAYERS]: {},
    [CACHED_DATA]: {},
    detailFields: {},
    axes: {
        defaultValue: {
            x: [],
            y: []
        }
    },
    fields: {
        defaultValue: {
            x: [],
            y: []
        },
        sanitization: (context, value) => mergeRecursive({
            x: [],
            y: []
        }, value)
    },
    metaInf: {},
    registry: {},
    width: {},
    height: {},
    parentContainerInf: {},
    valueParser: {
        defaultValue: val => val
    },
    coord: {}
};
