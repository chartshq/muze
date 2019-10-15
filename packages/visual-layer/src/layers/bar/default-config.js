import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-bar',
    className: '',
    interaction: {
        highlight: [{
            type: 'fill',
            intensity: [0, 0, -15, 0]
        }],
        fade: [{
            type: 'fill',
            intensity: [0, 0, +15, 0]
        }],
        focus: [{
            type: 'fill',
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
                    position: 'outside'
                }
            }
        ]
    },
    transform: {
        type: 'stack'
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    innerPadding: 0.1,
    encoding: {
        color: {},
        x: {},
        y: {},
        x0: {},
        y0: {},
        stroke: {
            value: 0
        },
        'stroke-width': {
            value: 0
        }
    },
    states: {
        highlight: {
            className: `${CLASSPREFIX}-layer-bar-highlight`
        },
        fadeout: {
            className: `${CLASSPREFIX}-layer-bar-fadeout`
        },
        selected: {
            className: `${CLASSPREFIX}-layer-bar-selected`
        }
    }
};
