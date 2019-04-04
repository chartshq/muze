import { FACET_BY_FIELDS, RETINAL_FIELDS, PARENT_ALIAS, LAYERS, CACHED_DATA } from './enums/constants';
import { mergeRecursive } from 'muze-utils';

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
        sanitization: (context, value) => {
            return mergeRecursive({
                x: [],
                y: []
            }, value);
        }
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
