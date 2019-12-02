import { MUZE_PREFIX } from '../constants';

export const TITLE_CONFIG = {
    position: 'top',
    align: 'left',
    padding: 4,
    className: `${MUZE_PREFIX}-title-container`
};

export const SUB_TITLE_CONFIG = {
    position: 'top',
    align: 'left',
    padding: 16,
    maxLines: 2,
    className: `${MUZE_PREFIX}-subtitle-container`
};

export const MESSAGE_CONFIG = {
    className: `${MUZE_PREFIX}-message-container`,
    baseFontLimit: 16,
    upperFontLimit: 24,
    baseSizeLimit: 100,
    upperSizeLimit: 300,
    fractionImage: 0.8,
    fractionChild: 0.7
};

export const CANVAS = 'canvas';
