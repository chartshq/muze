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
        fade: {
            style: {
                'fill-opacity': 0.7
            }
        },
        focus: {
            style: {
                'fill-opacity': 0.7
            }
        },
        brushStroke: {
            style: {
                'fill-opacity': 0.7
            }
        }
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
            value: 0.3
        }
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    connectNullData: false
};
