import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { adjustRange } from './helper';
import { TIME } from '../enums/scale-type';
import { axisOrientationMap, BOTTOM, TOP } from '../enums/axis-orientation';
import { DOMAIN } from '../enums/constants';

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
        const { maxWidth, maxHeight, tickFormat } = this.config();
        const { labelManager } = this._dependencies;
        const domain = this.getTickValues();
        const scale = this.scale();

        smartTicks = domain;
        const tickFormatter = tickFormat || scale.tickFormat();

        if (domain && domain.length) {
            smartTicks = domain.map((d, i) => {
                smartlabel = labelManager.getSmartText(tickFormatter(d, i, domain), maxWidth, maxHeight);
                return labelManager.constructor.textToLines(smartlabel);
            });
        }
        return smartTicks;
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
        } = this.config();
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
     * @param {*} axisTickLabels
     * @param {*} labelWidth
     * @returns
     * @memberof BandAxis
     */
    setRotationConfig (axisTickLabels, labelWidth) {
        const { orientation } = this.config();
        const range = this.range();
        const availSpace = Math.abs(range[0] - range[1]);

        this.config({ labels: { rotation: 0, smartTicks: false } });
        if (orientation === TOP || orientation === BOTTOM) {
            const smartWidth = this.smartTicks().reduce((acc, n) => acc + n.width, 0);
            // set multiline config
            if (availSpace > 0 && axisTickLabels.length * labelWidth > availSpace) {
                if (availSpace && smartWidth * 1.25 < availSpace) {
                    this.config({ labels: { smartTicks: true } });
                }
                this.config({ labels: { rotation: -90 } });
            }
        }
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
            this.smartTicks(this.setTickConfig());
            this.store().commit(DOMAIN, this._domain);
            this.logicalSpace(null);
            return this;
        } return this._domain;
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
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation,
            showAxisName,
            axisNamePadding
        } = this.config();
        const domain = this.domain();
        const { axisLabelDim, tickLabelDim } = this.getAxisDimensions(width, height);
        const { height: axisDimHeight } = axisLabelDim;
        const { height: tickDimHeight, width: tickDimWidth } = tickLabelDim;

        this.availableSpace({ width, height });
        if (orientation === TOP || orientation === BOTTOM) {
            const labelSpace = tickDimWidth;
            this.range(adjustRange(this._minDiff, [labelSpace / 2, width - left - right - labelSpace / 2],
                domain, orientation));
            const axisHeight = this.getLogicalSpace().height - (showAxisName === false ?
                                            (axisDimHeight + axisNamePadding) : 0);
            isOffset && this.config({ yOffset: Math.max(axisHeight, height) });
        } else {
            const labelSpace = tickDimHeight;
            this.range(adjustRange(this._minDiff, [height - top - bottom - labelSpace / 2, labelSpace / 2],
                domain, orientation));
            const axisWidth = this.getLogicalSpace().width - (showAxisName === false ? axisDimHeight : 0);
            this.isOffset && this.config({ xOffset: Math.max(axisWidth, width) });
        }
        return this;
    }

}
