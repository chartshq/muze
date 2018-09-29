import {
    getClosestIndexOf,
    DateTimeFormatter,
    DimensionSubtype,
    FieldType
} from 'muze-utils';

const timeFormats = {
    millisecond: '%A, %b %e, %H:%M:%S.%L',
    second: '%A, %b %e, %H:%M:%S',
    minute: '%A, %b %e, %H:%M',
    hour: '%A, %b %e, %H:%M',
    day: '%A, %b %e, %Y',
    month: '%B %Y',
    year: '%Y'
};
const timeDurations = [
    ['millisecond', 'second', 'minute', 'hour', 'day', 'month', 'year'],
    [1, 1000, 60000, 3600000, 86400000, 2592000000, 31536000000]
];
const getNearestInterval = (interval) => {
    const index = getClosestIndexOf(timeDurations[1], interval);
    return timeDurations[0][index];
};
const defaultTooltipFormatters = (type, formatter) => {
    const formatters = {
        [DimensionSubtype.TEMPORAL]: (value, interval) => {
            const nearestInterval = getNearestInterval(interval);
            return DateTimeFormatter.formatAs(value, timeFormats[nearestInterval]);
        },
        [FieldType.MEASURE]: value => formatter(value ? value.toFixed(2) : value),
        [FieldType.DIMENSION]: value => value
    };
    return formatters[type];
};

const getTabularData = (data, schema, fieldspace, timeDiffs) => {
    const rows = [];
    rows.push(schema.map(d => d.name));
    data.forEach((d) => {
        const row = [];
        schema.forEach((fieldObj, i) => {
            const interval = fieldObj.subtype === DimensionSubtype.TEMPORAL ? timeDiffs[fieldObj.name] : 0;
            const numberFormat = fieldObj.type === FieldType.MEASURE && fieldspace.fields[i]._ref.numberFormat();
            const formatterFn = defaultTooltipFormatters(fieldObj.subtype || fieldObj.type, numberFormat);
            const value = formatterFn(d[i], interval);
            row.push(value);
        });
        rows.push(row);
    });
    return rows;
};

export const buildTooltipData = (dataModel, config = {}, context) => {
    let fieldValues = [];
    const dataObj = dataModel.getData();
    const data = dataObj.data;
    const schema = dataObj.schema;
    const formatters = config.formatters;
    const separator = config.separator;
    const fieldsConfig = dataModel.getFieldsConfig();
    const fieldspace = dataModel.getFieldspace();
    const fieldsObj = fieldspace.fieldsObj();
    const dimensionMeasureMap = context.dimensionMeasureMap;
    const axes = context.axes;
    const detailFields = context.detailFields || [];
    const dimensions = schema.filter(d => d.type === FieldType.DIMENSION);
    const measures = schema.filter(d => d.type === FieldType.MEASURE);
    // const containsRetinalField = schema.find(d => d.name in dimensionMeasureMap);
    const containsDetailField = schema.find(d => detailFields.indexOf(d.name) !== -1);
    const dataLen = data.length;
    const getRowContent = (field, type) => {
        let value;
        let formattedValue;
        let measureIndex;
        const values = [];
        const index = fieldsConfig[field].index;
        const interval = fieldsConfig[field].def.subtype === DimensionSubtype.TEMPORAL ?
                fieldsObj[field].getMinDiff() : 0;
        const formatterFn = (formatters && formatters[field]) || defaultTooltipFormatters(type, val => val);

        if (value !== null) {
            let uniqueVals = type === FieldType.MEASURE ? data.map(d => d[index]) :
                [...new Set(data.map(d => d[index]))];
            uniqueVals = uniqueVals.filter(d => d !== '');
            const colorAxis = axes.color[0];
            const shapeAxis = axes.shape[0];
            const sizeAxis = axes.size[0];
            const isRetinalField = (colorAxis || shapeAxis || sizeAxis) && dataLen > 1 &&
                    type !== FieldType.MEASURE;

            uniqueVals.forEach((val, i) => {
                let key;
                const associatedMeasures = dimensionMeasureMap[field];

                if (associatedMeasures && associatedMeasures.length && dataLen > 1) {
                    key = val;
                    let icon = {
                        value: ''
                    };

                    if (isRetinalField) {
                        icon = {
                            type: 'icon',
                            color: colorAxis.getColor(val),
                            shape: shapeAxis.getShape(val),
                            size: sizeAxis.getSize(val) * config.iconScale
                        };
                    }
                    if (associatedMeasures.length > 1) {
                        values.push([icon, `${key}`]);
                        associatedMeasures.forEach((measure) => {
                            measureIndex = fieldsConfig[measure].index;
                            value = data[i][measureIndex];
                            formattedValue = defaultTooltipFormatters('measure',
                                fieldspace.fields[measureIndex]._ref.numberFormat())(value, interval);
                            values.push([{
                                value: `${measure}${separator}`,
                                style: {
                                    'margin-left': `${config.margin}px}`
                                },
                                className: `${config.classPrefix}-tooltip-key`
                            }, {
                                value: `${formattedValue}`,
                                className: `${config.classPrefix}-tooltip-value`
                            }]);
                        });
                    } else {
                        measureIndex = fieldsConfig[associatedMeasures[0]].index;
                        value = data[i][measureIndex];
                        formattedValue = defaultTooltipFormatters('measure',
                            fieldspace.fields[measureIndex]._ref.numberFormat())(value, interval);
                        values.push([icon, {
                            value: `${key}${separator}`,
                            className: `${config.classPrefix}-tooltip-key`
                        }, {
                            value: `${formattedValue}`,
                            className: `${config.classPrefix}-tooltip-value`
                        }]);
                    }
                } else {
                    key = field;
                    value = val;
                    formattedValue = formatterFn(value, interval);
                    values.push([{
                        value: `${key}${separator}`,
                        className: `${config.classPrefix}-tooltip-key`
                    }, {
                        value: `${formattedValue}`,
                        className: `${config.classPrefix}-tooltip-value`
                    }]);
                }
            });
        }
        return values;
    };
    let displayFormat = 'keyValue';

    if (dataLen > 1 && containsDetailField) {
        fieldValues = getTabularData(data, schema, fieldspace, context.timeDiffs);
        displayFormat = 'table';
    } else {
        dimensions.forEach((item) => {
            const type = item.subtype ? item.subtype : item.type;
            fieldValues = [...fieldValues, ...getRowContent(item.name, type)];
        });

        const allMeasures = [...new Set(...Object.values(dimensionMeasureMap))];
        const filteredMeasures = dataLen > 1 ? measures.filter(d => allMeasures.indexOf(d.name) === -1)
            : measures;

        filteredMeasures.forEach((item) => {
            const type = item.subtype ? item.subtype : item.type;
            fieldValues = [...fieldValues, ...getRowContent(item.name, type)];
        });
    }

    return {
        content: fieldValues,
        displayFormat
    };
};

/**
 * This contains the strategy methods for showing tooltip in the chart.
 * @param {VisualUnit} context Attached instance.
 */
export const strategy = {
    keyValue: (data, config, context) => {
        const values = buildTooltipData(data, config, context);
        return values;
    }
};

export const DEFAULT_STRATEGY = 'keyValue';
