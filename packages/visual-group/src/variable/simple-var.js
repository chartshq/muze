import Variable from './variable';

/**
 *
 *
 * @export
 * @class Vars
 * @extends {Variable}
 */
export default class SimpleVariable extends Variable {

    /**
     *Creates an instance of Vars.
     * @param {*} text
     * @memberof Vars
     */
    constructor (text) {
        super();
        this.oneVar(text);
    }

    /**
     *
     *
     * @param {*} params
     * @returns
     * @memberof Vars
     */
    oneVar (...oneV) {
        if (oneV.length) {
            this._oneVar = oneV[0];
            return this;
        }
        return this._oneVar;
    }

    /**
     *
     *
     * @param {*} dm
     * @returns
     * @memberof Vars
     */
    data (...dm) {
        if (dm.length) {
            this._data = dm[0];
            return this;
        }
        return this._data;
    }

    /**
     *
     *
     * @returns
     * @memberof Vars
     */
    toString () {
        return this.oneVar();
    }

    /**
     *
     *
     * @memberof SimpleVariable
     */
    numberFormat () {
        const uid = this.data().getFieldsConfig()[this.oneVar()].index;
        const formatter = this.data().getFieldspace().fields[uid]._ref;

        return this.type() === 'measure' ? formatter.numberFormat() : val => val;
    }

    /**
     *
     *
     * @returns
     * @memberof Vars
     */
    getMembers () {
        return [this.oneVar()];
    }

    /**
     *
     *
     * @returns
     * @memberof Vars
     */
    type () {
        const fieldDef = this.data().getFieldsConfig()[this.oneVar()].def;
        return fieldDef.type;
    }

    /**
     *
     *
     * @returns
     * @memberof Vars
     */
    subtype () {
        const fieldDef = this.data().getFieldsConfig()[this.oneVar()].def;
        return fieldDef.subtype || fieldDef.type;
    }

    /**
     *
     *
     * @returns
     * @memberof SimpleVariable
     */
    getMinDiff () {
        const fieldSpace = this.data().getFieldspace();
        return fieldSpace.fieldsObj()[this.oneVar()].getMinDiff();
    }
}
