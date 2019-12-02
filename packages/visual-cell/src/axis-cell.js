/**
 * This file declares a class that represents a table cell
 * used to house an axis.
 * @module VisualCell
 */
import { selectElement, makeElement, generateGetterSetters } from 'muze-utils';
import { CLASSPREFIX, HEIGHT, WIDTH, AXIS_CELL, BOTTOM, TOP } from './enums/constants';
import SimpleCell from './simple-cell';
import { DEFAULT_CONFIG } from './enums/defaults';
import { AXIS } from './enums/cell-type';
import { PROPS } from './props';
import * as CONSTANTS from './constants';

/**
 * Computes the logical space of the an axis instance within an axis cell
 *
 * @param {Object} context Required to get the needed parameters to compute axis space
 * @return {Object} Returns the logical space for axis
 */
const computeAxisSpace = (context) => {
    let logicalWidth;
    let logicalHeight;
    const axis = context.source();
    const {
        spaceFixer,
        margin
    } = context.config();
    const {
        width,
        height
    } = axis.getLogicalSpace();
    const {
            show
        } = axis.config();
    if (show === true) {
        logicalHeight = Math.floor(height + margin.top + margin.bottom + spaceFixer);
        logicalWidth = Math.floor(width + margin.left + margin.right + spaceFixer);
    } else {
        [logicalWidth, logicalHeight] = [width, height];
    }
    return {
        width: logicalWidth,
        height: logicalHeight
    };
};

/**
 * Represents an axis cell.
 *
 * @class Axis
 */
class AxisCell extends SimpleCell {

    /**
     * Creates an instance of AxisCell.
     *
     * @param {Object} config The input config.
     * @memberof AxisCell
     */
    constructor (config) {
        super(config);

        this._axis = null;
        this._availHeight = null;
        this._availWidth = null;
        this._logicalSpace = null;

        generateGetterSetters(this, PROPS[AXIS]);
    }

    /**
     * return the type pf SimpleCell cell.
     *
     * @readonly
     * @memberof AxisCell
     */
    get type () {
        return AXIS;
    }

    /**
     * This method return the value conatined by this SimpleCell.
     *
     * @return {SimpleAxis | ColorAxis} Instance of SimpleAxis or ColorAxis.
     * @memberof AxisCell
     */
    valueOf () {
        return this.source().id;
    }

    /**
     * This method return the unique identififer of the axis
     *
     * @return {string} Id of the axis.
     * @memberof AxisCell
     */
    get id () {
        return this._id;
    }

    static formalName () {
        return CONSTANTS.AXIS_CELL;
    }

    /**
     * Retrns the serialized representation of this cell.
     *
     * @return {Object}Object with serializable props.
     * @memberof AxisCell
     */
    serialize () {
        return {
            type: AXIS,
            axis: this.source().serialize()
        };
    }

    /**
     * return the default configuration for the text cell
     *
     * @static
     * @return {Object} Default configuration of the cell
     * @memberof AxisCell
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

    /**
     * return the space taken up by an axis element in the dom.
     *
     * @return {Object} Object with width and height fields.
     * @memberof AxisCell
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            this.logicalSpace(computeAxisSpace(this));
        }
        return this.logicalSpace();
    }

    /**
     * This method is used to set the space availiable to render
     * the SimpleCell.
     *
     * @param {number} width The width of SimpleCell.
     * @param {number} height The height of SimpleCell.
     * @return {Instance} Returns current Instance
     * @memberof AxisCell
     */
    setAvailableSpace (width, height) {
        this.availWidth(width);
        this.availHeight(height);
        const {
            margin,
            isOffset
        } = this.config();

        if (width || height) {
            this.source().setAvailableSpace(width, height, margin, isOffset);
            this.source().logicalSpace(null);
        } else {
            this.source().resetLogicalSpace();
        }
        this.logicalSpace(null);
        return this;
    }

    /**
     * This method is used to render the axis inside the axis cell.
     *
     * @param {HTMLElement} mount The mount point.
     * @return {Selection} node where axis mounted
     * @memberof AxisCell
     */
    /* istanbul ignore next */render (mount) {
        if (!mount) {
            return this;
        }
        let actualWidth = 0;
        let actualHeight = 0;
        const axis = this.source();
        const availHeight = this.availHeight();
        const availWidth = this.availWidth();
        const {
            margin
        } = this.config();
        const {
            top,
            bottom,
            left,
            right
        } = margin;
        const {
            show,
            orientation
        } = axis.config();
        const wrapperDiv = makeElement(selectElement(mount), 'div', [this], `${CLASSPREFIX}-${AXIS_CELL}`);
        const selection = makeElement(wrapperDiv, 'svg', [1], `${CLASSPREFIX}-axis-container`);
        selection.classed(`${CLASSPREFIX}-axis-container-${orientation}`, true);

        this.mount(mount);
        if (!availWidth) {
            selection.attr(WIDTH, `${0}px`);
        }
        if (!availHeight) {
            selection.attr(HEIGHT, `${0}px`);
        }
        actualWidth = availWidth;
        actualHeight = availHeight;
        if (!show) {
            actualWidth = (orientation === TOP || orientation === BOTTOM) ? availWidth : 0;
            actualHeight = (orientation === TOP || orientation === BOTTOM) ? 0 : availHeight;
        }
        wrapperDiv.style(WIDTH, `${actualWidth}px`)
                        .style(HEIGHT, `${actualHeight}px`)
                        .style('margin-top', top)
                        .style('margin-bottom', bottom)
                        .style('margin-left', left)
                        .style('margin-right', right);

        axis.mount(selection.node());
        return selection;
    }

    /**
     * Disposes the cell
     *
     * @return {Instance} Current instance of AxisCell
     * @memberof AxisCell
     */
    remove () {
        this.source() && this.source().remove();
        this.mount() && this.mount().remove();
        return this;
    }
}

export default AxisCell;

