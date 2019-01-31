import {
    FieldType,
    getDomainFromData,
    setStyles,
    easeFns,
    selectElement,
    DimensionSubtype,
    STATE_NAMESPACES,
    retrieveNearestGroupByReducers,
    getObjProp
} from 'muze-utils';
import { ScaleType } from '@chartshq/muze-axis';
import { transformFactory } from '@chartshq/transform';
import { IDENTITY, STACK, GROUP, COLOR, SHAPE, SIZE, ENCODING, AGG_FN_SUM } from '../enums/constants';

const BAND = ScaleType.BAND;

export const getLayerColor = ({ datum, index }, { colorEncoding, colorAxis, colorFieldIndex }) => {
    let rawColor = '';
    let color = '';
    if (colorEncoding && colorEncoding.value instanceof Function) {
        color = colorEncoding.value(datum, index);
        rawColor = colorEncoding.value(datum, index);
    } else {
        rawColor = colorAxis.getRawColor(datum._data[colorFieldIndex]);
        color = colorAxis.getHslString(rawColor);
    }
    return { color, rawColor };
};

const transfromColor = (colorAxis, datum, styleType, intensity) => {
    datum.meta.stateColor[styleType] = datum.meta.stateColor[styleType] || datum.meta.originalColor;
    const fillColorInfo = colorAxis.transformColor(datum.meta.stateColor[styleType], intensity);
    datum.meta.stateColor[styleType] = fillColorInfo.hsla;

    return fillColorInfo;
};

export const applyInteractionStyle = (context, selectionSet, interactionStyles, config) => {
    const elements = context.getPlotElementsFromSet(selectionSet);
    const axes = context.axes();
    const colorAxis = axes.color;
    const apply = config.apply;
    const interactionType = config.interactionType;
    interactionStyles.forEach((style) => {
        const styleType = style.type;
        elements.style(styleType, ((d) => {
            const { colorTransform, stateColor, originalColor } = d.meta;
            colorTransform[interactionType] = colorTransform[interactionType] || {};
            if (apply && !colorTransform[interactionType][styleType]) {
                // fade selections
                colorTransform[interactionType][styleType] = style.intensity;
                const color = transfromColor(colorAxis, d, styleType, style.intensity).color;
                return color;
            }
            if (!apply && colorTransform[interactionType][styleType]) {
                 // unfade selections
                colorTransform[interactionType][styleType] = null;
                return transfromColor(colorAxis, d, styleType, style.intensity.map(e => -e)).color;
            }
            const [h, s, l, a] = stateColor[styleType] ? stateColor[styleType] : originalColor;
            return `hsla(${h * 360},${s * 100}%,${l * 100}%, ${a || 1})`;
        }));
    });
};

/**
 *
 *
 * @param {*} selectionSet
 * @param {*} className
 * @param {*} hasFaded
 */
export const fadeUnfadeSelection = (context, selectionSet, hasFaded, interaction) => {
    const interactionConfig = { interaction, apply: hasFaded };
    applyInteractionStyle(context, selectionSet, 'fade', interactionConfig);
};

/**
 *
 *
 * @param {*} selectionSet
 * @param {*} className
 * @param {*} hasFaded
 */
export const focusUnfocusSelection = (context, selectionSet, isFocussed, interaction) => {
    const interactionConfig = { interaction, apply: isFocussed };
    applyInteractionStyle(context, selectionSet, 'focus', interactionConfig);
};

/**
 *
 *
 * @param {*} axes
 *
 */
export const getAxesScales = (axes) => {
    const [xAxis, yAxis] = [ENCODING.X, ENCODING.Y].map(e => axes[e]);
    const [xScale, yScale] = [xAxis, yAxis].map(e => e && e.scale());
    return {
        xAxis,
        yAxis,
        xScale,
        yScale
    };
};

/**
 *
 *
 * @param {*} encoding
 * @param {*} fieldsConfig
 *
 */
