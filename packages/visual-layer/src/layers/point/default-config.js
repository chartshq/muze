import { CLASSPREFIX } from '../../enums/constants';
import { transformColor } from 'muze-utils';

export const defaultConfig = {
    defClassName: 'layer-point',
    className: '',
    classPrefix: CLASSPREFIX,
    defColorStyle: 'stroke',
    interaction: {
        highlight: {
            // className: 'highlight-class',
            style: {
                stroke: 'black',
                'stroke-width': (v) => {
                    const unit = parseInt(v, 10);
                    return '0.5px';
                    // return `${unit + 1}px`;
                },
                fill: 'red'
            },
            strokePosition: 'center'
        },
        focusStroke: {
            // className: 'focus-stroke-class',
            style: {
                stroke: 'black',
                'stroke-width': '2px',
                fill: 'blue'
            },
            strokePosition: 'outside'
        },
        // focus: {
        //     style: {
        //         fill: (fillColor, datum, colorAxis, apply) => {
        //             const newHexColor = transformColor(fillColor, {
        //                 l: apply ? +20 : -20
        //             }, datum, colorAxis, 'focus', 'fill');
        //             return newHexColor;
        //         }
        //     }
        // }
        fade: {
            style: {
                fill: (hexColor, datum, apply) => {
                    return apply ? 'black' : hexColor;
                    // const newHexColor = transformColor(hexColor, {
                    //     l: +20
                    // }, datum, apply);
                    // return newHexColor;
                }
            }
        }
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
            value: null
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
        strokeOpacity: {
            value: 0.5
        },
        fillOpacity: {
            value: 0.5
        },
        interaction: {
            anchors: 'highlight',
            'persistent-anchors': 'focusStroke'
        }
    },
    shapes: ['circle', 'cross', 'diamond', 'square', 'star', 'wye', 'triangle'],
    sizes: [20, 30, 40, 50, 60, 70]
};
