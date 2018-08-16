import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    defClassName: 'layer-point',
    className: '',
    classPrefix: CLASSPREFIX,
    defColorStyle: 'stroke',
    interaction: {
        highlight: [{
            type: 'fill',
            intensity: [0, 0, -20, 0]
        }],
        fade: [{
            type: 'fill',
            intensity: [0, -20, +20, 0]
        }, {
            type: 'stroke',
            intensity: [0, -20, +20, 0]
        }],
        focus: [{
            type: 'fill',
            intensity: [0, 0, +20, 0]
        },
        {
            type: 'stroke',
            intensity: [0, 0, +20, 0]
        }
        ]
    },
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
        color: { },
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
    scaleFactor: 100,
    shapes: ['circle', 'cross', 'diamond', 'square', 'star', 'wye', 'triangle'],
    sizes: [20, 30, 40, 50, 60, 70]
};
