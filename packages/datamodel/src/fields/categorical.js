import { DimensionSubtype } from 'muze-utils';
import Dimension from './dimension';

/**
 * Represents categorical field subtype.
 *
 * @extends Dimension
 */
class Categorical extends Dimension {

    /**
     * Creates new Categorical field instance.
     *
     * @param {string} name - The name of the field.
     * @param {Array} data - An array containing the field data.
     * @param {Object} schema - The schema for the field.
     */
    constructor(name, data, schema) {
        super(name, data, schema);
        this.subtype = DimensionSubtype.CATEGORICAL;
    }

    /**
     * Getter for subType value of the field.
     *
    * @return {string} Returns subType of the field.
    */
    subType() {
        return this.subtype;
    }
}

export default Categorical;
