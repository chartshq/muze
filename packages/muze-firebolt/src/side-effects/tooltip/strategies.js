import {
    FieldType,
    GROUP_BY_FUNCTIONS,
    formatTemporal,
    DimensionSubtype,
    MeasureSubtype,
    DataModel,
    defaultValue,
    retrieveFieldDisplayName,
    nestCollection,
    getObjProp,
    intersect
} from 'muze-utils';
import { TABLE_FORMAT } from '@chartshq/muze-tooltip';
import { SELECTION_SUMMARY, HIGHLIGHT_SUMMARY } from '../../enums/tooltip-strategies';

const { SUM, COUNT } = GROUP_BY_FUNCTIONS;
const { InvalidAwareTypes } = DataModel;

const formatters = (formatter, interval, valueParser) => ({
    [DimensionSubtype.TEMPORAL]: value => (value instanceof InvalidAwareTypes ? valueParser(value) :
        formatTemporal(Number(value), interval)),
    [MeasureSubtype.CONTINUOUS]: value => (value instanceof InvalidAwareTypes ? valueParser(value) :
        formatter(value.toFixed(2))),
    [DimensionSubtype.CATEGORICAL]: value => valueParser(value)
});

const getTabularData = (dataObj, fieldInf) => {
    const rows = [];
    const { data, schema } = dataObj;
    rows.push(schema.map(d => fieldInf[d.name].displayName));

    data.forEach((d) => {
        const row = [];
        schema.forEach((fieldObj, i) => {
            const value = fieldInf[fieldObj.name].fn(d[i]);
            row.push(value);
        });
        rows.push(row);
    });
    return rows;
};

const getKeyValue = (field, value, classPrefix, margin) => {
    const keyObj = {
        value: field,
        className: `${classPrefix}-tooltip-key`
    };
    if (margin !== undefined) {
        keyObj.style = {
            'margin-left': `${margin}px`
        };
    }
    return [keyObj, {
        value,
        className: `${classPrefix}-tooltip-value`
    }];
};

const generateRetinalFieldsValues = (valueArr, retinalFields, content, context) => {
    const { fieldsConfig, dimensionMeasureMap, axes, config, fieldInf, dataLen } = context;
    const { classPrefix, margin, separator } = config;
    const colorAxis = axes.color[0];
    const shapeAxis = axes.shape[0];
    const sizeAxis = axes.size[0];

    for (const retField in retinalFields) {
        const retIndex = fieldsConfig[retField].index;
        const retinalFieldValue = valueArr[retIndex];
        const measuresArr = dimensionMeasureMap[retField];
        const icon = {
            type: 'icon',
            color: colorAxis.getColor(retinalFieldValue),
            shape: shapeAxis.getShape(retinalFieldValue),
            size: sizeAxis.getSize(retinalFieldValue) * config.iconScale
        };
        const { displayName, fn } = fieldInf[retField];
        const formattedRetinalValue = fn(retinalFieldValue);

        if (dataLen === 1) {
            content.push(getKeyValue(displayName, formattedRetinalValue, classPrefix));
        } else {
            const hasMultipleMeasures = measuresArr.length > 1;
            hasMultipleMeasures && (content.push([icon, formattedRetinalValue]));
            measuresArr.forEach((measure) => {
                const measureIndex = fieldsConfig[measure].index;
                const { displayName: dName, fn: formatterFn } = fieldInf[measure];
                const value = formatterFn(valueArr[measureIndex]);
                content.push(hasMultipleMeasures ?
                        getKeyValue(`${dName}${separator}`, value, classPrefix, margin) :
                [icon, ...getKeyValue(formattedRetinalValue, value, classPrefix)
                ]);
            });
        }
    }
};

const getFieldInf = (schema, dataModel, context) => {
    const { valueParser, timeDiffs } = context;
    const fieldsObj = dataModel.getFieldspace().fieldsObj();
    const defFormatter = formatters(null, null, valueParser)[DimensionSubtype.CATEGORICAL];

    return schema.reduce((inf, field) => {
        const { subtype, name, type } = field;
        const interval = subtype === DimensionSubtype.TEMPORAL ? timeDiffs[name] : 0;
        const nf = type === FieldType.MEASURE ? fieldsObj[name].numberFormat() : val => val;
        inf[name] = {
            fn: defaultValue(formatters(nf, interval, valueParser)[subtype], defFormatter),
            displayName: `${retrieveFieldDisplayName(dataModel, name)}`
        };
        return inf;
    }, {});
};