export const getEncodingFieldInf = (encoding, fieldsConfig) => {
    const [xField, yField, x0Field, y0Field, colorField, shapeField, sizeField] =
        [ENCODING.X, ENCODING.Y, ENCODING.X0, ENCODING.Y0, COLOR, SHAPE, SIZE].map(e => encoding[e] &&
            encoding[e].field);

    const [xFieldType, yFieldType] = [xField, yField, x0Field, y0Field].map(e => fieldsConfig[e] &&
        fieldsConfig[e].def.type);

    const [xFieldSubType, yFieldSubType] = [xField, yField].map(e => fieldsConfig[e] && (fieldsConfig[e].def.subtype ||
        fieldsConfig[e].def.type));

    const [xFieldIndex, yFieldIndex, x0FieldIndex, y0FieldIndex] = [xField, yField, x0Field, y0Field]
        .map(e => fieldsConfig[e] && fieldsConfig[e].index);

    return {
        xField,
        yField,
        colorField,
        shapeField,
        sizeField,
        x0Field,
        y0Field,
        xFieldType,
        yFieldType,
        xFieldSubType,
        yFieldSubType,
        xFieldIndex,
        yFieldIndex,
        x0FieldIndex,
        y0FieldIndex
    };
};

/**
 *
 *
 * @param {*} dataModel
 * @param {*} config
 * @param {*} transformType
 *
 */
export const transformData = (dataModel, config, transformType, encodingFieldInf) => {
    const data = dataModel.getData({ withUid: true });
    const schema = data.schema;
    const transform = config.transform;
    const {
        xField,
        yField,
        xFieldType,
        yFieldType
    } = encodingFieldInf;
    const uniqueField = xFieldType === FieldType.MEASURE ? yField : xField;

    return transformFactory(transformType)(schema, data.data, {
        groupBy: transform.groupBy,
        uniqueField,
        sort: transform.sort || 'none',
        offset: transform.offset,
        orderBy: transform.orderBy,
        value: yFieldType === FieldType.MEASURE ? yField : xField
    }, data.uids);
};

export const getIndividualClassName = (d, i, data, context) => {
    const className = context.config().individualClassName;
    let classNameStr = '';
    if (className instanceof Function) {
        classNameStr = className(d, i, data, context);
    }
    return classNameStr;
};

/*
 * This method resolves the x, y, x0 and y0 values from the transformed data.
 * It also checks the type of transformed data for example, if it is a stacked data
 * then it fetches the y and y0 values from the stacked data.
 * @param {Array.<Array>} transformedData transformed data
 * @param {Object} fieldsConfig field definitions
 * @param {string} transformType type of transformed data - stack, group or identity.
 * @return {Array.<Object>} Normalized data
*/
export const getNormalizedData = (transformedData, fieldsConfig, encodingFieldInf, transformType) => {
    const transformedDataArr = transformType === IDENTITY ? [transformedData] : transformedData;
    const {
        xFieldType,
        xFieldIndex,
        yFieldIndex,
        x0FieldIndex,
        y0FieldIndex
    } = encodingFieldInf;
    const fieldsLen = Object.keys(fieldsConfig).length;
    /**
     * Returns normalized data from transformed data. It recursively traverses through
     * the transformed data if there it is nested.
     */
    return transformedDataArr.map((data) => {
        const values = transformType === GROUP ? data.values : data;
        return values.map((d) => {
            let pointObj = {};
            let tuple;
            if (transformType === STACK) {
                tuple = d.data || [];
                let y;
                let y0;
                let x;
                let x0;
                if (d[1] >= d[0]) {
                    y = x0 = d[1];
                    x = y0 = d[0];
                } else {
                    y = x0 = d[0];
                    x = y0 = d[1];
                }

                pointObj = xFieldType === FieldType.MEASURE ? {
                    x,
                    x0,
                    y: tuple[yFieldIndex],
                    y0: tuple[yFieldIndex]
                } : {
                    x: tuple[xFieldIndex],
                    x0: tuple[xFieldIndex],
                    y,
                    y0
                };
                pointObj._data = tuple;
                pointObj._id = tuple[fieldsLen];
            } else {
                pointObj = {
                    x: d[xFieldIndex],
                    y: d[yFieldIndex],
                    x0: d[x0FieldIndex],
                    y0: d[y0FieldIndex]
                };
                pointObj._data = d;
                pointObj._id = d[fieldsLen];
            }
            return pointObj;
        });
    }).filter(d => d.length);
};

