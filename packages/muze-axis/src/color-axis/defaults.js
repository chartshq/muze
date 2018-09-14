import {
    LINEAR
} from '../enums/constants';
/**
 * Set of default colors
 */
export const palette = [
    '#086bb6',
    '#f37d45',
    '#f5ce02',
    '#67bda0',
    '#c54e4e',
    '#ae70af'
];

export const DEFAULT_GRADIENT_COLOR = '#eaeaea';

export const DEFAULT_CONFIG = {
    range: palette,
    value: palette[0],
    step: false,
    stops: 5,
    type: LINEAR
};
