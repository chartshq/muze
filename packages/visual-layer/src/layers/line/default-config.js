import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-line',
    className: '',
    interpolate: 'linear',
    transform: {
        type: 'group'
    },
    interaction: {
        fade: {
            style: {
                // alpha -0.5
                stroke: 'black'
            }
        },
        focus: {
            style: {
                // alpha -0.5
                stroke: 'black'
            }
        },
        focusStroke: {
            style: {
                stroke: 'black',
                'stroke-width': '2px'
            },
            strokePosition: 'inside'
        }
    },
    crossline: true,
    nearestPointThreshold: 20,
    encoding: {
        color: {},
        x: {},
        y: {},
        strokeOpacity: {
            value: 1
        }
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    connectNullData: false,
    nullDataLineStyle: {},
    nullDataLineClass: 'null'
};
