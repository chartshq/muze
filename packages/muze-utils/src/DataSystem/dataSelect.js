import Selection from './selection';
/**
 * This function applies a selection operation on a data array.
 *
 * @export
 * @param {Array} [data=[]] The data array to be observed.
 * @return {Selection} Instance of a selection.
 */
export default function dataSelect (idFn) {
    return new Selection(idFn);
}

