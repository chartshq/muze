import { mergeRecursive } from 'muze-utils';
import {
    ROWS,
    COLUMNS,
    COLOR,
    SHAPE,
    SIZE,
    DETAIL,
    LAYERS,
    TRANSFORM,
    TITLE,
    SUB_TITLE
} from '../constants';
import { TITLE_CONFIG, SUB_TITLE_CONFIG } from './defaults';
/**
 * This is the local options semantics based on which setters getters are created and reactivity is initiated.
 * This local object is only valid for Canvas.
 * Canvas merges global and local object both to the model
 *
 * Format
 *  PROPERTRY_NAME: {
 *      value: // default value of the property,
 *      meta: {
 *          typeCheck: // The setter value will be checked using this. If the value is function then the setter value
 *                     // is passed as args.
 *          typeExpected: // The output of typecheck action will be tested against this. Truthy value will set the
 *                       // value to the setter
 *          sanitizaiton: // Need for sanitization before type is checked
 *      }
 *  }
 *
 * @module LocalOptions
 */

export const localOptions = {
    [ROWS]: {
        value: null,
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Array'
        }
    },
    [COLUMNS]: {
        value: null,
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Array'
        }
    },
    [COLOR]: {
        value: null,
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Object',
            sanitization: (config) => {
                if (typeof config === 'string' || !config) {
                    return {
                        field: config
                    };
                }
                return config;
            }
        }
    },
    [SHAPE]: {
        value: null,
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Object',
            sanitization: (config) => {
                if (typeof config === 'string' || !config) {
                    return {
                        field: config
                    };
                }
                return config;
            }
        }
    },
    [SIZE]: {
        value: null,
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Object',
            sanitization: (config) => {
                if (typeof config === 'string' || !config) {
                    return {
                        field: config
                    };
                }
                return config;
            }
        }
    },
    [DETAIL]: {
        value: [],
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Array'
        }
    },

    [LAYERS]: {
        value: [],
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Array'
        }
    },
    [TRANSFORM]: {
        value: null,
        meta: {
            typeCheck: 'constructor',
            typeExpected: 'Object'
        }
    }
};

export const canvasOptions = {
    [TITLE]: {
        value: [null, null],
        meta: {
            takesMultipleParams: true,
            typeCheck: ([arg1, arg2]) => typeof arg1 === 'function' && typeof arg2 === 'object',
            sanitization: ([title, titleConfig]) => {
                let t = title;
                if (typeof title === 'string' || !title) {
                    t = () => title;
                }
                const defConfig = mergeRecursive({}, TITLE_CONFIG);
                return [t, mergeRecursive(defConfig, titleConfig)];
            }
        }
    },
    [SUB_TITLE]: {
        value: [null, null],
        meta: {
            takesMultipleParams: true,
            typeCheck: ([arg1, arg2]) => typeof arg1 === 'function' && typeof arg2 === 'object',
            sanitization: ([subtitle, subtitleConfig]) => {
                let sub = subtitle;
                if (typeof subtitle === 'string' || !subtitle) {
                    sub = () => subtitle;
                }
                const defConfig = mergeRecursive({}, SUB_TITLE_CONFIG);
                return [sub, mergeRecursive(defConfig, subtitleConfig)];
            }
        }
    }
};
