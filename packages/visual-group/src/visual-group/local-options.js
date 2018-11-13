import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, DETAIL, LAYERS, TRANSFORM, CONFIG } from '../enums/constants';

/**
 * This is the local options semantics based on which setters getters are created and reactivity is initiated.
 * This local object is only valid for Artboard.
 * Artboard merges global and local object both to the model
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
 * @module
 */

export default {
    [CONFIG]: {},
    [ROWS]: {},
    [COLUMNS]: {},
    [COLOR]: {},
    [SHAPE]: {},
    [SIZE]: {},
    [DETAIL]: {},
    [LAYERS]: {},
    [TRANSFORM]: {}
};
