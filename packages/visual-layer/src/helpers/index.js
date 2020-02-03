import {
    FieldType,
    getDomainFromData,
    setStyles,
    easeFns,
    selectElement,
    DimensionSubtype,
    retrieveNearestGroupByReducers,
    getObjProp,
    COORD_TYPES,
    CommonProps,
    defaultValue,
    isSimpleObject,
    InvalidAwareTypes
} from 'muze-utils';
import { ScaleType } from '@chartshq/muze-axis';
import { transformFactory } from '@chartshq/transform';
import { IDENTITY, STACK, GROUP, COLOR, SHAPE, SIZE, ENCODING, AGG_FN_SUM, ASCENDING, TEXT } from '../enums/constants';

const BAND = ScaleType.BAND;
const { POLAR, CARTESIAN } = COORD_TYPES;

export const transformColor = (colorAxis, datum, styleType, intensity, interactionType) => {
    const meta = datum.meta;
    const stateColor = defaultValue(meta.currentState[interactionType][styleType], meta.originalState[styleType]);
    const colorInfo = colorAxis.transformColor(stateColor, intensity);

    // meta.stateColor[styleType] = colorInfo.hsla;
    meta.currentState[interactionType][styleType] = colorInfo.hsla;
    return colorInfo;
};

export const applyInteractionStyle = (context, selectionSet, interactionStyles, config) => {
    const elements = context.getPlotElementsFromSet(selectionSet);
    const { apply, interactionType, reset } = config;
    const mountPoint = selectElement(context.mount()).select('.muze-overlay-paths').node();

    elements.forEach((elem) => {
        const options = { mountPoint, apply, reset };
        context.applyLayerStyle(elem, interactionType, interactionStyles, options);

        // const interactionStylesEntries = Object.entries(interactionStyles.style);

        // for (const [type, value] of interactionStylesEntries) {
        //     const style = { type, value };
        //     const options = { mountPoint, apply, reset };
        //     context.applyLayerStyle(elem, interactionType, style, options);
        // }
    });
};

export const retrieveEncodingInf = (encoding, fieldsConfig, encodingNames) => {
    const encodingInf = {};

    encodingNames
        .forEach((e) => {
            const field = getObjProp(encoding, e, 'field');
            encodingInf[`${e}Field`] = field;
            encodingInf[`${e}FieldIndex`] = getObjProp(fieldsConfig, field, 'index');
            encodingInf[`${e}FieldType`] = getObjProp(fieldsConfig, field, 'def', 'type');
            encodingInf[`${e}FieldSubType`] = getObjProp(fieldsConfig, field, 'def', 'subtype');
        });
    return encodingInf;
};

export const encodingFieldInfRetriever = {
    [POLAR]: (encoding, fieldsConfig) => {
        const fields = [ENCODING.RADIUS, ENCODING.RADIUS0, ENCODING.ANGLE, ENCODING.ANGLE0, COLOR, SHAPE, SIZE, TEXT];
        return retrieveEncodingInf(encoding, fieldsConfig, fields);
    },
    [CARTESIAN]: (encoding, fieldsConfig) => {
        const fields = [ENCODING.X, ENCODING.Y, ENCODING.X0, ENCODING.Y0, COLOR, SHAPE, SIZE, TEXT];
        return retrieveEncodingInf(encoding, fieldsConfig, fields);
    }
};

export const setNullsInStack = (transformedData, schema, value, setNulls) => {
    const uniqueFieldIndex = schema.findIndex(d => d.name === value);
    transformedData.forEach((seriesData) => {
        seriesData.forEach((dataObj) => {
            if (dataObj.data[uniqueFieldIndex] === null && !setNulls) {
                dataObj[0] = new InvalidAwareTypes();
                dataObj[1] = new InvalidAwareTypes();
            }
        });
    });
    return transformedData;
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
    const { transform, connectNullData: setNullData } = config;
    const {
        xField,
        yField,
        xFieldType,
        yFieldType
    } = encodingFieldInf;
    const uniqueField = xFieldType === FieldType.MEASURE ? yField : xField;
    const value = yFieldType === FieldType.MEASURE ? yField : xField;
    let transformedData = transformFactory(transformType)(schema, data.data, {
        groupBy: transform.groupBy,
        uniqueField,
        sort: transform.sort || 'none',
        offset: transform.offset,
        orderBy: transform.orderBy,
        value
    }, data.uids);

    if (transformType === STACK) {
        transformedData = setNullsInStack(transformedData, schema, value, setNullData);
    }
    return transformedData;
};

