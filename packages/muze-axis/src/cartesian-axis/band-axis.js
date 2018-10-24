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
        const domain = this.domain();
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation,
            axisNamePadding,
            tickValues
        } = this.config();
        const {
            labels,
            showAxisName
        } = this.renderConfig();
        const {
            rotation
        } = labels;
        const { axisNameDimensions, tickSize } = this.axisComponentDimensions();
        const labelConfig = { smartTicks: true, rotation: labels.rotation };
        const namePadding = showAxisName ? axisNamePadding : 0;
        const minTickDistance = this._minTickDistance;
        const minTickSpace = this._minTickSpace;

        this.availableSpace({ width, height });
        if (orientation === TOP || orientation === BOTTOM) {
            const availableWidth = width - left - right;

            // Set x-axis range
            this.range([0, availableWidth]);

            // Set offset
            isOffset && this.config({ yOffset: height });

            // Get Tick Interval
            tickInterval = (availableWidth / (tickValues || domain).length) - minTickDistance.width;

            // Get height available for ticks
            heightForTicks = height - axisNameDimensions.height - tickSize - namePadding;

            if (tickInterval < minTickSpace.width && rotation !== 0) {
                // set smart ticks and rotation config
                labelConfig.rotation = rotation === null ? -90 : rotation;
                labelConfig.smartTicks = false;

                // Ticks with overlapping height
                if (tickInterval < minTickSpace.height) {
                    heightForTicks = 0;
                    tickInterval = 0;
                    this.range([minTickSpace.height / 2, availableWidth - minTickSpace.height / 2]);
                }
            } else if (tickValues) {
                const interval = (availableWidth / domain.length) - minTickDistance.width;
                if (interval < minTickSpace.width) {
                    this.range([minTickSpace.height / 2, availableWidth - minTickSpace.height / 2]);
                }
            }
            if (height < axisNameDimensions.height) {
                this.renderConfig({ show: false, showInnerTicks: false, showOuterTicks: false });
            }

            this.maxTickSpaces({
                width: tickInterval,
                height: heightForTicks,
                noWrap: rotation !== null
            });
        } else {
            // ORIENTATION LEFT AND RIGHT
            // Set y axis range
            this.range([height - bottom, top]);
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

    /**
     *
     *
     * @returns
     * @memberof BandAxis
     */
    setTickConfig () {
        let smartTicks = '';
        let smartlabel;
        const domain = this.domain();
        const { labelManager } = this._dependencies;
        const { tickValues, tickFormat } = this.config();
        const { labels } = this.renderConfig();
        const { height: availHeight, width: availWidth, noWrap } = this.maxTickSpaces();
        const { width, height } = getRotatedSpaces(labels.rotation, availWidth, availHeight);
        const tickFormatter = tickFormat || (val => val);
        tickValues && this.axis().tickValues(tickValues);

        smartTicks = tickValues || domain;
        // set the style on the shared label manager instance
        labelManager.setStyle(this._tickLabelStyle);

        if (domain && domain.length) {
            const values = tickValues || domain;
            smartTicks = values.map((d, i) => {
                labelManager.useEllipsesOnOverflow(true);

                smartlabel = labelManager.getSmartText(tickFormatter(d, i, values), width, height, noWrap);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }
        console.log(smartTicks);
        this.smartTicks(smartTicks);
        return this;
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
     * @memberof BandAxis
     */
    getUnitWidth () {
        return this.scale().bandwidth();
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
