import { dsvFormat as d3Dsv } from 'd3-dsv';
import DSVArr from './dsv-arr';

/**
 * Parses and converts data formatted in DSV string to a manageable internal format.
 *
 * @todo Support to be given for https://tools.ietf.org/html/rfc4180.
 * @todo Sample implementation https://github.com/knrz/CSV.js/.
 *
 * @param {string} str - The input DSV string.
 * @param {Object} options - Option to control the behaviour of the parsing.
 * @param {boolean} [options.firstRowHeader=true] - Whether the first row of the dsv string data is header or not.
 * @param {string} [options.fieldSeparator=","] - The separator of two consecutive field.
 * @return {Array} Returns an array of headers and column major data.
 * @example
 *
 * // Sample input data:
 * const data = `
 * a,b,c
 * 1,2,3
 * 4,5,6
 * 7,8,9
 * `
 */
function DSVStr (str, options) {
    const defaultOption = {
        firstRowHeader: true,
        fieldSeparator: ','
    };
    options = Object.assign({}, defaultOption, options);

    const dsv = d3Dsv(options.fieldSeparator);
    return DSVArr(dsv.parseRows(str), options);
}

export default DSVStr;
