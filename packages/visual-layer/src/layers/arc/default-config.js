import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-arc',
    padding: { top: 1, bottom: 1, left: 1, right: 1 },
    className: '',
    minOuterRadius: 10,
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
            intensity: [0, 0, +15, 0]
        }]
    },
    height: 100,
    width: 100,
    sort: '',
    cornerRadius: 0,
    padAngle: 0,
    padRadius: 0,
    startAngle: 0,
    endAngle: 360,
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
    innerRadiusFixer: 10,
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

