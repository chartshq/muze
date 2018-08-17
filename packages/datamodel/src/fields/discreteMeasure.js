// import { DimensionSubtype } from 'muze-utils';
import Measure from './measure';

/**
 * Represents categorical field subtype.
 *
 * @extends Measure
 */
class DiscreteMeasure extends Measure {
    constructor(name, data, schema, bin) {
        super(name, data, schema);
        this.bin = bin;
        this.subtype = 'discrete';
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

    bins() {
        return this.bin;
    }
    subType() {
        return this.subtype;
    }
}

export default DiscreteMeasure;
