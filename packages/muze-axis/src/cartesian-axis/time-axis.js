import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { TIME } from '../enums/scale-type';
import { axisOrientationMap, BOTTOM, TOP } from '../enums/axis-orientation';
import { calculateBandSpace, getRotatedSpaces, setContinousAxisDomain } from './helper';
import { spaceSetter } from './space-setter';

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

    /**
     *
     *
     * @returns
     * @memberof SimpleAxis
     */
    createAxis (config) {
        const { orientation } = config;
        const axisClass = axisOrientationMap[orientation];

        if (axisClass) {
            const axis = axisClass(this.scale());
            return axis;
        }
        return null;
    }

    getTickFormatter (value) {
        const { tickFormat } = value;
        if (tickFormat) {
            return ticks => (val, i) => tickFormat(val, i, ticks);
        }
        return null;
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
        return this.config().tickValues || this.scale().ticks();
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

    /**
     *
     *
     * @param {*} d
     *
     * @memberof SimpleAxis
     */
    domain (domain) {
        if (domain) {
            setContinousAxisDomain(this, domain);
            this.setAxisComponentDimensions();
            this.logicalSpace(null);
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
     * This method is used to set the space availiable to render
     * the SimpleCell.
     *
     * @param {number} width The width of SimpleCell.
     * @param {number} height The height of SimpleCell.
     * @memberof AxisCell
     */
    setAvailableSpace (width = 0, height, padding, isOffset) {
        let labelConfig = {};
        const {
           orientation
       } = this.config();

        this.availableSpace({ width, height, padding });

        if (orientation === TOP || orientation === BOTTOM) {
            labelConfig = spaceSetter(this, { isOffset }).time.x();
        } else {
            labelConfig = spaceSetter(this, { isOffset }).time.y();
        }

        // Set config
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
        let smartTicks;
        let smartlabel;
        const { tickFormat, tickValues } = this.config();
        const { labels } = this.renderConfig();
        const { height: availHeight, width: availWidth, noWrap } = this.maxTickSpaces();
        const { labelManager } = this._dependencies;
        const domain = this.getTickValues();
        const scale = this.scale();
        tickValues && this.axis().tickValues(tickValues);

        const { width, height } = getRotatedSpaces(labels.rotation, availWidth, availHeight);

        smartTicks = tickValues || domain;
        const tickFormatter = tickFormat || scale.tickFormat();
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
        this.smartTicks(smartTicks);
        return this;
    }
}
