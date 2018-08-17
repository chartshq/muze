import { extend2 } from '../utils';

 /**
  * The base class for every field type.
  * It provides some common functionalities.
  */
class PartialField {

    /**
     * Sets basic setups to each Field instance.
     *
     * @param {string} name - The name or identifier of the field.
     * @param {Array} data - The data array.
     * @param {Object} schema - The schema of the data type.
     */
    constructor(name, data, schema) {
        this.name = name;
        this.data = data || [];
        this.schema = schema;
        this.fieldDescription = schema.description;
        this.fieldType = schema.type;
        this.sanitize();
    }

    /**
     * Sanitizes the field data.
     *
     * @return {PartialField} - Returns the instance of the current context for chaining.
     */
    sanitize () {
        this.data = this.data.map(d => this.parsed(this.parse(d)));
        return this;
    }

    /**
     * The post parsing hook for field instance.
     *
     * @param {*} val - The value to be parsed.
     * @return {*} Returns the parsed value.
     */
    parsed (val) {
        return val;
    }

    /**
     * Generates and returns the domain for the field.
     *
     * @abstract
     */
    domain() {
        throw new Error('Not yet implemented!');
    }

    subType() {
        return null;
    }


    /**
     * Parse the input value before using.
     *
     * @abstract
     */
    parse () {
        throw new Error('Not yet implemented!');
    }

    /**
     * Creates brand new copy of current field instance. To avoid optimization issue
     * pass the required data otherwise current data would be copied which might
     * be expensive.
     *
     * @param {Array} data - The input data, if provided current data will not be cloned.
     * @return {PartialField} Returns the cloned field instance.
     */
    clone(data) {
        data = data || extend2([], this.data);
        const schema = extend2({}, this.schema);
        // Here call the constructor to create an instance of
        // the current field class type e.g. Measure, Dimension etc.
        return new this.constructor(this.name, data, schema);
    }

    /**
     * @return {string} Name of the field
     */
    fieldName() {
        return this.name;
    }

     /**
     * @return {string} Type of the field
     */
    type() {
        return this.fieldType;
    }

    /**
     * @return {description} Name of the field
     */
    description() {
        return this.fieldDescription;
    }
}

export default PartialField;
