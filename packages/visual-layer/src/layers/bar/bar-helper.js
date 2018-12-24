import { MeasureSubtype, DimensionSubtype } from 'muze-utils';
import { STACK } from '../../enums/constants';
import { getLayerColor, positionPoints, getIndividualClassName } from '../../helpers';

/**
 *
 *
 * @param {*} type
 * @param {*} fieldInfo
 * @param {*} config
 * @param {*} data
 *
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

    const sizeValue = sizeEncoding.value;
    let enter = 0;
    let pos;
    let space = 0;
    let enterSpace = 0;
    if (fieldType !== undefined) {
        if (config[`${type}0Field`]) {
            const minVal = data[type];
            const maxVal = data[`${type}0`];
            let min;
            let max;
            if (minVal === null || maxVal === null) {
                return {
                    enterSpace: undefined,
                    enter: undefined,
                    pos: undefined,
                    space: undefined
                };
            } else if (fieldType === MeasureSubtype.CONTINUOUS || fieldType === DimensionSubtype.TEMPORAL) {
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
 *
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
    const measurement = context.measurement();
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
                source: d._data,
                rowId: d._id,
                meta
            };
            point.className = getIndividualClassName(d, i, data, context);
            points.push(point);
            // Store each point in a hashmap with key as the dimensional or temporal field value
            context.cachePoint(d[key], point);
        }
    }

    points = positionPoints(context, points);
    return points;
};
