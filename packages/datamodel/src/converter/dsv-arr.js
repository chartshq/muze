import { columnMajor } from '../utils';

/**
 * Parses and converts data formatted in DSV array to a manageable internal format.
 *
 * @param {Array.<Array>} arr - A 2D array containing of the DSV data.
 * @param {Object} options - Option to control the behaviour of the parsing.
 * @param {boolean} [options.firstRowHeader=true] - Whether the first row of the dsv data is header or not.
 * @return {Array} Returns an array of headers and column major data.
 * @example
 *
 * // Sample input data:
 * const data = [
 *    ["a", "b", "c"],
 *    [1, 2, 3],
 *    [4, 5, 6],
 *    [7, 8, 9]
 * ];
 */
function DSVArr (arr, options) {
    const defaultOption = {
        firstRowHeader: true,
    };
    options = Object.assign({}, defaultOption, options);

    let header;
    const columns = [];
    const push = columnMajor(columns);

    if (options.firstRowHeader) {
        // If header present then mutate the array.
        // Do in-place mutation to save space.
        header = arr.splice(0, 1)[0];
    } else {
        header = [];
    }

    arr.forEach(field => push(...field));

    return [header, columns];
}

export default DSVArr;
