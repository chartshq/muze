import { mergeRecursive } from 'muze-utils';
import { FACET_BY_FIELDS, RETINAL_FIELDS, PARENT_ALIAS, CACHED_DATA } from './enums/constants';

export const PROPS = {
    [FACET_BY_FIELDS]: {
        onset: (context, facets) => {
            const facetKeys = facets[0].reduce((acc, v, i) => {
                acc[`${v}`] = facets[1][i];
                return acc;
            }, {});
            context.facetFieldsMap(facetKeys);
        }
    },
    facetFieldsMap: {},
    [RETINAL_FIELDS]: {},
    [PARENT_ALIAS]: {},
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
    parentContainerInf: {},
    valueParser: {
        defaultValue: val => val
    },
    coord: {}
};
