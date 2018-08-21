import { mergeRecursive, detectColor, hexToHsv, rgbToHsv } from 'muze-utils';
import { x11Colors } from './color-maps';
import { palette } from './defaults';

export const getHslString = hslArr => `hsla(${hslArr[0] * 360},${hslArr[1] * 100}%,${hslArr[2] * 100}%, 
    ${hslArr[3] || 1})`;

export const convertToXllString = baseString => (baseString.split(' ') || [])
                .reduce((x, e) => `${x}${e.charAt(0).toUpperCase()}${e.slice(1)}`, '');

export const PROPS = {
    config: {
        sanitization: (context, config) => {
            const defCon = mergeRecursive({}, context.constructor.defaultConfig());
            if (config.type === 'linear' && typeof config.interpolate !== 'boolean') {
                config.interpolate = true;
            }
            const newConfig = mergeRecursive(defCon, config);

            if (newConfig.scheme instanceof Array) {
                newConfig.scheme = newConfig.scheme.map((e, i) => {
                    let color = '';
                    if (typeof e === 'string') {
                        e = e.replace(/ /g, '');
                    }
                    if (detectColor(e) === 'hsl' || detectColor(e) === 'hsla') {
                        color = e.match(/(\d+(\.\d+)?)/g);
                        color = [color[0] / 360, color[1] / 100, color[2] / 100, color[3] || 1];
                    } else if (detectColor(e) === 'hex') {
                        color = hexToHsv(e);
                    } else if (detectColor(e) === 'rgb') {
                        const col = e.substring(e.indexOf('(') + 1, e.lastIndexOf(')')).split(/,\s*/);
                        color = rgbToHsv(...col);
                    } else if (x11Colors[convertToXllString(e)]) {
                        color = rgbToHsv(...x11Colors[convertToXllString(e)].rgb.split(','));
                    } else if (typeof e !== 'string' && !(e instanceof Array)) {
                        color = rgbToHsv(palette[i]);
                    } else {
                        color = e;
                    }
                    return color;
                });
            }
            return newConfig;
        }
    },
    domain: {},
    scale: {},
    uniqueValues: {}
};