export const getIndividualClassName = (d, i, data, context) => {
    const className = context.config().individualClassName;
    let classNameStr = '';
    if (className instanceof Function) {
        classNameStr = className(d, i, data, context);
    }
    return classNameStr;
};

export const dataNormalizers = {
    [POLAR]: (transformedData, encodingFieldInf, fieldsConfig) => {
        const {
            radiusFieldIndex,
            angleFieldIndex,
            radius0FieldIndex,
            angle0FieldIndex
        } = encodingFieldInf;
        const fieldsLen = Object.keys(fieldsConfig).length;

        /**
         * Returns normalized data from transformed data. It recursively traverses through
         * the transformed data if there it is nested.
         */
        return transformedData.map(data => data.map((d) => {
            const pointObj = {
                radius: d[radiusFieldIndex],
                angle: angleFieldIndex !== undefined ? d[angleFieldIndex] : 1,
                radius0: d[radius0FieldIndex],
                angle0: d[angle0FieldIndex]
            };
            [COLOR, SHAPE, SIZE, TEXT].forEach((enc) => {
                pointObj[enc] = d[encodingFieldInf[`${enc}FieldIndex`]];
            });
            pointObj.source = d;
            pointObj.rowId = d[fieldsLen];
            return pointObj;
        })).filter(d => d.length);
    },
    [CARTESIAN]: (transformedData, encodingFieldInf, fieldsConfig, transformType) => {
        const {
            xFieldType,
            xFieldIndex,
            yFieldIndex,
            x0FieldIndex,
            y0FieldIndex
        } = encodingFieldInf;
        const fieldsArr = Object.keys(fieldsConfig);
        const fieldsLen = fieldsArr.length;

        /**
         * Returns normalized data from transformed data. It recursively traverses through
         * the transformed data if there it is nested.
         */
        return transformedData.map((data) => {
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
                    pointObj.source = tuple;
                    pointObj.rowId = tuple[fieldsLen];
                    [COLOR, SHAPE, SIZE, TEXT].forEach((enc) => {
                        pointObj[enc] = tuple[encodingFieldInf[`${enc}FieldIndex`]];
                    });
                } else {
                    pointObj = {
                        x: d[xFieldIndex],
                        y: d[yFieldIndex],
                        x0: d[x0FieldIndex],
                        y0: d[y0FieldIndex]
                    };
                    pointObj.source = d;
                    pointObj.rowId = d[fieldsLen];
                    [COLOR, SHAPE, SIZE, TEXT].forEach((enc) => {
                        pointObj[enc] = d[encodingFieldInf[`${enc}FieldIndex`]];
                    });
                }
                const source = pointObj.source;
                pointObj.dataObj = fieldsArr.reduce((acc, name) => {
                    acc[name] = source[fieldsConfig[name].index];
                    return acc;
                }, {});
                return pointObj;
            });
        }).filter(d => d.length);
    }
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
export const getNormalizedData = (transformedData, context) => {
    const transformType = context.transformType();
    const transformedDataArr = transformType === IDENTITY ? [transformedData] : transformedData;
    const encodingFieldInf = context.encodingFieldsInf();
    const fieldsConfig = context.data().getFieldsConfig();
    return dataNormalizers[context.coord()](transformedDataArr, encodingFieldInf, fieldsConfig, transformType);
};

export const domainCalculator = {
    [POLAR]: (data, layerInst) => {
        const config = layerInst.config();
        const { sort } = config;
        let angleValues = data[0];
        const radius0Field = getObjProp(config.encoding.radius0, 'field');
        if (sort) {
            angleValues = angleValues.sort((a, b) => (sort === ASCENDING ? a.radius - b.radius : b.radius - a.radius));
        }
        const radiusDomain = getDomainFromData(data, [ENCODING.RADIUS, radius0Field ?
            ENCODING.RADIUS0 : ENCODING.RADIUS]);
        return {
            radius: radiusDomain,
            angle: angleValues.map(d => d.angle),
            angle0: angleValues.map(d => d.angle0)
        };
    },
    [CARTESIAN]: (data, layerInst) => {
        const transformType = layerInst.transformType();
        const encodingFieldInf = layerInst.encodingFieldsInf();
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
    }
};

const defFn = (d) => {
    const { x, y } = d.update;
    return {
        x,
        y
    };
};

