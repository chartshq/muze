import {
    LINEAR
} from '../enums/constants';
/**
 * Set of default colors
 */
export const palette = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
];

export const DEFAULT_GRADIENT_COLOR = '#eaeaea';

export const DEFAULT_CONFIG = {
    range: palette,
    value: palette[0],
    step: false,
    stops: 5,
    type: LINEAR
};
