import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    defClassName: 'layer-point',
    className: '',
    classPrefix: CLASSPREFIX,
    defColorStyle: 'stroke',
    interaction: {
        // TODO: change this to have stroke on highlight
        highlight: [{
            type: 'fill',
            intensity: [0, 0, +20, 0]
        }],
        fade: [{
            type: 'fill',
            intensity: [0, 0, +20, 0]
        }],
        focus: [{
            type: 'fill',
            intensity: [0, 0, +20, 0]
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
                    position: 'outside'
                }
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
        },
        interactions: {
            select: {
                stroke: {
                    value: 0
                },
                'stroke-width': {
                    value: 0
                }
            },
            highlight: {
                stroke: {
                    value: 0
                },
                'stroke-width': {
                    value: 0
                }
            }
        }
    },
    shapes: ['circle', 'cross', 'diamond', 'square', 'star', 'wye', 'triangle'],
    sizes: [20, 30, 40, 50, 60, 70]
};
