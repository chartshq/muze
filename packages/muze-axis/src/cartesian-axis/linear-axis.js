import SimpleAxis from './simple-axis';
import { BOTTOM, TOP, LEFT, RIGHT } from '../enums/axis-orientation';
import { LINEAR } from '../enums/scale-type';
import { DOMAIN } from '../enums/constants';
import { getTickLabelInfo } from './helper';

export default class LinearAxis extends SimpleAxis {

    /**
     *
     *
     * @param {*} range
     * @returns
     * @memberof LinearAxis
     */
    createScale (range) {
        let scale = super.createScale(range);
        scale = scale.nice();
        return scale;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof LinearAxis
     */
    static type () {
        return LINEAR;
    }

    getScaleValue (domainVal) {
        if (domainVal === null || domainVal === undefined) {
            return undefined;
        }

        return this.scale()(domainVal) + 0.5;
    }
 /**
     *
     *
     * @returns
     * @memberof SimpleAxis
     */
    getTickSize () {
        const {
            showInnerTicks,
            showOuterTicks
        } = this.config();
        const axis = this.axis();
        axis.tickSizeInner(showInnerTicks === false ? 0 : 6);
        axis.tickSizeOuter(showOuterTicks === false ? 0 : 6);
        return axis.tickSize();
    }

    /**
     *
     *
     * @param {*} d
     * @returns
     * @memberof SimpleAxis
     */
    domain (domain) {
        if (domain) {
            const { nice } = this.config();
            if (domain.length && domain[0] === domain[1]) {
                domain = [0, +domain[0] * 2];
            }
            this.scale().domain(domain);
            nice && this.scale().nice();
            this._domain = this.scale().domain();
            this.store().commit(DOMAIN, this._domain);
            return this;
        } return this._domain;
    }

    /**
     * This method is used to set the space availiable to render
     * the SimpleCell.
     *
     * @param {number} width The width of SimpleCell.
     * @param {number} height The height of SimpleCell.
     * @memberof AxisCell
     */
    setAvailableSpace (width = 0, height, padding, isOffset) {
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation,
            fixedBaseline,
        } = this.config();
        const { tickLabelDim } = this.getAxisDimensions();
        this.availableSpace({ width, height });

        if (orientation === TOP || orientation === BOTTOM) {
            const labelSpace = tickLabelDim.width;
            this.range([(fixedBaseline ? 0 : (labelSpace / 2)) + left, width - right - labelSpace / 2]);
            const axisHeight = this.getLogicalSpace().height;
            isOffset && this.config({ yOffset: Math.max(axisHeight, height) });
        } else {
            const labelSpace = tickLabelDim.height;
            this.range([height - bottom - (fixedBaseline ? 0 : (labelSpace / 2)), labelSpace / 2 + top]);
            const axisWidth = this.getLogicalSpace().width;
            isOffset && this.config({ xOffset: Math.max(axisWidth, width) });
        }
        return this;
    }

    /**
     *
     *
     * @param {*} tickValues
     * @returns
     * @memberof SimpleAxis
     */
    setTickValues () {
        const {
            tickValues
        } = this.config();
        const axis = this.axis();

        if (tickValues) {
            tickValues instanceof Array && this.axis().tickValues(tickValues);
            return this;
        }
        axis.tickValues(this.getTickValues());
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof SimpleAxis
     */
    getTickValues () {
        let numberOfValues;
        const {
            orientation,
            tickValues
        } = this.config();
        const range = this.range();
        const axis = this.axis();
        const ticks = axis.scale().ticks();
        const tickLength = ticks.length;
        const availableSpace = Math.abs(range[0] - range[1]);
        const labelProps = getTickLabelInfo(this).largestLabelDim;

        if (tickValues) {
            numberOfValues = tickValues;
        } else {
            numberOfValues = tickLength;
            let labelDim = labelProps.height;
            if (orientation === BOTTOM || orientation === TOP) {
                labelDim = labelProps.width;
            }
            if (tickLength * (labelDim * 1.5) > availableSpace) {
                numberOfValues = Math.floor(availableSpace / (labelDim * 1.25));
            }
        }

        if (numberOfValues < 1) {
            numberOfValues = 1;
        }
        return axis.scale().ticks(numberOfValues);
    }

    /**
     * Sets a fixed baseline for the first ticks so that they can render effectively within
     * the given area
     *
     * @param {*} tickText
     * @param {*} config
     * @param {*} labelManager
     */
    setFixedBaseline (tickText) {
        const {
            orientation,
            labels
        } = this.config();
        const {
            rotation
        } = labels;
        const axis = this.axis();
        const labelManager = this.dependencies().labelManager;

        labelManager.setStyle(this._tickLabelStyle);
        axis.tickTransform((d, i) => {
            const { width: shiftWidth, height: shiftHeight } = labelManager.getOriSize(d);
            if (i === 0 && (orientation === LEFT || orientation === RIGHT)) {
                return `translate(0, -${(shiftHeight) / 3}px)`;
            }
            if (i === 0 && (orientation === TOP || orientation === BOTTOM) && rotation === 0) {
                return `translate(${orientation === TOP ? shiftWidth / 2 : shiftWidth / 2}px,  ${0}px)
                    rotate(${rotation}deg)`;
            } return '';
        });
        return tickText;
    }

}
