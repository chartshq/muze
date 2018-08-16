import { CLASSPREFIX, STACK } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-area',
    className: '',
    interpolate: 'linear',
    transform: {
        type: STACK
    },
    nearestPointThreshold: 10,
    encoding: {
        color: {},
        x: {},
        y: {},
        y0: {},
        strokeOpacity: {
            value: 1
        }
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    connectNullData: false,
    states: {
        highlight: {
            className: 'layer-area-highlight'
        },
        fadeout: {
            className: 'layer-area-fadeout'
        },
        selected: {
            className: 'layer-area-selected'
        }
    }
};
