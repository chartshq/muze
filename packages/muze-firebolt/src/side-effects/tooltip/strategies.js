import {
    FieldType,
    GROUP_BY_FUNCTIONS,
    formatTemporal,
    DimensionSubtype,
    MeasureSubtype,
    DataModel,
    defaultValue,
    retrieveFieldDisplayName
} from 'muze-utils';

const { SUM, COUNT } = GROUP_BY_FUNCTIONS;
const { InvalidAwareTypes } = DataModel;

const formatters = (formatter, interval, valueParser) => ({
    [DimensionSubtype.TEMPORAL]: (value) => {
        if (value instanceof InvalidAwareTypes) {
            return valueParser(value);
        }
        return formatTemporal(value, interval);
    },
    [MeasureSubtype.CONTINUOUS]: value => (value instanceof InvalidAwareTypes ? valueParser(value) :
        formatter(value.toFixed(2))),
    [DimensionSubtype.CATEGORICAL]: value => valueParser(value)
});

const getDefaultTooltipFormatterFn = (formatter, defaultFormatter) => defaultValue(formatter, defaultFormatter);

const getTabularData = (dataObj, context, defaultFormatter) => {
    const rows = [];
    const { data, schema, fieldspace } = dataObj;
    rows.push(schema.map(d => d.name));
    const { valueParser, timeDiffs } = context;
    data.forEach((d) => {
        const row = [];
        schema.forEach((fieldObj, i) => {
            const interval = fieldObj.subtype === DimensionSubtype.TEMPORAL ? timeDiffs[fieldObj.name] : 0;
            const numberFormat = fieldObj.type === FieldType.MEASURE && fieldspace.fields[i].numberFormat();
            const formatterFn = getDefaultTooltipFormatterFn(formatters(numberFormat,
                interval, valueParser)[fieldObj.subtype], defaultFormatter);
            const value = formatterFn(d[i]);
            row.push(value);
        });
        rows.push(row);
    });
    return rows;
};

const getRowContent = (fieldInf, context, dataInf, config) => {
    let value;
    let formattedValue;
    let measureIndex;

    const {
        valueParser,
        axes,
        dimensionMeasureMap,
        timeDiffs
    } = context;
    const { subtype: type, name: field } = fieldInf;

    const { fieldsConfig, defFormatter, data, fieldspace } = dataInf;
    const { separator, classPrefix } = config;
    const dataLen = data.length;
    const values = [];
    const index = fieldsConfig[field].index;
    const interval = fieldsConfig[field].def.subtype === DimensionSubtype.TEMPORAL ? timeDiffs[field] : 0;
    const formatterFn = getDefaultTooltipFormatterFn(formatters(val => val, interval, valueParser)[type],
        defFormatter);

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
        let associatedMeasures = dimensionMeasureMap[field];

        if (associatedMeasures instanceof Array && dataLen > 1) {
            associatedMeasures = associatedMeasures.filter(d => d in fieldsConfig);
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
                const formattedKey = type === DimensionSubtype.TEMPORAL ? formatterFn(key, interval) : key;
                values.push([icon, `${formattedKey}`]);
                associatedMeasures.forEach((measure) => {
                    measureIndex = fieldsConfig[measure].index;
                    value = data[i][measureIndex];
                    const numberFormat = fieldspace.fields[measureIndex].numberFormat();
                    const measureFormatter = getDefaultTooltipFormatterFn(
                        formatters(numberFormat, interval, valueParser)[MeasureSubtype.CONTINUOUS]);
                    formattedValue = measureFormatter(value);
                    values.push([{
                        value: `${retrieveFieldDisplayName(context.data, measure)}${separator}`,
                        style: {
                            'margin-left': `${config.margin}px}`
                        },
                        className: `${classPrefix}-tooltip-key`
                    }, {
                        value: `${formattedValue}`,
                        className: `${classPrefix}-tooltip-value`
                    }]);
                });
            } else {
                measureIndex = fieldsConfig[associatedMeasures[0]].index;
                value = data[i][measureIndex];
                const numberFormat = fieldspace.fields[measureIndex].numberFormat();
                const measureFormatter = getDefaultTooltipFormatterFn(
                    formatters(numberFormat, interval, valueParser)[MeasureSubtype.CONTINUOUS]);
                formattedValue = measureFormatter(value);
                const formattedKey = type === DimensionSubtype.TEMPORAL ? formatterFn(key, interval) : key;
                values.push([
                    icon,
                    {
                        value: `${formattedKey}`,
                        className: `${classPrefix}-tooltip-key`
                    },
                    {
                        value: `${formattedValue}`,
                        className: `${classPrefix}-tooltip-value`
                    }
                ]);
            }
        } else {
            key = field;
            value = val;
            formattedValue = formatterFn(value);
            values.push([{
                value: `${retrieveFieldDisplayName(context.data, key)}${separator}`,
                className: `${config.classPrefix}-tooltip-key`
            }, {
                value: `${formattedValue}`,
                className: `${config.classPrefix}-tooltip-value`
            }]);
        }
    });
    return values;
};

