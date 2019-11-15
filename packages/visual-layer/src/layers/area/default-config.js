import { CLASSPREFIX, STACK } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-area',
    className: '',
    interpolate: 'linear',
    transform: {
        type: STACK
    },
    interaction: {
        focus: [{
            type: 'fill',
            intensity: [0, 0, 0, -0.5]
        }],
        fade: [{
            type: 'fill',
            intensity: [0, 0, 0, -0.5]
        }]
    },
    crossline: true,
    nearestPointThreshold: 10,
    encoding: {
        color: {},
        x: {},
        y: {},
        y0: {},
        strokeOpacity: {
            value: 1
        },
        fillOpacity: {
            value: 0.5
        }
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    connectNullData: false
};
