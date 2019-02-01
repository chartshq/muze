import { getSymbol } from 'muze-utils';
import {
    CENTER,
    LEFT,
    RIGHT
} from '../enums/constants';

export const ALIGN = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

export const DEFAULT_MEASUREMENT = {
    height: 30,
    width: 30,
    maxWidth: Infinity,
    maxHeight: Infinity,
    padding: 2,
    margin: 2,
    border: 1
};

export const LEGEND_TITLE = {
    text: '',
    orientation: (pos) => {
        if (pos === LEFT || pos === RIGHT) {
            return LEFT;
        } return CENTER;
    }
};

export const DEFAULT_CONFIG = {
    classPrefix: 'muze',
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0)',
    formatter: {
        bounds: {
            lower: 'less than',
            upper: 'more than'
        }
    },
    item: {
        text: {
            orientation: 'right',
            width: 10,
            formatter: (val, i, data, context) => context.valueParser()(val)
        },
        icon: {
            className: 'legend-icon',
            height: 20,
            width: 20,
            color: 'rgba(0,0,0,.5)',
            type: 'square'
        }
    }
};

/**
 * Creates a map of pre defined icons
 *
 * @param {string} icon Accepts a icon name like 'square', 'cross', 'diamond' etc
 * @return {Object} icon object which can be used to draw the icons
 */
export const ICON_MAP = (icon) => {
    if (icon && typeof (icon) === 'string') {
        return getSymbol(icon);
    } return icon;
};
