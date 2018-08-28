import { getUniqueId } from '../index';
/**
 * Represents the base class that all objects that form
 * the data for a selection must inherit from.
 *
 * @class DataObject
 */
class DataObject {
/**
 * Creates an instance of DataObject.
 * @memberof DataObject
 */
    constructor () {
        this._id = getUniqueId();
    }
    /**
     * Returns the id.
     *
     * @readonly
     * @memberof DataObject
     */
    get id () {
        return this._id;
    }

    /**
     * Sets the value corresponding to supplied key.
     *
     * @param {string} key The property name.
     * @param {any} value Value associated with prop.
     * @memberof DataObject
     */
    attr (key, value) {
        this[key] = value;
    }

    /**
     * Clean up code to be executed by each object.
     *
     * @override
     * @memberof DataObject
     */
    remove () {
        // cleanup
    }
}

export default DataObject;