export const calculateDomainFromData = (data, encodingFieldInf, transformType) => {
    const {
        xFieldSubType,
        yFieldSubType,
        xField,
        yField,
        x0Field,
        y0Field
    } = encodingFieldInf;
    const domains = {};
    const yEnc = ENCODING.Y;
    const xEnc = ENCODING.X;
    if (xField) {
        domains.x = getDomainFromData(data, x0Field || transformType === STACK ? [xEnc, ENCODING.X0] : [xEnc, xEnc],
            xFieldSubType);
    }
    if (yField) {
        domains.y = getDomainFromData(data, y0Field || transformType === STACK ? [ENCODING.Y0, ENCODING.Y] :
            [yEnc, yEnc], yFieldSubType);
    }

    return domains;
};

export const attachDataToVoronoi = (voronoi, points) => {
    voronoi.data([].concat(...points).filter(d => d._id !== undefined).map((d) => {
        const point = d.update;
        return {
            x: point.x,
            y: point.y,
            data: d
        };
    }));
};

/**
 *
 *
 * @param {*} target
 * @param {*} styles
 * @param {*} remove
 */
export const updateStyle = (target, styles, remove) => {
    for (const key in styles) {
        if ({}.hasOwnProperty.call(styles, key)) {
            target.style(key, remove ? null : styles[key]);
        }
    }
};

/**
 *
 *
 * @param {*} mount
 * @param {*} context
 */
export const animateGroup = (mount, context) => {
    let groupTransition;
    let update;
    const { transition, groupAnimateStyle } = context;
    const { duration, effect, disabled } = transition;
    if (groupAnimateStyle) {
        setStyles(mount.node(), groupAnimateStyle.enter);
        update = groupAnimateStyle.update;
        if (!disabled) {
            groupTransition = mount.transition()
                .ease(easeFns[effect])
                .duration(duration)
                .on('end', function () {
                    updateStyle(selectElement(this), update, true);
                });
        } else {
            groupTransition = mount;
        }
        updateStyle(groupTransition, update);
    }
};

export const positionPoints = (context, points) => {
    const positioner = context.encodingTransform();
    if (positioner) {
        return positioner(points, context, { smartLabel: context._dependencies.smartLabel });
    }
    return points;
};

/**
  * Gets the width of each group. It gets the width from axis if it is available for
  * example when the scale is nominal else it calculates the width from the
  * range of the axis and number of data points.
  *
  * @param {SimpleAxis} axis instance of axis
  * @param {number} minDiff Minimum difference between data points
  * @return {number} width of each bar
  * @private
*/
export const getGroupSpan = (axis, minDiff) => {
    let groupSpan;
    const width = axis.getUnitWidth();
    const scale = axis.scale();
    const range = scale.range();
    const domain = scale.domain();
    !width ? groupSpan = (Math.abs(range[1] - range[0]) / Math.abs(domain[1] - domain[0])) * minDiff :
        (groupSpan = width);

    return groupSpan;
};

