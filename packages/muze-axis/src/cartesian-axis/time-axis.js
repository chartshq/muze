import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { TIME } from '../enums/scale-type';
import { axisOrientationMap, BOTTOM, TOP } from '../enums/axis-orientation';
import { DOMAIN } from '../enums/constants';
import { calculateBandSpace, getRotatedSpaces } from './helper';

const getAxisOffset = (timeDiff, range, domain) => {
    const pvr = Math.abs(range[1] - range[0]) / (domain[1] - domain[0]);
    const width = (pvr * timeDiff);
    const avWidth = (range[1] - range[0]);
    const bars = avWidth / width;
    const barWidth = avWidth / (bars + 1);
    const diff = avWidth - barWidth * bars;

    return diff / 2;
};

export const adjustRange = (minDiff, range, domain, orientation) => {
    const diff = getAxisOffset(minDiff, range, domain);

    if (orientation === TOP || orientation === BOTTOM) {
        range[0] += diff;
        range[1] -= diff;
    } else {
        range[0] -= diff;
        range[1] += diff;
    }
    return range;
};

/**
 *
 *
 * @export
 * @class TimeAxis
 * @extends {SimpleAxis}
 */
export default class TimeAxis extends SimpleAxis {

    constructor (...params) {
        super(...params);
        this._minDiff = Infinity;
    }

    /**
     *
     *
     * @param {*} range
     * @returns
     * @memberof TimeAxis
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
     * @memberof TimeAxis
     */
    static type () {
        return TIME;
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    setTickConfig () {
        let smartTicks;
        let smartlabel;
        const { tickFormat } = this.config();
        const { labels } = this.renderConfig();
        const { height: availHeight, width: availWidth, noWrap } = this.maxTickSpaces();
        const { labelManager } = this._dependencies;
        const domain = this.getTickValues();
        const scale = this.scale();

        const { width, height } = getRotatedSpaces(labels.rotation, availWidth, availHeight);

        smartTicks = domain;
        const tickFormatter = tickFormat || scale.tickFormat();
         // set the style on the shared label manager instance
        labelManager.setStyle(this._tickLabelStyle);

        if (domain && domain.length) {
            smartTicks = domain.map((d, i) => {
                labelManager.useEllipsesOnOverflow(true);

                smartlabel = labelManager.getSmartText(tickFormatter(d, i, domain), width, height, noWrap);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }
        this.smartTicks(smartTicks);
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof SimpleAxis
     */
    createAxis (config) {
        const {
            tickFormat,
            orientation
        } = config;
        const axisClass = axisOrientationMap[orientation];

        if (axisClass) {
            const axis = axisClass(this.scale());
            this.formatter = this.getTickFormatter(tickFormat);
            return axis;
        }
        return null;
    }

    getTickFormatter (tickFormat) {
        if (tickFormat) {
            return ticks => (val, i) => tickFormat(val, i, ticks);
        }
        return null;
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
        } = this.renderConfig();
        const axis = this.axis();
        axis.tickSizeInner(showInnerTicks === false ? 0 : 6);
        axis.tickSizeOuter(showOuterTicks === false ? 0 : 6);
        return super.getTickSize();
    }

    /**
     *
     *
     * @returns
     * @memberof TimeAxis
     */
    getTickValues () {
        return this.scale().ticks();
    }

    /**
     *
     *
     * @param {*} diff
     * @returns
     * @memberof TimeAxis
     */
    minDiff (diff) {
        this._minDiff = Math.min(this._minDiff, diff);
        return this;
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
            this.setAxisComponentDimensions();
            this.store().commit(DOMAIN, this._domain);
            this.logicalSpace(null);
            // this.smartTicks(this.setTickConfig());
            return this;
        } return this._domain;
    }

    /**
     * Gets the space occupied by the axis
     *
     * @return {Object} object with details about size of the axis.
     * @memberof SimpleAxis
     */
    getLogicalSpace () {
        if (!this.logicalSpace()) {
            this.logicalSpace(calculateBandSpace(this));
            this.logicalSpace();
        }
        return this.logicalSpace();
    }

    getMinTickDifference () {
        return getSmallestDiff(this.config().tickValues);
    }

    /**
     *
     *
     * @param {*} width
     * @param {*} height
     * @param {*} padding
     * @param {*} isOffset
     * @memberof TimeAxis
     */
    setAvailableSpace (width, height, padding, isOffset) {
        let tickInterval;
        let heightForTicks;
        const domain = this.domain();
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation,
            axisNamePadding
        } = this.config();
        const { labels, showAxisName } = this.renderConfig();
        const { rotation } = labels;
        const { tickDimensions, axisNameDimensions, tickSize } = this.getAxisDimensions();
        const { height: tickDimHeight, width: tickDimWidth } = tickDimensions;
        const labelConfig = { smartTicks: true, rotation: labels.rotation };
        const namePadding = showAxisName ? axisNamePadding : 0;

        this.availableSpace({ width, height });
        if (orientation === TOP || orientation === BOTTOM) {
            const labelSpace = tickDimWidth;
            this.range(adjustRange(this._minDiff, [labelSpace / 2, width - left - right - labelSpace / 2],
                domain, orientation));
            isOffset && this.config({ yOffset: height });

            tickInterval = ((this.range()[1] - this.range()[0]) / this.getTickValues().length)
                - this._minTickDistance.width;

            heightForTicks = height - axisNameDimensions.height - tickSize - namePadding;

            if (tickInterval < this._minTickSpace.width && rotation !== 0) {
                // set smart ticks and rotation config
                labelConfig.rotation = labels.rotation === null ? -90 : rotation;
                  // Remove ticks if not enough height
                if (tickInterval < this._minTickSpace.height) {
                    tickInterval = 0;
                    heightForTicks = 0;
                    this.renderConfig({ showInnerTicks: false, showOuterTicks: false });
                }
            }
            if (height < axisNameDimensions.height) {
                this.renderConfig({ show: false });
            }

            this.maxTickSpaces({
                width: tickInterval,
                height: heightForTicks,
                noWrap: rotation !== null
            });
        } else {
            const labelSpace = tickDimHeight;
            this.range(adjustRange(this._minDiff, [height - top - bottom - labelSpace / 2, labelSpace / 2],
                domain, orientation));
            isOffset && this.config({ xOffset: width });
            const availWidth = width - axisNameDimensions.height - namePadding;
            let widthForTicks = availWidth;
            if (availWidth <= this._minTickDistance.width) {
                widthForTicks = 0;
                this.renderConfig({ showInnerTicks: false, showOuterTicks: false });
            }

            this.maxTickSpaces({
                width: widthForTicks,
                height,
                noWrap: true
            });
            if (width < axisNameDimensions.height) {
                this.renderConfig({ show: false });
            }
        }
        this.renderConfig({
            labels: labelConfig
        });
        this.setTickConfig();
        this.getTickSize();
        return this;
    }
}
