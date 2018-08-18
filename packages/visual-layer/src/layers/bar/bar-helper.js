import { FieldType, DimensionSubtype } from 'muze-utils';
import { ScaleType } from '@chartshq/muze-axis';
import * as PROPS from '../../enums/props';
import { STACK } from '../../enums/constants';
import { getLayerColor, positionPoints } from '../../helpers/';

const BAND = ScaleType.BAND;

/**
 *
 *
 * @param {*} type
 * @param {*} fieldInfo
 * @param {*} config
 * @param {*} data
 * @returns
 */
const resolveDimByField = (type, axesInfo, config, data) => {
    const spaceType = type === 'x' ? 'width' : 'height';
    const [fieldType, axis] = [config[`${type}FieldType`], axesInfo[`${type}Axis`]];
    const {
        transformType,
        sizeEncoding,
        sizeConfig,
        measurement
    } = config;

    let sizeValue = sizeEncoding.value,
        enter = 0,
        pos,
        space = 0,
        enterSpace = 0;

    if (fieldType !== undefined) {
        if (config[`${type}0Field`]) {
            const minVal = data[type];
            const maxVal = data[`${type}0`];
            let min;
            let max;
            if ((minVal === undefined && maxVal === undefined) || (minVal === null && maxVal === null)) {
                return {
                    enterSpace: null,
                    enter: null,
                    pos: null,
                    space: null
                };
            } else if (fieldType === FieldType.MEASURE || fieldType === DimensionSubtype.TEMPORAL) {
                min = Math.min(minVal, maxVal);
                max = Math.max(minVal, maxVal);
            } else {
                min = minVal;
                max = maxVal;
            }
            const scales = type === 'x' ? [min, max] : [max, min];
            pos = axis.getScaleValue(scales[0]) + axis.getUnitWidth() / 2;
            space = Math.abs(axis.getScaleValue(scales[1]) - pos) + axis.getUnitWidth() / 2;

            enter = pos;
            enterSpace = 0;
        } else if (fieldType === DimensionSubtype.CATEGORICAL || fieldType === DimensionSubtype.TEMPORAL) {
            pos = axis.getScaleValue(data[type]) +
                (sizeConfig[type === 'x' ? 'barWidthOffset' : 'barHeightOffset'] || 0);

            space = sizeConfig[type === 'x' ? 'barWidth' : 'barHeight'];
            if (sizeValue !== undefined) {
                const diffPx = sizeValue * space;
                space -= diffPx;
                pos += diffPx / 2;
            }
            enter = pos;
            enterSpace = space;
        } else {
            const zeroPos = axis.getScaleValue(0);
            const axisType = axis.getScaleValue(data[type]);
            const axisType0 = axis.getScaleValue(data[`${type}0`]);

            enterSpace = 0;
            if (type === 'x') {
                pos = data[type] < 0 || transformType === STACK ? axisType : zeroPos;
                space = Math.abs(pos - (transformType === STACK ? axisType0 : (data[type] >= 0 ? axisType : zeroPos)));
            } else {
                pos = transformType === STACK || data[type] >= 0 ? axisType : zeroPos;
                space = Math.abs(pos - (transformType === STACK ? axisType0 : (data[type] >= 0 ? zeroPos : axisType)));
            }
            enter = zeroPos;
        }
    } else {
        pos = 0;
        space = measurement[spaceType];
    }

    return {
        enterSpace,
        enter,
        pos,
        space
    };
};

/**
 *
 *
 * @param {*} data
 * @param {*} config
 * @param {*} axes
 * @returns
 */
const resolveDimensions = (data, config, axes) => {
    const axesInfo = {
        xAxis: axes.x,
        yAxis: axes.y
    };
    const {
        enterSpace: enterWidth,
        enter: enterX,
        pos: xPos,
        space: width
    } = resolveDimByField('x', axesInfo, config, data);

    const {
        enterSpace: enterHeight,
        enter: enterY,
        pos: yPos,
        space: height
    } = resolveDimByField('y', axesInfo, config, data);
    return {
        enter: {
            x: enterX,
            y: enterY,
            width: enterWidth,
            height: enterHeight
        },
        update: {
            x: xPos,
            y: yPos,
            width,
            height
        }
    };
};

/**
  * Gets the width of each bar. It gets the width from axis if it is available for
  * example when the scale is nominal else it calculates the width from the
  * range of the axis and number of data points.
  * @param {SimpleAxis} axis instance of axis
  * @param {number} minDiff Minimum difference between data points
  * @return {number} width of each bar
  * @private
*/
const getGroupWidth = (axis, minDiff) => {
    let barWidth;
    const width = axis.getUnitWidth();
    const scale = axis.scale();
    const range = scale.range();
    const domain = scale.domain();
    !width ? barWidth = (Math.abs(range[1] - range[0])
        / Math.abs(domain[1] - domain[0])) * minDiff :
        (barWidth = width);

    return barWidth;
};

