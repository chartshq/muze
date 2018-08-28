import Variable from './variable';

/**
 *
 *
 * @class ComposeVars
 * @extends {Variable}
 */
class ComposedVars extends Variable {

    /**
     *Creates an instance of ComposeVars.
     * @param {*} texts
     * @memberof ComposeVars
     */
    constructor (...texts) {
        super(...texts);
        this.vars(texts);
    }

    /**
     *
     *
     * @param {*} params
     * @returns
     * @memberof ComposeVars
     */
    vars (...params) {
        if (params.length) {
            this._vars = params[0];
            return this;
        }
        return this._vars;
    }

    /**
     *
     *
     * @param {*} dm
     * @returns
     * @memberof ComposeVars
     */
    data (...dm) {
        if (dm.length) {
            this.vars().forEach(d => d.data(dm[0]));
            return this;
        }
        return this._data;
    }

    /**
     *
     *
     * @returns
     * @memberof ComposeVars
     */
    getMembers () {
        const vars = this.vars();
        return vars.map(member => member.getMembers()[0]);
    }

    /**
     *
     *
     * @returns
     * @memberof ComposeVars
     */
    type () {
        return this.vars()[0].type();
    }

    /**
     *
     *
     * @returns
     * @memberof ComposeVars
     */
    toString () {
        return this.vars().map(d => d.toString()).join(',');
    }

    /**
     *
     *
     * @returns
     * @memberof ComposeVars
     */
    numberFormat () {
        return this.vars()[0].numberFormat();
    }

    /**
     *
     *
     * @returns
     * @memberof ComposedVars
     */
    subtype () {
        return this.vars()[0].subtype();
    }

    /**
     *
     *
     * @returns
     * @memberof ComposedVars
     */
    getMinDiff () {
        return this.vars()[0].getMinDiff();
    }
}

export default ComposedVars;
