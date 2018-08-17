import PartialField from './partial-field';
import { generateMeasureDomain, formatNumber } from '../utils';

/**
 * Represents measure field type.
 *
 * @extends PartialField
 */
class Measure extends PartialField {

    /**
     * Creates new Measure field instance.
     *
     * @param {string} name - The name of the field.
     * @param {Array} data - An array containing the field data.
     * @param {Object} schema - The schema for the field.
     */
    constructor(name, data, schema) {
        super(name, data, schema);
        this.fieldUnit = schema.unit;
        this.fieldScale = schema.scale;
        this.fieldDefAggFn = schema.defAggFn;
        this.fieldNumberformat = schema.numberFormat instanceof Function ? schema.numberFormat : formatNumber;
    }

    /**
     * Returns the domain for the measure field.
     *
     * @override
     * @return {Array} Returns min and max values from measure values.
     */
    domain() {
        return generateMeasureDomain(this.data);
    }

    /**
     * A hook which is called for every entry(cell) of the column.
     *
     * @todo Fix the null data e.g. NaN value.
     *
     * @param {*} val - The current entry present in the column while iteration.
     * @return {number | null} Returns the parsed number value of content of cell or null.
     */
    parse (val) {
        val = parseFloat(val, 10);
        return Number.isNaN(val) ? null : val;
    }

    /**
     * Getter for unit value of the field.
     *
     * @return {string} Returns unit of the field.
     */
    unit() {
        return this.fieldUnit;
    }

    /**
     * Getter for scale value of the field.
     *
     * @return {string} Returns scale of the field.
     */
    scale() {
        return this.fieldScale;
    }

    /**
     * Getter for number format value of the field.
     *
     * @return {string} Returns number format of the field.
     */
    numberFormat() {
        const formatter = this.fieldNumberformat;
        return val => formatter(val);
    }

    /**
     * Getter for aggregation function of the field.
     *
     * @return {Function} Returns aggregation function of the field.
     */
    defAggFn() {
        return this.fieldDefAggFn;
    }
}

export default Measure;
