import {
    ERROR_MSG,
    getUniqueId,
    mergeRecursive
} from 'muze-utils';
import { SIMPLE } from './enums/cell-type';
import { SIMPLE_CELL } from './constants';

/**
 * This file declares a class that is used as an interface to create new
 * SimpleCell elements.
 * @module SimpleCell
 */
/**
 * Base class for all table cells.
 *
 * @interface
 * @class SimpleCell
 */
class SimpleCell {

    /**
     * Creates an instance of SimpleCell.
     *
     * @param {*} config The input configuration.
     * @memberof SimpleCell
     */
    constructor (config) {
        this._id = getUniqueId();

        const defConfig = mergeRecursive({}, this.constructor.defaultConfig());
        this._config = mergeRecursive(defConfig, config || {});

        this._mount = null;
    }

    /**
     * Returns the type of the placehlder.
     *
     * @readonly
     * @memberof SimpleCell
     */
    get type () {
        return SIMPLE;
    }

    static formalName () {
        return SIMPLE_CELL;
    }

    /**
     * Returns the type of the placehlder.
     *
     * @readonly
     * @memberof SimpleCell
     * @return {Object} Default config for the placeholder
     */
    static defaultConfig () {
        return {};
    }

    /**
     * Returns the value contained by the SimpleCell.
     *
     * @memberof SimpleCell
     */
    valueOf () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns a unique identifier for the instance used
     * to control selective rendering.
     *
     * @memberof SimpleCell
     */
    id () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns a serialized representation of the instance.
     *
     * @memberof SimpleCell
     */
    serialize () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns an object with width and height fields
     * specifying the space taken up by this metod.
     *
     * @memberof SimpleCell
     */
    getLogicalSpace () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Method used to set the space available to render the SimpleCell
     *
     * @param {number} width The available width.
     * @param {number} height The available height.
     * @memberof SimpleCell
     */
    setAvailableSpace () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Render the SimpleCell inthe supplied mount point.
     *
     * @param {HTMLElement} mount The mount point to render in.
     * @memberof SimpleCell
     */
    render () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Render the SimpleCell inthe supplied mount point.
     *
     * @param {HTMLElement} mount The mount point to render in.
     * @memberof SimpleCell
     */
    remove () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    getMinMeasures (providedMinMeasure = 0) {
        return providedMinMeasure;
    }

}

export default SimpleCell;
