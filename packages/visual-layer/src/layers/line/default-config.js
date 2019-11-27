import { transformColor } from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';

export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'layer-line',
    className: '',
    interpolate: 'linear',
    transform: {
        type: 'group'
    },
    interaction: {
        fade: {
            style: {
                stroke: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    a: -0.5
                }, data, apply).color
            }
        },
        focus: {
            style: {
                stroke: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    a: -0.5
                }, data, apply).color
            }
        },
        brushStroke: {
            style: {
                stroke: (rgbaValues, data, apply) => transformColor(rgbaValues, {
                    a: -0.5
                }, data, apply).color
            }
        }
    },
    crossline: true,
    nearestPointThreshold: 20,
    encoding: {
        color: {},
        x: {},
        y: {},
        strokeOpacity: {
            value: 1
        },
        fillOpacity: {
            value: 0
        },
        strokeWidth: {
            value: '2px'
        }
    },
    transition: {
        effect: 'cubic',
        duration: 1000
    },
    connectNullData: false,
    nullDataLineStyle: {},
    nullDataLineClass: 'null'
};
