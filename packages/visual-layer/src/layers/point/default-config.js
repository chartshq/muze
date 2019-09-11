import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    defClassName: 'layer-point',
    className: '',
    classPrefix: CLASSPREFIX,
    defColorStyle: 'stroke',
    interaction: {
        highlight: [{
            type: 'stroke',
            intensity: [0, 0, 0, +1]
        }],
        fade: [{
            type: 'fill',
            intensity: [0, 0, +20, 0]
        }],
        focus: [{
            type: 'fill',
            intensity: [0, 0, +20, 0]
        }
        ]
    },
    innerPadding: 0.1,
    nearestPointThreshold: 10,
    transform: {
        type: 'identity'
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    encoding: {
        size: {
            value: 30
        },
        color: {},
        stroke: {
            value: 'hsla(0,0%,0%,0)'
        },
        fill: {},
        shape: {
            value: 'circle'
        },
        x: {},
        y: {},
        strokeOpacity: {
            value: 0.5
        },
        fillOpacity: {
            value: 0.5
        }
    },
    shapes: ['circle', 'cross', 'diamond', 'square', 'star', 'wye', 'triangle'],
    sizes: [20, 30, 40, 50, 60, 70]
};
