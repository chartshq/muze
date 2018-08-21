import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { BOTTOM, TOP, LEFT, RIGHT } from '../enums/axis-orientation';
import { LINEAR, LOG } from '../enums/scale-type';
import { DOMAIN } from '../enums/constants';
import {
    getTickLabelInfo,
    getNumberOfTicks,
    sanitizeDomain
} from './helper';

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
     * This method is used to assign a domain to the axis.
     *
     * @param {Array} domain the domain of the scale
     * @memberof LinearAxis
     */
    updateDomainBounds (domain) {
        let currentDomain = this.domain();

        if (currentDomain.length === 0) {
            currentDomain = domain;
        }
        if (domain.length) {
            currentDomain = [Math.min(currentDomain[0], domain[0]), Math.max(currentDomain[1], domain[1])];
        }
        currentDomain = sanitizeDomain(currentDomain, this);

        return this.domain(currentDomain);
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
        if (this.config().interpolator === LOG && domainVal <= 0) {
            return 1;
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
        if (domain && domain.length) {
            const { nice } = this.config();
            if (domain.length && domain[0] === domain[1]) {
                domain = [0, +domain[0] * 2];
            }
            this.scale().domain(domain);
            nice && this.scale().nice();
            this._domain = this.scale().domain();
            this.store().commit(DOMAIN, this._domain);
            this.logicalSpace(null);
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
            fixedBaseline
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
        let labelDim = 0;
        const {
            orientation,
            tickValues
        } = this.config();
        const range = this.range();
        const axis = this.axis();

        const availableSpace = Math.abs(range[0] - range[1]);

        const labelProps = getTickLabelInfo(this).largestLabelDim;

        if (tickValues) {
            return axis.scale().ticks(tickValues);
        }
        labelDim = labelProps[orientation === BOTTOM || orientation === TOP ? 'width' : 'height'];

        return getNumberOfTicks(availableSpace, labelDim, axis, this);
    }

    getMinTickDifference () {
        return getSmallestDiff(this.config().tickValues);
    }

    /**
     *
     *
     * @param {*} domain
     * @returns
     * @memberof SimpleAxis
     */
    updateDomainCache (domain) {
        if (this._domainLock === false) {
            this.domain([1, 1]);
            this._domainLock = true;
        }
        return this.updateDomainBounds(domain || []);
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
            const temp = axis.tickFormat ? axis.tickFormat()(d) : d;
            const datum = temp.toString();

            const { width: shiftWidth, height: shiftHeight } = labelManager.getOriSize(datum);

            if (i === 0 && (orientation === LEFT || orientation === RIGHT)) {
                return `translate(0, -${(shiftHeight) / 3}px)`;
            }
            if (i === 0 && (orientation === TOP || orientation === BOTTOM) && rotation === 0) {
                return `translate(${shiftWidth / 2}px,  ${0}px) rotate(${rotation}deg)`;
            } return '';
        });
        return tickText;
    }

}

