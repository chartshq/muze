import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { BOTTOM, TOP, LEFT, RIGHT } from '../enums/axis-orientation';
import { spaceSetter } from './space-setter';
import { LINEAR, LOG, POW } from '../enums/scale-type';
import { LogInterpolator, PowInterpolator, LinearInterpolator } from './interpolators';
import {
    getNumberOfTicks,
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
    domain (domain) {
        if (domain && domain.length) {
            setContinousAxisDomain(this, domain);
            this.setAxisComponentDimensions();
            this.logicalSpace(null);
            return this;
        } else if (domain) {
            this._domain = [];
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
        let labelConfig = {};
        const {
           orientation
       } = this.config();

        this.availableSpace({ width, height, padding });

        if (orientation === TOP || orientation === BOTTOM) {
            labelConfig = spaceSetter(this, { isOffset }).continous.x();
        } else {
            labelConfig = spaceSetter(this, { isOffset }).continous.y();
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
     * @param {*} tickValues
     *
     * @memberof SimpleAxis
     */
    setTickConfig () {
        const {
            tickValues
        } = this.config();
        const {
            showInnerTicks
        } = this.renderConfig();
        const axis = this.axis();

        if (!showInnerTicks) {
            axis.tickValues([]);
            return this;
        }

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
     *
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

        const labelProps = this.axisComponentDimensions().largestTickDimensions;

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
        const ticks = axis.scale().ticks();
        const { width, height } = this.axisComponentDimensions().allTickDimensions[0];
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
        return tickText;
    }

}