export const buildTooltipData = (dataModel, config = {}, context) => {
    let fieldValues = [];
    const dataObj = dataModel.getData();
    const data = dataObj.data;
    const schema = dataObj.schema;
    const fieldspace = dataModel.getFieldspace();
    const fieldsConfig = dataModel.getFieldsConfig();
    const detailFields = context.detailFields || [];
    const dimensions = schema.filter(d => d.type === FieldType.DIMENSION);
    const measures = schema.filter(d => d.type === FieldType.MEASURE);
    const containsDetailField = schema.find(d => detailFields.indexOf(d.name) !== -1);
    const dataLen = data.length;
    const {
        valueParser,
        dimensionMeasureMap
    } = context;
    const defFormatter = formatters(null, null, valueParser)[DimensionSubtype.CATEGORICAL];

    if (dataLen > 1 && containsDetailField) {
        fieldValues = getTabularData({
            data,
            schema,
            fieldspace
        }, context, defFormatter);
    } else {
        dimensions.forEach((item) => {
            fieldValues = [...fieldValues, ...getRowContent(item, context, {
                fieldsConfig,
                data,
                defFormatter,
                fieldspace
            }, config)];
        });

        const allMeasures = [...new Set(...Object.values(dimensionMeasureMap))];
        const filteredMeasures = dataLen > 1 ? measures.filter(d => allMeasures.indexOf(d.name) === -1)
            : measures;

        filteredMeasures.forEach((item) => {
            fieldValues = [...fieldValues, ...getRowContent(item, context, {
                fieldsConfig,
                data,
                defFormatter,
                fieldspace
            }, config)];
        });
    }

    return fieldValues;
};

export const strategies = {
    selectionSummary: (dm, config, context) => {
        const { selectionSet } = context;
        const aggFns = selectionSet.mergedEnter.aggFns;
        const dataObj = dm.getData();
        const measures = dataObj.schema.filter(d => d.type === FieldType.MEASURE);
        const aggregatedModel = dm.groupBy([''], measures.reduce((acc, v) => {
            acc[v.name] = aggFns[v.name] === COUNT ? SUM : aggFns[v.name];
            return acc;
        }, {
            saveChild: false
        }));
        const fieldsConf = aggregatedModel.getFieldsConfig();
        let values = [[{
            value: `${dataObj.data.length}`,
            style: {
                'font-weight': 'bold'
            }
        }, 'Items Selected']];
        const measureNames = measures.map(d => d.name);
        measureNames.forEach((measure) => {
            values.push([`(${aggFns[measure].toUpperCase()})`, `${retrieveFieldDisplayName(dm, measure)}`,
                {
                    value: `${aggregatedModel.getData().data[0][fieldsConf[measure].index].toFixed(2)}`,
                    style: {
                        'font-weight': 'bold'
                    }
                }]);
        });
        if (measureNames.length === 1) {
            values = [[...values[0], ...values[1]]];
        }
        return values;
    },
    highlightSummary: (data, config, context) => {
        const values = buildTooltipData(data, config, context);
        return values;
    }
};