export const buildTooltipData = (dataModel, config = {}, context) => {
    let nestedDataObj;
    let fieldValues = [];
    const { data, schema } = dataModel.getData();
    const fieldspace = dataModel.getFieldspace();
    const fieldsConfig = dataModel.getFieldsConfig();
    const { color, shape, size } = context.firebolt.context.retinalFields();
    const detailFields = context.detailFields || [];
    const dimensions = schema.filter(d => d.type === FieldType.DIMENSION);
    const measures = schema.filter(d => d.type === FieldType.MEASURE);
    const containsDetailField = !!intersect(schema, detailFields).length;
    const dataLen = data.length;
    const {
        dimensionMeasureMap,
        axes
    } = context;
    const fieldInf = getFieldInf(schema, dataModel, context);

    let displayFormat;
    if (dataLen > 1 && containsDetailField) {
        fieldValues = getTabularData({
            data,
            schema,
            fieldspace
        }, fieldInf);
        displayFormat = TABLE_FORMAT;
    } else {
        const retinalFields = [color.field, shape.field, size.field].reduce((acc, field) => {
            field && fieldsConfig[field].def.type === FieldType.DIMENSION && (acc[field] = 1);
            return acc;
        }, {});
        const filteredDimensions = dimensions.filter(field => !retinalFields[field.name]);
        const indices = filteredDimensions.map(dim => fieldsConfig[dim.name].index);
        const allMeasures = [...new Set(...Object.values(dimensionMeasureMap))];
        const filteredMeasures = dataLen > 1 ? measures.filter(d => allMeasures.indexOf(d.name) === -1) : measures;

        nestedDataObj = nestCollection({
            data,
            keys: indices
        });
        nestedDataObj = !getObjProp(nestedDataObj[0], 'key') ? [{
            values: nestedDataObj
        }] : nestedDataObj;

        const generateTooltipContent = (nestedData, index = 0, content = []) => {
            const { classPrefix, separator } = config;

            for (let i = 0, len = nestedData.length; i < len; i++) {
                const { values, key } = nestedData[i];
                const field = getObjProp(schema, indices[index], 'name');

                if (field) {
                    const { displayName, fn } = fieldInf[field];
                    const formattedValue = fn(key);
                    content.push(getKeyValue(`${displayName}${separator}`, formattedValue, classPrefix));
                }

                if (values[0] && values[0].key) {
                    generateTooltipContent(values, index + 1, content);
                } else {
                    for (let j = 0, len2 = values.length; j < len2; j++) {
                        const valueArr = values[j];
                        generateRetinalFieldsValues(valueArr, retinalFields, content, {
                            fieldInf,
                            axes,
                            config,
                            fieldsConfig,
                            dimensionMeasureMap,
                            dataLen
                        });

                        filteredMeasures.forEach((measure) => {
                            const { name } = measure;
                            const { displayName, fn } = fieldInf[name];
                            content.push(getKeyValue(`${displayName}${separator}`,
                                fn(valueArr[fieldsConfig[name].index]), classPrefix));
                        });
                    }
                }
            }
        };
        generateTooltipContent(nestedDataObj, 0, fieldValues);
    }

    return {
        content: fieldValues,
        displayFormat
    };
};

export const strategies = {
    [SELECTION_SUMMARY]: (dm, config, context) => {
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
        const data = aggregatedModel.getData().data;
        measureNames.forEach((measure) => {
            const value = data[0][fieldsConf[measure].index];
            value instanceof InvalidAwareTypes ? values.push([]) : values.push([`(${aggFns[measure].toUpperCase()})`,
                `${retrieveFieldDisplayName(dm, measure)}`,
                {
                    value: `${value.toFixed(2)}`,
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
    [HIGHLIGHT_SUMMARY]: (data, config, context) => buildTooltipData(data, config, context)
};
