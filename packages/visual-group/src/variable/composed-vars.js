import Variable from './variable';

/**
 * This is a wrapper on top of multiple variables which are of same type but they are shown in the same axis.This is
 * required in case of range plots or ohlc plots where one plot is mapped to multiple measure fields. At that time,
 * we need to create a composed variable from multiple variables. This class just wraps them into one variable instance
 * and provides methods to get the type and other common functionalities which can be performed on a simple variable
 * instance.
 *
 * @public
 * @class ComposeVars
 */
class ComposedVars extends Variable {

    /**
     * Creates an instance of ComposeVars.
     *
     * @param {Array} vars Array of SimpleVars.
     */
    constructor (...vars) {
        super();
        this.vars(vars);
    }

    vars (...params) {
        if (params.length) {
            this._vars = params[0];
            return this;
        }
        return this._vars;
    }

    data (...dm) {
        if (dm.length) {
            this.vars().forEach(d => d.data(dm[0]));
            this._data = dm[0];
            return this;
        }
        return this._data;
    }

    /**
     * Get all the field names from composed variable instance.
     *
     * @public
     * @return {Array} Array of field names.
     */
    getMembers () {
        const vars = this.vars();
        return vars.map(member => member.getMembers()[0]);
    }

    /**
     * Type of field associated with this composed variable.
     *
     * @return {string} Type of variable (Measure/Dimension).
     */
    type () {
        return this.vars()[0].type();
    }

    toString () {
        return this.vars().map(d => d.toString()).join(',');
    }

    /**
     * Returns the number formatter function of the variable.
     *
     * @return {Function} Number formatter function of the variable.
     */
    numberFormat () {
        return this.vars()[0].numberFormat();
    }

    format (values) {
        return this.vars()[0].format(values);
    }

    getSchemaDef () {
        return this.data().getFieldsConfig()[this.vars()[0]].def;
    }

    /**
     * Returns the subtype of the fields associated with this variable instance.
     *
     * @public
     * @return {string} Subtype of the variable.
     */
    subtype () {
        return this.vars()[0].subtype();
    }

    /**
     * Returns the consecutive minimum difference of the field values.
     *
     * @public
     * @return {number} Minimum consecutive difference.
     */
    getMinDiff () {
        return this.vars()[0].getMinDiff();
    }

    /**
     * Returns the display name of the fields.
     *
     * @return {string} returns the display name.
     */
    displayName () {
        return this.vars().map(d => d.displayName()).join(',');
    }
}

export default ComposedVars;
