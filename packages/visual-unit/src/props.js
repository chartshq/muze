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
    fields: {},
    metaInf: {},
    registry: {},
    width: {},
    height: {},
    parentContainerInf: {},
    valueParser: {
        defaultValue: val => val
    }
};