export const getPlotMeasurement = (context, dimensionalValues) => {
    const fieldInfo = context.encodingFieldsInf();
    const axes = context.axes();
    const transformType = context.transformType();
    const config = context.config();
    const bandScale = context._bandScale;

    return ['x', 'y'].map((type) => {
        let span = 0;
        let groupSpan = 0;
        let padding = 0;
        let offsetValues = [];
        if (fieldInfo[`${type}FieldType`] === FieldType.DIMENSION) {
            let actualGroupWidth;
            const isTemporal = fieldInfo[`${type}FieldSubType`] === DimensionSubtype.TEMPORAL;
            const timeDiff = isTemporal ? context.dataProps().timeDiffs[type] : 0;
            const axis = axes[type];
            const pad = config[`pad${type.toUpperCase()}`];
            const innerPadding = config.innerPadding;
            const keys = dimensionalValues;
            const scale = axis.scale();
            groupSpan = getGroupSpan(axis, timeDiff);
            const isAxisBandScale = axis.constructor.type() === BAND;
            const axisPadding = axis.config().padding;
            // If it is a grouped bar then the width of each bar in a grouping is retrieved from
            // a band scale. The band scale will have range equal to width of one group of bars and
            // the domain is set to series keys.
            if (transformType === 'group') {
                const groupPadding = isAxisBandScale ? 0 : axisPadding * groupSpan / 2;
                bandScale.range([groupPadding, groupSpan - groupPadding]).domain(keys).paddingInner(innerPadding);
                span = bandScale.bandwidth();
                actualGroupWidth = groupSpan - (isAxisBandScale ? 0 : axisPadding * groupSpan);
                offsetValues = keys.map(key => bandScale(key) - (isAxisBandScale ? 0 : (groupSpan / 2)));
            } else if (pad !== undefined) {
                let offset;
                if (isAxisBandScale) {
                    const step = scale.step();
                    offset = scale.padding() * step;
                    span = scale.bandwidth() + offset;
                } else {
                    span = groupSpan;
                }
                offsetValues = keys.map(() => (isAxisBandScale ? -(offset / 2) : -(span / 2)));
            } else {
                padding = isAxisBandScale ? 0 : axisPadding * groupSpan;
                span = groupSpan - padding;
                actualGroupWidth = span;
                offsetValues = keys.map(() => (isAxisBandScale ? 0 : -(span / 2)));
            }

            groupSpan = actualGroupWidth;
            padding = isAxisBandScale ? axisPadding * axis.scale().step() : axisPadding * groupSpan;
        }

        return {
            span,
            offsetValues,
            groupSpan,
            padding
        };
    });
};

export const initializeGlobalState = (context) => {
    const store = context.store();
    const globalState = context.constructor.getState()[0];
    const namespace = context.metaInf().namespace;
    for (const prop in globalState) {
        store.append(`${STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE}.${prop}`, {
            [namespace]: null
        });
    }
};

export const resolveInvalidTransformType = (context) => {
    const {
        xField,
        yField,
        xFieldType,
        yFieldType
    } = context.encodingFieldsInf();
    const groupByField = context.config().transform.groupBy;
    const fieldsConfig = context.data().getFieldsConfig();
    const groupByFieldMeasure = fieldsConfig[groupByField] && fieldsConfig[groupByField].def.type === FieldType.MEASURE;
    if (!xField || !yField || groupByFieldMeasure || !groupByField || xFieldType === FieldType.DIMENSION &&
        yFieldType === FieldType.DIMENSION) {
        return IDENTITY;
    }
    return null;
};

export const getValidTransform = context => resolveInvalidTransformType(context) || context.config().transform.type;

export const getValidTransformForAggFn = (context) => {
    const resolvedInvalidTransformType = resolveInvalidTransformType(context);
    if (resolvedInvalidTransformType) {
        return resolvedInvalidTransformType;
    }

    const {
        xField,
        yField,
        xFieldType,
        yFieldType
    } = context.encodingFieldsInf();
    const groupByField = context.config().transform.groupBy;
    const isCustomTransformTypeProvided = !!getObjProp(context._customConfig, 'transform', 'type');
    let transformType = context.config().transform.type;

    if (!isCustomTransformTypeProvided && groupByField && xFieldType !== yFieldType) {
        const measureField = xFieldType === FieldType.MEASURE ? xField : yField;
        const { [measureField]: aggFn } = retrieveNearestGroupByReducers(context.data(), measureField);
        transformType = aggFn === AGG_FN_SUM ? STACK : GROUP;
    }

    return transformType;
};

export const getMarkId = (source, schema) => source.filter((val, i) => schema[i] &&
    schema[i].type === FieldType.DIMENSION).join();
