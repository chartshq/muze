import PartialField from './partial-field';
import { uniqueValues } from '../utils';

/**
 * Represents dimension field type.
 *
 * @extends PartialField
 */
class Dimension extends PartialField {

    /**
     * Returns the domain for the dimension field.
     *
     * @override
     * @return {Array} Returns the unique values from dimension values.
     */
    domain() {
        return uniqueValues(this.data);
    }

    /**
     * A hook which is called for every entry(cell) of the column.
     *
     * @todo Fix the null data e.g. undefined or null etc.
     *
     * @param {*} val - The current entry present in the column while iteration.
     * @return {string} Returns the string representation of the value.
     */
    parse (val) {
        val = (val === undefined || val === null) ? '' : val.toString();
        return val.trim();
    }

    /**
     * Saves the cardinality of the dimensional values after parsing the data.
     *
     * @param {string} val - The parsed value.
     * @return {string} Returns the input val.
     */
    parsed (val) {
        this._unique = this._unique || {};
        const unique = this._unique;
        if (val in unique) {
            unique[val]++;
        } else {
            unique[val] = 1;
        }
        return val;
    }
}

export default Dimension;
