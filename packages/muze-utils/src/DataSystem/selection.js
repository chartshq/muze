/**
 * This class represents a selection applied on a data array.
 *
 * @class Selection
 */
class Selection {
    /**
     * Creates an instance of Selection.
     * @param {Array<DataObject>} data Array of DataObjects.
     * @memberof Selection
     */
    constructor () {
        this._data = [];
        // // map of id to data
        this._idMap = {};
        this._dataMap = {};
        this._mode = '';
        // data.forEach((item, idx) => {
        //     const index = item.id || idx;
        //     this._idMap[index] = item;
        // });
        // // array to store data in enter phase
        this._enterdata = [];
        // // array to store data in exit phase
        this._exitdata = [];
    }
    /**
     *  Gets the object bound to a class
     *
     * @return {Object} current data set bound to the class
     * @memberof Selection
     */
    getObjects () {
        return Object.values(this._idMap);
    }

    /**
     * This method is used to supply seed data to a selection.
     *
     * @param {Array} newData Seed data to create the enter selection.
     * @param {Functon | undefined } idGetter This function is used to uniqely identify a data entry.
     * @return {Selection} Modified selection.
     * @memberof Selection
     */
    data (newData, idGetter) {
        if (idGetter) {
            this._data = [];
            this._idGetter = idGetter;
            const tempMap = {};

            newData.forEach((...params) => {
                const index = idGetter(...params);
                tempMap[index] = params[0];
            });
            // check if any data items have been removed
            const purgedIds = [];

            Object.keys(this._idMap).forEach((id) => {
                if (!tempMap[id]) {
                    purgedIds.push(id);
                }
            });

            Object.keys(tempMap).forEach((id) => {
                if (!this._idMap[id]) {
                    this._enterdata.push(tempMap[id]);
                } else {
                    this._idMap[id] = tempMap[id];
                    this._data.push(tempMap[id]);
                }
            });
            // move the purged items to exit selection
            purgedIds.forEach((id) => {
                const purged = this._idMap[id];
                this._exitdata.push(purged);
                // this._data = this._data.slice(id, 1);
                delete this._idMap[id];
            });
            // this._data = this._data.slice(temp, this._data.length);

            return this;
        }
        // no id getter supplied so use indices
        if (newData.length > this._data.length) {
            const startIdx = this._data.length;
            for (let i = startIdx; i < newData.length; i += 1) {
                this._enterdata.push(newData[i]);
            }
        } else {
            // push to exit selection
            const temp = newData.length;
            for (let i = temp; i < this._data.length; i += 1) {
                const purged = this._data[i];
                delete this._idMap[purged.id];
                this._exitdata.push(purged);
            }
            this._data = this._data.slice(temp, this._data.length);
        }
        return this;
    }

    /**
     * Applies the supplied callback to each data element
     * and returns a new selection.
     *
     * @param {Function} callback Callback to execute on each item.
     * @return {Selection} New selection with data created using callback.
     * @memberof EnterSelection
     */
    append (callback) {
        this[`_${this._mode}data`].forEach((...params) => {
            const data = params[0];
            const id = this._idGetter ? this._idGetter(...params) : (data.id || params[1]);
            this._idMap[id] = callback(...params);
            this._dataMap[id] = data;
        });
        this._mode = '';
        return this;
    }

    /**
     * This method returns an enter selection that
     * allows or update operations.
     *
     * @return {EnterSelection} Instance of enter selection.
     * @memberof Selection
     */
    enter () {
        this._mode = 'enter';
        return this;
        // return new EnterSelection(this._enterdata, this._idMap, this._idGetter);
    }

    /**
     * This method is used to set key value pairs
     * on data objects.
     *
     * @param {string} key Name of property.
     * @param {any} value Value of property.
     * @return {Selection} Modified selection.
     * @memberof Selection
     */
    attr (key, value) {
        this._data.forEach(item => item.attr(key, value));
        return this;
    }

    /**
     * This method merges the data of one selection with another.
     *
     * @param {Selection} selection Instance of selection.
     * @return {Selection} Modified selection.
     * @memberof Selection
     */
    merge (selection) {
        selection._data.forEach((...params) => {
            const id = this._idGetter ? this._idGetter(...params) : (params[0].id || params[1]);
            this._idMap[id] = params[0];
            this._data.push(params[0]);
        });
        // reset enter selection
        this._enterdata = [];
        return this;
    }

    /**
     * Returns a selection with exit data.
     *
     * @return {Selection} Instance of selection.
     * @memberof Selection
     */
    exit () {
        this._mode = 'exit';
        // const exitdata = this._exitdata;
        // const exitSelection = new Selection(exitdata);
        // this._exitdata = [];
        return this;
    }

    each (fn) {
        Object.keys(this._idMap).forEach((e, i) => {
            fn(this._idMap[e], this._dataMap[e], i);
        });
        return this;
    }

    map (fn) {
        Object.keys(this._idMap).forEach((...params) => {
            const key = params[0];
            this._idMap[key] = fn(this._idMap[key], ...params, this._dataMap[key]);
        });
        return this;
    }

    /**
     * Executes the cleanup operation associated with data objets.
     *
     * @memberof Selection
     */
    remove () {
        // do cleanup on DDO's
        const data = this[`_${this._mode}data`];

        data.forEach(item => item.remove());
        if (this._mode === '') {
            this.each(e => e.remove());
        }
        this[`_${this._mode}data`] = [];
        this._mode = '';
    }
}

export default Selection;
