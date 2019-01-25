import {
    getClosestIndexOf,
    DateTimeFormatter,
    DimensionSubtype,
    MeasureSubtype,
    FieldType,
    DataModel
} from 'muze-utils';

const { InvalidAwareTypes } = DataModel;
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

const formatters = (formatter, interval, valueParser) => ({
    [DimensionSubtype.TEMPORAL]: (value) => {
        if (value instanceof InvalidAwareTypes) {
            return valueParser(value);
        }
        const nearestInterval = getNearestInterval(interval);
        return DateTimeFormatter.formatAs(value, timeFormats[nearestInterval]);
    },
    [MeasureSubtype.CONTINUOUS]: (value) => value instanceof InvalidAwareTypes ? valueParser(value) :
        formatter(value ? value.toFixed(2) : value),
    [DimensionSubtype.CATEGORICAL]: (value) => valueParser(value)
});

const getDefaultTooltipFormatterFn = (formatter = formatters()[DimensionSubtype.CATEGORICAL]) => formatter;

const getTabularData = (data, schema, fieldspace, context) => {
    const rows = [];
    rows.push(schema.map(d => d.name));
    const { valueParser, timeDiffs } = context;
    data.forEach((d) => {
        const row = [];
        schema.forEach((fieldObj, i) => {
            const interval = fieldObj.subtype === DimensionSubtype.TEMPORAL ? timeDiffs[fieldObj.name] : 0;
            const numberFormat = fieldObj.type === FieldType.MEASURE && fieldspace.fields[i].numberFormat();
            const formatterFn = getDefaultTooltipFormatterFn(formatters(numberFormat,
                interval, valueParser)[fieldObj.subtype]);
            const value = formatterFn(d[i]);
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
    const separator = config.separator;
    const fieldsConfig = dataModel.getFieldsConfig();
    const fieldspace = dataModel.getFieldspace();
    const detailFields = context.detailFields || [];
    const dimensions = schema.filter(d => d.type === FieldType.DIMENSION);
    const measures = schema.filter(d => d.type === FieldType.MEASURE);
    const containsDetailField = schema.find(d => detailFields.indexOf(d.name) !== -1);
    const dataLen = data.length;
    const {
        valueParser,
        axes,
        dimensionMeasureMap,
        timeDiffs
    } = context;
    const getRowContent = (field, type) => {
        let value;
        let formattedValue;
        let measureIndex;
        const values = [];
        const index = fieldsConfig[field].index;
        const interval = fieldsConfig[field].def.subtype === DimensionSubtype.TEMPORAL ?
                timeDiffs[field] : 0;
        const formatterFn = getDefaultTooltipFormatterFn(formatters(val => val, interval, valueParser)[type]);

        if (value !== null) {
            let uniqueVals = type === MeasureSubtype.CONTINUOUS ? data.map(d => d[index]) :
                [...new Set(data.map(d => d[index]))];
            uniqueVals = uniqueVals.filter(d => d !== '');
            const colorAxis = axes.color[0];
            const shapeAxis = axes.shape[0];
            const sizeAxis = axes.size[0];
            const isRetinalField = (colorAxis || shapeAxis || sizeAxis) && dataLen > 1 &&
                    type !== MeasureSubtype.CONTINUOUS;

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
                            const numberFormat = fieldspace.fields[measureIndex].numberFormat();
                            const measureFormatter = getDefaultTooltipFormatterFn(
                                formatters(numberFormat, valueParser)[MeasureSubtype.CONTINUOUS]);
                            formattedValue = measureFormatter(value);
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
                        const numberFormat = fieldspace.fields[measureIndex].numberFormat();
                        const measureFormatter = getDefaultTooltipFormatterFn(
                            formatters(numberFormat, valueParser)[MeasureSubtype.CONTINUOUS]);
                        formattedValue = measureFormatter(value);
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
                    formattedValue = formatterFn(value);
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
        fieldValues = getTabularData(data, schema, fieldspace, context);
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
