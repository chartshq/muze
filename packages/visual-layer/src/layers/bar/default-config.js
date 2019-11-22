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
            strokePosition: 'center'
        },
        focusStroke: {
            className: 'focus-stroke-class',
            style: {
                stroke: 'black',
                'stroke-width': '2px'
                // fill: 'blue'
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
        }
        // fade: {
        //     style: {
        //         // L +15
        //         fill: 'black'
        //     }
        // },
        // focus: {
        //     style: {
        //         // L +15
        //         fill: 'black'
        //     }
        // }
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
            value: '#000'
        },
        strokeWidth: {
            value: '0px'
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
