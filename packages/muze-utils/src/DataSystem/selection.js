import { defaultValue } from '../common-utils';

const sortSelection = (dataObjects, updateData, sortFn) =>
    (a, b) => {
        const kA = a[0];
        const kB = b[0];
        return sortFn([a[0], dataObjects.get(kA), updateData.get(kA)], [kB, dataObjects.get(kB), updateData.get(kB)]);
    };

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
    constructor (idGetter) {
        this._dataObjects = new Map();
        this._updateData = new Map();
        this._enterData = new Map();
        this._exitData = new Map();
        this._idGetter = idGetter;
    }

    /**
     * This method is used to supply seed data to a selection.
     *
     * @param {Array} newData Seed data to create the enter selection.
     * @param {Functon | undefined } idGetter This function is used to uniqely identify a data entry.
     * @return {Selection} Modified selection.
     * @memberof Selection
     */
    data (newData) {
        const entryData = new Map();
        const exitdata = new Map();
        const tempMap = new Map();
        const duplicateData = new Map();
        const updatedData = this._updateData;
        const idGetter = this._idGetter;

        newData.forEach((...params) => {
            const key = idGetter ? idGetter(...params) : params[1];
            if (!tempMap.has(key)) {
                tempMap.set(key, params[0]);
            } else {
                duplicateData.push(key, params[0]);
            }
        });

        let val;
        // prepare enter data
        let entries = tempMap.entries();
        while (val = entries.next().value) {
            if (!updatedData.has(val[0])) {
                entryData.set(val[0], val[1]);
            } else {
                updatedData.set(val[0], val[1]);
            }
        }
        // prepare exit data
        entries = updatedData.entries();
        while (val = entries.next().value) {
            if (!tempMap.has(val[0])) {
                exitdata.set(val[0], val[1]);
            }
        }

        // put duplicate data to exit list
        entries = duplicateData.entries();
        while (val = entries.next().value) {
            exitdata.set(val[0], val[1]);
        }

        const newSelection = new Selection(this._idGetter);
        newSelection._updateData = updatedData;
        newSelection._dataObjects = this._dataObjects;
        newSelection._enterData = entryData;
        newSelection._exitData = exitdata;

        return newSelection;
    }

    /**
     * Applies the supplied callback to each data element
     * and returns a new selection.
     *
     * @param {Function} callback Callback to execute on each item.
     * @return {Selection} New selection with data created using callback.
     * @memberof Selection
     */
    append (callback) {
        let val;
        const dataObjects = new Map();
        const data = new Map();
        const mode = defaultValue(this._mode, 'update');
        const currentData = this[`_${mode}Data`];
        const entries = currentData.entries();

        while (val = entries.next().value) {
            dataObjects.set(val[0], callback(val[1]));
            data.set(val[0], val[1]);
        }

        const newSelection = new Selection(this._idGetter);
        newSelection._updateData = data;
        newSelection._dataObjects = dataObjects;

        return newSelection;
    }

     /**
     * This method returns an enter selection that
     * allows or update operations.
     *
     * @return {Selection} Instance of enter selection.
     * @memberof Selection
     */
    enter () {
        this._mode = 'enter';
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
        return this;
    }

     /**
     * This method merges the data of one selection with another.
     *
     * @param {Selection} selection Instance of selection.
     * @return {Selection} Modified selection.
     * @memberof Selection
     */
    merge (target) {
        const mergedObjects = new Map();
        const mergedData = new Map();
        let val;
        let entries;

        // merge Object and data present in this selection
        entries = this._updateData.entries();
        while (val = entries.next().value) {
            if (!this._exitData.has(val[0])) {
                mergedData.set(val[0], val[1]);
                mergedObjects.set(val[0], this._dataObjects.get(val[0]));
            }
        }

        // merge object from target selection
        entries = target._updateData.entries();
        while (val = entries.next().value) {
            if (!(mergedData.has(val[0]) || target._exitData.has(val[0]))) {
                mergedData.set(val[0], val[1]);
                mergedObjects.set(val[0], target._dataObjects.get(val[0]));
            }
        }

        const newSelection = new Selection(this._idGetter);
        newSelection._updateData = mergedData;
        newSelection._dataObjects = mergedObjects;

        return newSelection;
    }

    each (fn) {
        let val;
        const entries = this._dataObjects.entries();

        while (val = entries.next().value) {
            fn(val[1], this._updateData.get(val[0]), val[0]);
        }
    }

    map (fn) {
        const newdata = new Map();
        let val;
        const entries = this._dataObjects.entries();

        while (val = entries.next().value) {
            newdata.set(val[0], fn(val[1], this._updateData.get(val[0]), val[0]));
        }
        const newSelection = new Selection(this._idGetter);
        newSelection._updateData = this._updateData;
        newSelection._dataObjects = newdata;

        return newSelection;
    }

    remove () {
        const mode = defaultValue(this._mode, 'update');
        const currentData = this[`_${mode}Data`];

        currentData.clear();

        return this;
    }

    sort (sortFn) {
        const updateData = this._updateData;
        const dataObjects = this._dataObjects;
        const sortSel = sortSelection(dataObjects, updateData, sortFn);

        this._updateData = new Map([...updateData.entries()].sort(sortSel));
        this._dataObjects = new Map([...dataObjects.entries()].sort(sortSel));
        return this;
    }

    /**
     *  Gets the object bound to a class
     *
     * @return {Object} current data set bound to the class
     * @memberof Selection
     */
    getObjects () {
        let val;
        const objects = [];
        const dataObjects = this._dataObjects;
        // select the data to create object
        const mode = defaultValue(this._mode, 'update');
        const currentData = this[`_${mode}Data`];
        const entries = currentData.entries();

        while (val = entries.next().value) {
            if (dataObjects.has(val[0])) {
                objects.push(dataObjects.get(val[0]));
            }
        }

        return objects;
    }
}

export default Selection;
