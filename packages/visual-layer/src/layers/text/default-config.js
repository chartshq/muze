import { transformColor } from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    defClassName: 'layer-text',
    classPrefix: CLASSPREFIX,
    className: '',
    transform: {
        type: 'identity'
    },
    interaction: {
        highlight: {
            style: {
                fill: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    l: -15
                }, data, apply).color
            }
        },
        fade: {
            style: {
                fill: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    l: +15
                }, data, apply).color
            }
        },
        focus: {
            style: {
                fill: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    l: +15
                }, data, apply).color
            }
        }
    },
    crossline: false,
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    encoding: {
        color: {},
        size: {},
        radius: {},
        angle: {},
        text: {
            value: '',
            formatter: (val, i, data, context) => {
                const valueParser = context.valueParser();
                return valueParser(val);
            },
            background: {
                padding: 10
            }
        },
        rotation: {
            value: 0
        },
        'alignment-baseline': {
            value: 'middle'
        }
    },
    states: {
        highlight: {
            className: `${CLASSPREFIX}-layer-text-highlight`
        },
        fadeout: {
            className: `${CLASSPREFIX}-layer-text-fadeout`
        },
        selected: {
            className: `${CLASSPREFIX}-layer-text-selected`
        }
    }
};
