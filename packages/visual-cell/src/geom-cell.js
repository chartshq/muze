/**
 * This file declares a class that is used to represent a table cell
 * that houses a visual unit.
 * @module VisualCell
 */

import { selectElement, makeElement, generateGetterSetters } from 'muze-utils';
import SimpleCell from './simple-cell';
import { GEOM } from './enums/cell-type';
import { PROPS } from './props';
import {
    CLASSPREFIX, HEIGHT, WIDTH, DATA, AXES, FACET_BY_FIELDS, FIELDS, TRANSFORM, LAYER_DEF, CONFIG, GEOM_CELL,
    DETAIL_FIELDS
} from './enums/constants';
import * as CONSTANTS from './constants';
import { DEFAULT_CONFIG } from './enums/defaults';

/**
 * Calculates the logical space of the cell
 *
 * @param {Object} context Required to get the needed parameters to compute unit space
 * @return {Object} Logical space taken up by the unit
 * @memberof GeomCell
 */
const computeGeomSpace = (context) => {
    const config = context.source().config();
    const { width, height } = config;
    return {
        width: Math.ceil(width),
        height: Math.ceil(height + context.getCaptionSpace().height)
    };
};

 /**
 * This class represents a SimpleCell for visual unit.
 *
 * @class GeomCell
 */
class GeomCell extends SimpleCell {

    /**
     * Creates an instance of GeomCell.
     * @param {Object} config The input configuration.
     * @memberof GeomCell
     */
    constructor (config) {
        super(config);

        this._unit = null;
        this._layers = null;
        this._axes = {};
        this._datamodel = {};
        this._facetByFields = {};
        this._fields = null;
        this._transform = null;
        this._caption = null;

        generateGetterSetters(this, PROPS[GEOM]);
    }

    /**
     * return the type pf SimpleCell cell.
     *
     * @readonly
     * @memberof GeomCell
     */
    get type () {
        return GEOM;
    }

    /**
     * This method return the value contained by this cell.
     *
     * @return {VisualUnit} Instance of visual unit contained by visual unit.
     * @memberof GeomCell
     */
    valueOf () {
        return this.source();
    }

    /**
     * This method is used to return the id of the
     * visual unit housed by this cell.
     *
     * @return {string} The unique id of the visual unit.
     * @memberof GeomCell
     */
    get id () {
        return this.source().id();
    }

    static formalName () {
        return CONSTANTS.GEOM_CELL;
    }

    /**
     * This method return a serialized representation of
     * this instance.
     *
     * @return {Object} Object with serializable props.
     * @memberof GeomCell
     */
    serialize () {
        return {
            type: GEOM,
            unit: this.source().serialize(),
            caption: this.caption()
        };
    }

    /**
     * return the default configuration for the geom cell
     *
     * @static
     * @return {Object} Default configuration of the cell
     * @memberof GeomCell
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

    /**
     * Updates the model based on the changed parameters
     *
     * @return {Instance} return instance
     * @memberof GeomCell
     */
    updateModel () {
        const unit = this.source();
        unit.clearCaching();
        [LAYER_DEF, TRANSFORM, AXES, FIELDS, CONFIG, DATA, AXES, FACET_BY_FIELDS, DETAIL_FIELDS].forEach((prop) => {
            this[prop]() && unit[prop](this[prop]());
        });
        return this;
    }

    /**
     * It gives the space taken by the caption of the unit
     *
     * @return {Object} return the space taken by caption
     * @memberof GeomCell
     */
    getCaptionSpace () {
        const caption = this.caption();

        let captionSpace = { width: 0, height: 0 };
        if (caption) {
            captionSpace = caption.getLogicalSpace();
        }
        return captionSpace;
    }

    /**
     * return the space taken up by the element in the dom.
     *
     * @return {Object} Object with width and height fields.
     * @memberof GeomCell
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            this.logicalSpace(computeGeomSpace(this));
        }
        return this.logicalSpace();
    }

    /**
     * This method is used to set the space available to
     * render the SimpleCell.
     *
     * @param {number} width The available width.
     * @param {number} height The available height.
     * @return {Instance} Returns current Instance
     * @memberof GeomCell
     */
    setAvailableSpace (width, height) {
        const unit = this.source();

        this.availWidth(width);
        this.availHeight(height);
        unit.lockModel()
            .width(width).height(height - this.getCaptionSpace().height)
            .unlockModel();
        this.logicalSpace(null);
        return this;
    }

    /**
     * his method is used to render the visual unit inside the provided cell.
     *
     * @param {HTMLElement} mount The mountpoint in the table.
     * @return {Instance} Returns current Instance
     * @memberof GeomCell
     */
    render (mount) {
        if (mount) {
            this.mount(mount);
            const availHeight = this.availHeight();
            const availWidth = this.availWidth();
            const caption = this.caption();
            const wrapperDiv = makeElement(selectElement(mount), 'div', [1], `${CLASSPREFIX}-${GEOM_CELL}`);

            if (caption) {
                const captionDom = makeElement(wrapperDiv, 'div', [caption], `${CLASSPREFIX}-unit-caption`).node();
                caption.render(captionDom);
            }
            const selection = makeElement(wrapperDiv, 'div', [1], `${CLASSPREFIX}-unit`);
            wrapperDiv.style(WIDTH, `${availWidth}px`).style(HEIGHT, `${availHeight}px`);
            selection.style(WIDTH, `${availWidth}px`)
                            .style(HEIGHT, `${availHeight - this.getCaptionSpace().height}px`);
            this.source().mount(selection.node());
        }
        return this;
    }

    /**
     * Disposes the cell
     *
     * @return {Object} Current instance
     * @memberof GeomCell
     */
    remove () {
        this.mount() && this.mount().remove();
        this.source().remove();
        return this;
    }
}

export default GeomCell;
