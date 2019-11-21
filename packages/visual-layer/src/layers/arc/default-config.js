import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-arc',
    padding: { top: 1, bottom: 1, left: 1, right: 1 },
    className: '',
    interaction: {
        highlight: {
            style: {
                // L -15
                fill: 'black'
            }
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
        }
    },
    height: 100,
    width: 100,
    sort: '',
    colors: ['#F44336', 'blue', 'green', 'yellow', 'orange', 'purple'],
    transform: {
        type: 'identity'
    },
    encoding: {
        'stroke-width': {
            value: '2px'
        },
        'stroke-linejoin': {
            value: 'round'
        },
        angle: {
            value: '1'
        },
        radius: {
            value: '1'
        },
        opacity: {
            value: '1'
        },
        color: {
            value: '1'
        },
        shape: {
            value: '1'
        },
        size: {
            value: '1'
        }
    },
    transition: {
        effect: 'cubic',
        duration: 500
    },
    states: {
        highlight: {
            className: `${CLASSPREFIX}-layer-arc-highlight`
        },
        fadeout: {
            className: `${CLASSPREFIX}-layer-arc-fadeout`
        },
        selected: {
            className: `${CLASSPREFIX}-layer-arc-selected`
        }
    }
};

