/**
 * This file exports variables that are used as defaults for
 * the placeholders
 */
import * as CONSTANTS from './constants';

 /**
 * Default Configuration for the cells
 * @return {Object} Default configuration
 */
export const DEFAULT_CONFIG = {
    [CONSTANTS.MARGIN]: {
        [CONSTANTS.LEFT]: 0,
        [CONSTANTS.RIGHT]: 0,
        [CONSTANTS.TOP]: 0,
        [CONSTANTS.BOTTOM]: 0
    },
    [CONSTANTS.SPACE_FIXER]: 2,
    [CONSTANTS.IS_OFFSET]: false,
    [CONSTANTS.VERTICAL_ALIGN]: null,
    [CONSTANTS.TEXT_ALIGN]: CONSTANTS.CENTER,
    [CONSTANTS.SHOW]: true,
    [CONSTANTS.MAX_LINES]: 0,
    [CONSTANTS.MIN_CHARS]: 0,
    [CONSTANTS.ROTATION]: null,
    [CONSTANTS.PADDING]: {
        [CONSTANTS.LEFT]: 8,
        [CONSTANTS.RIGHT]: 8,
        [CONSTANTS.TOP]: 10,
        [CONSTANTS.BOTTOM]: 0
    },
    [CONSTANTS.HEADER_PADDING]: {
        [CONSTANTS.LEFT]: 8,
        [CONSTANTS.RIGHT]: 5,
        [CONSTANTS.TOP]: 2,
        [CONSTANTS.BOTTOM]: 5
    },
    [CONSTANTS.TITLE_PADDING]: {
        [CONSTANTS.LEFT]: 0,
        [CONSTANTS.RIGHT]: 0,
        [CONSTANTS.TOP]: 0,
        [CONSTANTS.BOTTOM]: 0
    }
};
