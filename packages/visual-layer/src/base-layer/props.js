import { COORD_TYPES } from 'muze-utils';

const { CARTESIAN } = COORD_TYPES;
export const props = {
    axes: {},
    mount: {},
    measurement: {},
    metaInf: {},
    data: {},
    config: {},
    valueParser: {
        defaultValue: val => val
    },
    coord: {
        defaultValue: CARTESIAN
    }
};
