import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { TIME } from '../enums/scale-type';
import { calculateBandSpace, getRotatedSpaces, getValidDomain, setContinousAxisDomain, setOffset,
    resetTickInterval } from './helper';
import { applyTickSkipping } from './space-setter';

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
     *
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
     *
     * @memberof TimeAxis
     */
    static type () {
        return TIME;
    }

    formatTickValue (val) {
        return this.scale().tickFormat()(val);
    }

    sanitizeTickFormatter (value) {
        const { tickFormat } = value;

        if (tickFormat) {
            return (ticks) => {
                const rawTicks = ticks.map(t => t.getTime());
                return (val, i) => tickFormat(this.formatTickValue(val), val.getTime(), i, rawTicks);
            };
        }
        return () => val => this.formatTickValue(val);
    }

     /**
     *
     *
     *
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
     *
     * @memberof TimeAxis
     */
    getTickValues () {
        return this.renderConfig().tickValues || this.scale().ticks();
    }

    /**
     *
     *
     * @param {*} diff
     *
     * @memberof TimeAxis
     */
    minDiff (diff) {
        this._minDiff = Math.min(this._minDiff, diff);
        return this;
    }

    applyTickSkipping () {
        applyTickSkipping(this);
    }

    /**
     *
     *
     * @param {*} d
     *
     * @memberof SimpleAxis
     */
    domain (...domain) {
        if (domain.length) {
            const domainValue = getValidDomain(this, domain[0]);
            setContinousAxisDomain(this, domainValue);
            this.setAxisComponentDimensions();
            this.logicalSpace(null);

            resetTickInterval(this, domainValue);
            return this;
        }
        return this._domain;
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
        }
        setOffset(this);

        return this.logicalSpace();
    }

    getMinTickDifference () {
        return getSmallestDiff(this.config().tickValues);
    }

    /**
     * This method is used to set the space availiable to render
     * the SimpleCell.
     *
     * @param {number} width The width of SimpleCell.
     * @param {number} height The height of SimpleCell.
     * @memberof AxisCell
     */
    setAvailableSpace (...params) {
        super.setAvailableSpace(...params);
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
        let smartTicks;
        let smartlabel;

        const { labels, tickValues } = this.renderConfig();
        const { height: availHeight, width: availWidth, noWrap } = this.maxTickSpaces();
        const { labelManager } = this._dependencies;
        const domain = this.getTickValues();

        tickValues && this.axis().tickValues(tickValues);

        const { width, height } = getRotatedSpaces(labels.rotation, availWidth, availHeight);

        smartTicks = tickValues || domain;

        // set the style on the shared label manager instance
        labelManager.setStyle(this._tickLabelStyle);

        if (domain && domain.length) {
            const values = tickValues || domain;
            const tickFormatter = this._tickFormatter(values);
            smartTicks = values.map((d, i) => {
                labelManager.useEllipsesOnOverflow(true);

                smartlabel = labelManager.getSmartText(tickFormatter(d, i), width, height, noWrap);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }

        this.smartTicks(smartTicks);
        return this;
    }
    _getRawTickValue (data) {
        return (new Date(data)).getTime();
    }
}