export const attachDataToVoronoi = (voronoi, points, accessor = defFn) => {
    voronoi.data([].concat(...points).filter(d => d.rowId !== undefined).map((d) => {
        const { x, y } = accessor(d);
        return {
            x,
            y,
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

export const renderLayer = (context) => {
    const mount = context.mount();
    if (mount) {
        context.render(mount);
        context.dependencies().throwback.commit(CommonProps.ON_LAYER_DRAW, true, context.metaInf().parentNamespace);
    }
};

const transformResolverPredicates = (encodingFieldInf, context, groupByField) => {
    const fieldsConfig = context.data().getFieldsConfig();
    const { xField, yField, xFieldType, yFieldType } = encodingFieldInf;
    const dimensionField = ['xField', 'yField'].find(type =>
        encodingFieldInf[`${type}Type`] === FieldType.DIMENSION);

    return [
        !xField,
        !yField,
        !groupByField,
        getObjProp(fieldsConfig[groupByField], 'def', 'type') === FieldType.MEASURE,
        xFieldType === FieldType.DIMENSION && yFieldType === FieldType.DIMENSION,
        dimensionField && encodingFieldInf[dimensionField] === groupByField
    ];
};

export const resolveInvalidTransformType = (context) => {
    const encodingFieldInf = context.encodingFieldsInf();
    const groupByField = context.config().transform.groupBy;

    if (transformResolverPredicates(encodingFieldInf, context, groupByField).some(value => value)) {
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

export const resolveEncodingValues = (data, i, dataArr, layerInst) => {
    const transformedValues = {};
    const values = data.values;
    const encoding = layerInst.config().encoding;
    for (const key in values) {
        const value = getObjProp(encoding[key], 'value');
        if (value instanceof Function) {
            transformedValues[key] = value(values, i, dataArr, layerInst);
        } else {
            transformedValues[key] = values[key];
        }
    }
    return transformedValues;
};

export const getColorMetaInf = (initialStyle, conf = {}) => ({
    originalStyle: Object.assign({}, {
        styles: initialStyle
    }, conf),
    currentState: new Map()
});

const getCoordValue = (radius, trig, angle, offset) => radius * Math[trig](angle) + offset;

const coordValueGetter = (radius, angle, xOffset, yOffset) => ({
    x: getCoordValue(radius, 'cos', angle, xOffset),
    y: getCoordValue(radius, 'sin', angle, yOffset)
});

export const toCartesianCoordinates = (points, measurement, rangePlot = false) => {
    const xOffset = measurement.width / 2;
    const yOffset = measurement.height / 2;
    for (let i = 0, len = points.length; i < len; i++) {
        const point = points[i];
        const { angle, radius, radius0, angle0 } = point.update;
        point.update = coordValueGetter(radius, angle, xOffset, yOffset);
        if (rangePlot) {
            const update = point.update = coordValueGetter(radius0, angle0, xOffset, yOffset);
            const { x: x0, y: y0 } = coordValueGetter(radius, angle, xOffset, yOffset);
            update.x0 = x0;
            update.y0 = y0;
        }
    }
    return points;
};

export const sortData = (data, axes) => {
    const { x: xAxis, y: yAxis } = axes;
    const axisArr = [xAxis, yAxis];
    for (let i = 0, len = axisArr.length; i < len; i++) {
        const axis = axisArr[i];
        if (axis.constructor.type() === BAND) {
            const key = i ? 'y' : 'x';
            const dom = axis.domain();
            const indices = dom.reduce((acc, v, idx) => {
                acc[v] = idx;
                return acc;
            }, {});
            data.sort((a, b) => indices[a[key]] - indices[b[key]]);
            break;
        }
    }
    return data;
};

export const getBoundBoxes = points => points.map((point) => {
    const { x, y } = point.update;
    const data = point.data;
    return {
        minX: x,
        maxX: x,
        minY: y,
        maxY: y,
        data
    };
});

export const getDataFromEvent = (context, event, data) => {
    const dataPoint = data || selectElement(event.target).data()[0];
    if (isSimpleObject(dataPoint) && getObjProp(dataPoint, 'meta', 'layerId') === context.id()) {
        const values = dataPoint && dataPoint.source;
        let identifiers = null;
        if (values) {
            identifiers = context.getIdentifiersFromData(values, dataPoint.rowId);
        }
        return {
            dimensions: [dataPoint],
            id: identifiers,
            layerId: context.id()
        };
    }
    return null;
};
