import { getSmallestDiff } from 'muze-utils';
import SimpleAxis from './simple-axis';
import { BOTTOM, TOP, LEFT, RIGHT } from '../enums/axis-orientation';
import { LINEAR, LOG, POW } from '../enums/scale-type';
import { LogInterpolator, PowInterpolator, LinearInterpolator } from './interpolators';
import { DOMAIN } from '../enums/constants';
import {
    getNumberOfTicks
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
     * @returns
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
            if (domain.length) {
                currentDomain = [Math.min(currentDomain[0], domain[0]), Math.max(currentDomain[1], domain[1])];
            }
        }

        return this.domain(currentDomain);
    }

    /**
     *
     *
     * @static
     * @returns
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
            this.setAxisComponentDimensions();
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
        let showTicks = true;
        const {
            left,
            right,
            top,
            bottom
        } = padding;
        const {
            orientation,
            fixedBaseline,
            axisNamePadding,
            labels
        } = this.config();
        const {
            tickDimensions,
            allTickDimensions,
            axisNameDimensions
        } = this.getAxisDimensions();

        const labelConfig = { smartTicks: false, rotation: labels.rotation };

        this.availableSpace({ width, height });

        if (orientation === TOP || orientation === BOTTOM) {
            const labelSpace = tickDimensions.width;

            // Set x-axis range
            this.range([(fixedBaseline ? 0 : (labelSpace / 2)) + left, width - right - labelSpace / 2]);

            // Set offset
            isOffset && this.config({ yOffset: height });

            // Get Tick widths and available space
            const totalTickWidth = allTickDimensions.length * (tickDimensions.width + this._minTickDistance.width);
            const availableSpace = this.range()[1] - this.range()[0];

            // Rotate labels if not enough width
            if (availableSpace < totalTickWidth && labels.rotation === null) {
                labelConfig.rotation = -90;
            }

            // Remove ticks if not enough height
            if (height - axisNameDimensions.height - axisNamePadding < tickDimensions.height) {
                showTicks = false;
                this.renderConfig({ showInnerTicks: false });
                if (height < axisNameDimensions.height) {
                    this.renderConfig({ show: false });
                }
            }
        } else {
            const labelSpace = tickDimensions.height;

            // Set range
            this.range([height - bottom - (fixedBaseline ? 1 : (labelSpace / 2)), labelSpace / 2 + top]);

            // Set offset
            isOffset && this.config({ xOffset: width });

            // Remove display of ticks if no space is left
            if (width < tickDimensions.width + axisNameDimensions.height + axisNamePadding) {
                this.renderConfig({ showInnerTicks: false });
                if (width < axisNameDimensions.height) {
                    this.renderConfig({ show: false });
                }
                showTicks = false;
            }
        }

        // Set config
        this.config({
            labels: labelConfig
        });
        this.setTickValues(showTicks);

        return this;
    }

    /**
     *
     *
     * @param {*} tickValues
     * @returns
     * @memberof SimpleAxis
     */
    setTickValues (showTicks = true) {
        const {
            tickValues
        } = this.config();
        const axis = this.axis();

        if (!showTicks) {
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
            orientation,
            labels
        } = this.config();

        const {
            rotation
        } = labels;
        const axis = this.axis();
        const { width, height } = this.axisComponentDimensions().allTickDimensions[0];
        axis.tickTransform((d, i) => {
            if (i === 0 && (orientation === LEFT || orientation === RIGHT)) {
                return `translate(0, -${(height) / 3}px)`;
            }
            if (i === 0 && (orientation === TOP || orientation === BOTTOM) && !rotation) {
                return `translate(${width / 2}px,  ${0}px) rotate(${rotation || 0}deg)`;
            } return '';
        });
        return tickText;
    }

}
