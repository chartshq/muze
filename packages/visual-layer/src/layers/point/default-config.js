import { transformColor } from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    defClassName: 'layer-point',
    className: '',
    classPrefix: CLASSPREFIX,
    defColorStyle: 'stroke',
    interaction: {
        highlight: {
            className: 'highlight-class',
            style: {
                stroke: 'black',
                'stroke-width': '1px'
                // fill: 'red'
            },
            strokePosition: 'center'
        },
        focusStroke: {
            className: 'focus-stroke-class',
            style: {
                stroke: 'black',
                'stroke-width': '1px'
            },
            strokePosition: 'outside'
        },
        commonDoubleStroke: {
            style: {
                stroke: 'black',
                'stroke-width': '2px'
            },
            strokePosition: 'outside'
        },
        brushStroke: {
            className: 'brush-stroke-class',
            style: {
                stroke: 'black',
                'stroke-width': '1px'
                // fill: 'blue'
            },
            strokePosition: 'outside'
        },
        doubleStroke: {
            style: {
                stroke: 'black',
                'stroke-width': '2px'
            },
            strokePosition: 'outside'
        },
        fade: {
            style: {
                fill: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    a: -0.5
                }, data, apply).color
            }
        },
        focus: {
            style: {
                fill: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    a: -0.5
                }, data, apply).color
            }
        }
    },
    innerPadding: 0.1,
    nearestPointThreshold: 5,
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
            value: '#000'
        },
        'stroke-width': {
            value: 0
        },
        fill: {},
        shape: {
            value: 'circle'
        },
        x: {},
        y: {},
        'stroke-opacity': {
            value: 1
        },
        'fill-opacity': {
            value: 0.5
        },
        strokePosition: {
            value: 'center'
        },
        interaction: {
            anchors: 'highlight',
            'persistent-anchors': 'focusStroke',
            'brush-anchors': 'brushStroke'
        }
    },
    shapes: ['circle', 'cross', 'diamond', 'square', 'star', 'wye', 'triangle'],
    sizes: [20, 30, 40, 50, 60, 70]
};
