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
        // fade: [{
        //     type: 'stroke',
        //     intensity: [0, 0, 0, -0.5]
        // }],
        focus: [{
            type: 'stroke',
            intensity: [0, 0, 0, -0.5]
        }],
        focusStroke: [
            {
                type: 'stroke',
                props: {
                    value: 'black'
                }
            }, {
                type: 'stroke-width',
                props: {
                    value: 2,
                    position: 'inside'
                }
            }
        ]
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
