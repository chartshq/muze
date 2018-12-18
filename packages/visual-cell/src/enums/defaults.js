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
    [CONSTANTS.ROTATION]: null
};
