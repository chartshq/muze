import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-bar',
    className: '',
    interaction: {
        highlight: {
            style: {
                stroke: 'black',
                'stroke-width': '1px'
            },
            strokePosition: 'outside'
        },
        fade: {
            style: {
                // L +15
                fill: 'black'
            }
        },
        focus: {
            style: {
                // L +15
                fill: 'black'
            }
        },
        focusStroke: {
            style: {
                stroke: 'black',
                'stroke-width': '2px'
            },
            strokePosition: 'outside'
        }
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
        y0: {}
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
