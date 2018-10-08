import SimpleAxis from './simple-axis';
import { BAND } from '../enums/scale-type';
import { TOP, BOTTOM } from '../enums/axis-orientation';
import { calculateBandSpace, setOffset, getRotatedSpaces } from './helper';

export default class BandAxis extends SimpleAxis {

    /**
     *
     *
     * @param {*} range
     * @returns
     * @memberof BandAxis
     */
    createScale (range) {
        const scale = super.createScale(range);
        const { padding } = this.config();
        if (typeof padding === 'number') {
            scale.padding(padding);
        }
        return scale;
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof BandAxis
     */
    static type () {
        return BAND;
    }

    /**
     *
     *
     * @param {*} width
     * @param {*} height
     * @param {*} padding
     * @param {*} isOffset
     * @memberof BandAxis
     */
    setAvailableSpace (width, height, padding, isOffset) {
        let tickInterval;
        let heightForTicks;
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation,
            axisNamePadding,
            labels
        } = this.config();
        const {
            rotation
        } = labels;
        const { axisNameDimensions, tickSize } = this.axisComponentDimensions();
        const labelConfig = { smartTicks: true, rotation: labels.rotation };

        this.availableSpace({ width, height });
        if (orientation === TOP || orientation === BOTTOM) {
            const availableWidth = width - left - right;

            // Set x-axis range
            this.range([0, availableWidth]);

            // Set offset
            isOffset && this.config({ yOffset: height });

            // Get Tick Interval
            tickInterval = (availableWidth / this.domain().length) - this._minTickDistance.width;

            // Get height available for ticks
            heightForTicks = height - axisNameDimensions.height - tickSize - axisNamePadding;

            if (tickInterval < this._minTickSpace.width && rotation !== 0) {
                // set smart ticks and rotation config
                labelConfig.rotation = labels.rotation === null ? -90 : rotation;
                labelConfig.smartTicks = false;
                // Remove ticks if not enough height
                if (tickInterval < this._minTickSpace.height) {
                    tickInterval = 0;
                    heightForTicks = 0;
                }
            }
            this.maxTickSpaces({
                width: tickInterval,
                height: heightForTicks,
                noWrap: rotation !== null
            });
        } else {
            // Set y axis range
            this.range([height - bottom, top]);
            isOffset && this.config({ xOffset: width });
            const availWidth = width - axisNameDimensions.height - axisNamePadding;

            this.maxTickSpaces({
                width: availWidth <= this._minTickSpace.width ? 0 : availWidth,
                height,
                noWrap: true
            });
        }
        this.smartTicks(this.setTickConfig());
        this.config({
            labels: labelConfig
        });
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    getUnitWidth () {
        return this.scale().bandwidth();
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    setTickConfig () {
        let smartTicks = '';
        let smartlabel;
        const { tickFormat, labels } = this.config();
        const { height: availHeight, width: availWidth, noWrap } = this.maxTickSpaces();

        const { labelManager } = this._dependencies;
        const domain = this.domain();
        const { width, height } = getRotatedSpaces(labels.rotation, availWidth, availHeight);
        smartTicks = domain;
        const tickFormatter = tickFormat || (val => val);

        if (domain && domain.length) {
            smartTicks = domain.map((d, i) => {
                labelManager.useEllipsesOnOverflow(true);

                smartlabel = labelManager.getSmartText(tickFormatter(d, i, domain), width, height, noWrap);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }
        return smartTicks;
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
            setOffset(this);
            this.logicalSpace();
        }
        return this.logicalSpace();
    }

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    getTickValues () {
        return this.axis().scale().domain();
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

        axis.tickSizeInner(showInnerTicks ? 6 : 0);
        axis.tickSizeOuter(showOuterTicks ? 6 : 0);
        return axis.tickSize();
    }

    /**
     * This method is used to assign a domain to the axis.
     *
     * @param {Array} domain the domain of the scale
     * @memberof SimpleAxis
     */
    updateDomainBounds (domain) {
        let currentDomain = this.domain();
        if (this.config().domain) {
            currentDomain = this.config().domain;
        } else {
            if (currentDomain.length === 0) {
                currentDomain = domain;
            }
            currentDomain = currentDomain.concat(domain);
        }
        this.domain(currentDomain);
        return this;
    }

    /**
     * Returns the value from the domain when given a value from the range.
     * @param {number} value Value from the range.
     * @return {number} Value
     */
    invert (...value) {
        const values = value.map(d => this.scale().invert(d)) || [];
        return value.length === 1 ? values[0] && values[0].toString() : values.map(d => d.toString());
    }
}
