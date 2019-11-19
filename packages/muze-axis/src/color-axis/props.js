import { mergeRecursive, detectColor, hexToHsv, rgbToHsv, defaultValue } from 'muze-utils';
import { x11Colors } from './color-maps';
import { palette, DEFAULT_GRADIENT_COLOR, DEFAULT_CONFIG } from './defaults';
import { LINEAR, RGB, HEX, HSL, HSLA } from '../enums/constants';

export const getHslString = hslArr => `hsla(${hslArr[0] * 360},${hslArr[1] * 100}%,${hslArr[2] * 100}%,\
${hslArr[3] || 1})`;

export const convertToXllString = baseString => (baseString.split(' ') || [])
                .reduce((x, e) => `${x}${e.charAt(0).toUpperCase()}${e.slice(1)}`, '');

export const getActualHslColor = (e, paletteColor) => {
    let color = '';
    if (typeof e === 'string') {
        e = e.replace(/ /g, '');
        e = e.toLowerCase();
        if (detectColor(e) === HSL || detectColor(e) === HSLA) {
            color = e.match(/(\d+(\.\d+)?)/g);
            color = [color[0] / 360, color[1] / 100, color[2] / 100, defaultValue(Number(color[3]), 1)];
        } else if (detectColor(e) === HEX) {
            color = hexToHsv(e);
        } else if (detectColor(e) === RGB) {
            const col = e.substring(e.indexOf('(') + 1, e.lastIndexOf(')')).split(/,\s*/);
            color = rgbToHsv(...col);
        } else if (x11Colors[convertToXllString(e)]) {
            color = rgbToHsv(...x11Colors[convertToXllString(e)].rgb.split(','));
        }
    } else if (!(e instanceof Array)) {
        color = rgbToHsv(paletteColor);
    } else {
        color = e;
    }
    return color;
};

export const PROPS = {
    config: {
        sanitization: (context, config) => {
            const defCon = mergeRecursive({}, context.constructor.defaultConfig());
            if (config.type === LINEAR) {
                config.range = config.range || [defCon.range[0]];
                config.range = config.range.length > 1 ? config.range : [DEFAULT_GRADIENT_COLOR, ...config.range];
            }
            const oldConfig = mergeRecursive(defCon, context.config());
            const newConfig = mergeRecursive(oldConfig, config);

            if (newConfig.range instanceof Array) {
                newConfig.range = newConfig.range.map((e, i) => getActualHslColor(e, palette[i]));
                newConfig.stops = config.stops ?
                                    config.stops :
                                    config.range && config.range.length > 2 ?
                                             config.range.length :
                                                DEFAULT_CONFIG.stops;
            }
            newConfig.value = getActualHslColor(newConfig.value, newConfig.value);
            return newConfig;
        }
    },
    domain: {},
    scale: {},
    uniqueValues: {}
};
