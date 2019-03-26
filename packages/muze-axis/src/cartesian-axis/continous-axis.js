import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { BOTTOM, TOP, LEFT, RIGHT } from '../enums/axis-orientation';
import { LINEAR, LOG, POW } from '../enums/scale-type';
import { LogInterpolator, PowInterpolator, LinearInterpolator } from './interpolators';
import {
    getNumberOfTicks,
    getValidDomain,
    setContinousAxisDomain
} from './helper';

export const interpolatorMap = {
    [LOG]: LogInterpolator,
    [POW]: PowInterpolator,
    [LINEAR]: LinearInterpolator
};

export default class ContinousAxis extends SimpleAxis {
    constructor (config, dependencies) {
        config.tickFormat = config.tickFormat || (val => val);
        super(config, dependencies);
    }
    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    createScale (config) {
        const {
            base,
            padding,
            interpolator,
            exponent
        } = config;
        const range = this.range();
        const InterpolatorCls = interpolatorMap[interpolator];

        this._interpolator = new InterpolatorCls();
        let scale = this._interpolator.createScale({
            padding,
            exponent,
            base,
            range
        });

        scale = scale.nice();
        return scale;
    }

    /**
     *
     *
     * @static
     *
     * @memberof ContinousAxis
     */
    static type () {
        return LINEAR;
    }

    getScaleValue (domainVal) {
        if (domainVal === null || domainVal === undefined) {
            return undefined;
        }
        return this._interpolator.getScaleValue(domainVal);
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

        return axis.tickSize();
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
            const domainVal = this._interpolator.sanitizeDomain(getValidDomain(this, domain[0]));
            setContinousAxisDomain(this, domainVal);
            this.setAxisComponentDimensions();
            this.logicalSpace(null);
            return this;
        }
        return this._domain;
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
     * @param {*} tickValues
     *
     * @memberof SimpleAxis
     */
    setTickConfig () {
        const {
            tickValues,
            showInnerTicks
        } = this.renderConfig();
        const axis = this.axis();

        if (!showInnerTicks) {
            axis.tickValues([]);
            return this;
        }

        if (tickValues) {
            tickValues instanceof Array && this.axis().tickValues(tickValues);
        }
        const newTickValues = this.getTickValues();

        axis.tickValues(newTickValues);
        const smartLabel = this.dependencies().labelManager;
        smartLabel.setStyle(this._tickLabelStyle);
        const formatter = this._tickFormatter(newTickValues);
        const smartTicks = newTickValues.map((val, i) => {
            const text = formatter(val, i);
            const tickSpace = smartLabel.getOriSize(text);

            tickSpace.text = text;
            return tickSpace;
        });

        this.smartTicks(smartTicks);
        return this;
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    getTickValues () {
        let labelDim = 0;
        const {
            orientation

        } = this.config();
        const {
            tickValues
        } = this.renderConfig();
        const range = this.range();
        const axis = this.axis();

        const availableSpace = Math.abs(range[0] - range[1]);

        const labelProps = this.axisComponentDimensions().largestTickDimensions;

        if (tickValues) {
            return tickValues;
        }
        labelDim = labelProps[orientation === BOTTOM || orientation === TOP ? 'width' : 'height'];

        return getNumberOfTicks(availableSpace, labelDim, axis, this);
    }

    getMinTickDifference () {
        return getSmallestDiff(this.renderConfig().tickValues);
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
            orientation
        } = this.config();
        const {
            labels
        } = this.renderConfig();

        const {
            rotation
        } = labels;
        const axis = this.axis();
        const ticks = axis.tickValues();
        const smartTicks = this.smartTicks();

        if (smartTicks && smartTicks.length) {
            const { width, height } = this.smartTicks()[0];

            axis.tickTransform((d) => {
                if (d === ticks[0]) {
                    if ((orientation === LEFT || orientation === RIGHT)) {
                        return `translate(0, -${(height) / 3}px)`;
                    }

                    if ((orientation === TOP || orientation === BOTTOM) && !rotation) {
                        return `translate(${width / 2}px,  ${0}px)`;
                    }
                } return '';
            });
        }
        return tickText;
    }

}
