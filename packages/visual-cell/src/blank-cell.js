/**
 * This file declares a class that represents a BLANK element in a  table.
 * @module VisualCell
 */
import {
    selectElement,
    makeElement,
    applyStyle,
    generateGetterSetters
    } from 'muze-utils';
import SimpleCell from './simple-cell';
import { CLASSPREFIX, BLANK_CELL } from './enums/constants';
import { BLANK } from './enums/cell-type';
import { DEFAULT_CONFIG } from './enums/defaults';
import { PROPS } from './props';
import * as CONSTANTS from './constants';

/**
 * Represents a table haeder.
 *
 * @class BLANK
 */
class BlankCell extends SimpleCell {

    /**
     * Creates an instance of BLANK.
     * @param {Object} config The input configuration.
     * @memberof BLANK
     */
    constructor (config) {
        super(config);

        generateGetterSetters(this, PROPS[BLANK]);
    }

    /**
     * return the type pf SimpleCell cell.
     *
     * @readonly
     * @memberof BlankCell
     */
    get type () {
        return BLANK;
    }

    /**
     * This method return the value contained by this SimpleCell.
     *
     * @return {string} The text value contained by this cell.
     * @memberof BlankCell
     */
    valueOf () {
        return this.id;
    }

    /**
     * return the default configuration for the text cell
     *
     * @static
     * @return {Object} Default configuration of the cell
     * @memberof BlankCell
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

    /**
     * This method is used to return a unique identifier for
     * the BLANK cell.
     *
     * @return {string} The unique identifier for the BLANK.
     * @memberof BlankCell
     */
    get id () {
        return this._id;
    }

    static formalName () {
        return CONSTANTS.BLANK_CELL;
    }

    /**
     * This method is used to obtain a serialized representation of this instance.
     *
     * @return {Object} Object with serilizable props.
     * @memberof BLANK
     */
    serialize () {
        return {
            type: BLANK
        };
    }

    /**
     * This method return the space taken up
     * by the text with the style applied.
     *
     * @return {Object} width and height taken up by the text.
     * @memberof BLANK
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            return {
                width: this.width || 0,
                height: this.height || 0
            };
        }
        return this.logicalSpace();
    }

    /**
     * This method is used to set the available space.
     *
     * @param {number} width The available width.
     * @param {number} height The available height.
     * @return {Instance} Returns current Instance
     * @memberof BlankCell
     */
    setAvailableSpace (width, height) {
        this.availWidth(width);
        this.availHeight(height);
        this.logicalSpace(null);
        return this;
    }

    /**
     * This method is used to render the BLANK cell inside
     * the provided mount point.
     *
     * @param {HTMLElement} mount The mount point for this cell.
     * @return {Instance} Returns current Instance
     * @memberof BLANK
     */
    /* istanbul ignore next */render (mount) {
        if (mount) {
            const { style } = this.config();
            // append span element to mount point
            this.mount(mount);
            const container = selectElement(mount);
            const elem = makeElement(container, 'div', [this.id]);
            elem.classed(`${CLASSPREFIX}-${BLANK_CELL}`, true);
            elem.style('width', `${this.availWidth()}px`);
            elem.style('height', `${this.availHeight()}px`);
            elem.html('');
            // apply style on the returned element
            if (style) {
                applyStyle(elem, style);
            }
        } return this;
    }

    /**
     * Removes the cell(Disposal)
     *
     * @return {Instance} Returns current Instance
     * @memberof BlankCell
     */
    remove () {
        this.mount() && this.mount().remove();
        return this;
    }

    getMinMeasures () {
        return 0;
    }
 }
export default BlankCell;