/**
 * Gets the width and offset values of the bar.
 * Bar layer can be grouped or stacked based on which the width and offsetValues are
 * calculated.
 * @param { Axis } axis Axis instance needed for calculating the group width
 * @param { number } dataLen Number of data points
 * @param { string} transformType type of transform - group, stack
 * @param { number } innerPadding padding between bars.
 * @param {number} keys Series values
 * @return { Object } Width and offset of bars.
 */
export const getBarMeasurement = (axis, bandScale, config) => {
    let width;
    let offsetValues;
    let actualGroupWidth;
    let padding;
    const scale = axis.scale();
    const {
        timeDiff,
        transformType,
        keys,
        pad,
        innerPadding
    } = config;
    const groupWidth = getGroupWidth(axis, timeDiff),
        isAxisBandScale = axis.constructor.type() === BAND;
    // If it is a grouped bar then the width of each bar in a grouping is retrieved from
    // a band scale. The band scale will have range equal to width of one group of bars and
    // the domain is set to series keys.
    if (transformType === 'group') {
        const groupPadding = isAxisBandScale ? 0 : axis.config().padding * groupWidth / 2;
        bandScale.range([groupPadding, groupWidth - groupPadding])
                        .domain(keys);
        isAxisBandScale ? bandScale.paddingInner(innerPadding) : bandScale.paddingInner(innerPadding);
        width = bandScale.bandwidth();
        actualGroupWidth = groupWidth - (isAxisBandScale ? 0 : innerPadding * groupWidth);
        offsetValues = keys.map(key => bandScale(key) - (isAxisBandScale ? 0 : (groupWidth / 2)));
    } else if (pad !== undefined) {
        let offset;
        if (isAxisBandScale) {
            const step = scale.step();
            offset = scale.padding() * step;
            width = scale.bandwidth() + offset;
        } else {
            width = groupWidth;
        }
        offsetValues = keys.map(() => (isAxisBandScale ? -(offset / 2) : -(width / 2)));
    } else {
        padding = isAxisBandScale ? 0 : innerPadding * groupWidth;
        width = groupWidth - padding;
        actualGroupWidth = width;
        offsetValues = keys.map(() => (isAxisBandScale ? 0 : -(width / 2)));
    }

    return {
        width,
        offsetValues,
        groupWidth: actualGroupWidth,
        padding: isAxisBandScale ? innerPadding * axis.scale().step() : innerPadding * groupWidth
    };
};

/**
 * Generates an array of objects containing x, y, width and height of the bars from the data
 * @param  {Array.<Array>} data Data Array
 * @param  {Object} encoding  Config
 * @param  {Object} axes     Axes object
 * @param {Object} conf config object for point generation
 * @return {Array.<Object>}  Array of points
 */
export const getTranslatedPoints = (context, data, sizeConfig) => {
    let points = [];
    const encoding = context.config().encoding;
    const axes = context.axes();
    const colorAxis = axes.color;
    const fieldsConfig = context.data().getFieldsConfig();
    const colorEncoding = encoding.color;
    const colorField = colorEncoding.field;
    const sizeEncoding = encoding.size || {};
    const {
            x0Field,
            y0Field,
            xFieldSubType,
            yFieldSubType
        } = context.encodingFieldsInf();
    const measurement = context._store.get(PROPS.MEASUREMENT);
    const isXDim = xFieldSubType === DimensionSubtype.CATEGORICAL || xFieldSubType === DimensionSubtype.TEMPORAL;
    const isYDim = yFieldSubType === DimensionSubtype.CATEGORICAL || yFieldSubType === DimensionSubtype.TEMPORAL;
    const key = isXDim ? 'x' : (isYDim ? 'y' : null);
    const transformType = context.transformType();
    const colorFieldIndex = colorField && fieldsConfig[colorField] && fieldsConfig[colorField].index;

    for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];
        const style = {};
        const meta = {};
        const dimensions = resolveDimensions(d, {
            xFieldType: xFieldSubType,
            yFieldType: yFieldSubType,
            x0Field,
            y0Field,
            transformType,
            measurement,
            sizeConfig,
            sizeEncoding
        }, axes);

        const { color, rawColor } = getLayerColor({ datum: d, index: i },
            { colorEncoding, colorAxis, colorFieldIndex });

        style.fill = color;
        meta.stateColor = {};
        meta.originalColor = rawColor;
        meta.colorTransform = {};

        const update = dimensions.update;

        if (!isNaN(update.x) && !isNaN(update.y) && d._id !== undefined) {
            let point = null;
            point = {
                enter: dimensions.enter,
                update,
                style,
                _data: d._data,
                _id: d._id,
                meta
            };
            points.push(point);
            // Store each point in a hashmap with key as the dimensional or temporal field value
            context.cachePoint(d[key], point);
        }
    }

    points = positionPoints(context, points);
    return points;
};
