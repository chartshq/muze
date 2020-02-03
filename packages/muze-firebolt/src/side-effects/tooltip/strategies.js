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
    intersect,
    ReservedFields
} from 'muze-utils';
import { TABLE_FORMAT } from '@chartshq/muze-tooltip';
import { SELECTION_SUMMARY, HIGHLIGHT_SUMMARY } from '../../enums/tooltip-strategies';
import { BAR } from '../../../../visual-group/src/enums/constants';
import { NULL, UNDEFINED } from '../../enums/constants';

const { SUM, COUNT } = GROUP_BY_FUNCTIONS;
const { InvalidAwareTypes } = DataModel;
const FIRST_VALUE_MARGIN = '10px';
const STACK = 'stack';
const SINGLE_DATA_MARGIN = 10;
const defNumberFormat = value => `${value % value.toFixed(0) === 0 ? value : value.toFixed(2)}`;

const formatters = (formatter, interval, valueParser) => ({
    [DimensionSubtype.TEMPORAL]: value => (value instanceof InvalidAwareTypes ? valueParser(value) :
        formatTemporal(Number(value), interval)),
    [MeasureSubtype.CONTINUOUS]: value => (value instanceof InvalidAwareTypes ? valueParser(value) :
        formatter(defNumberFormat(value))),
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

const isSingleValue = (dataLen, stackedSum) => dataLen === 1 && !stackedSum;

const getStackedKeyValue = (params) => {
    const { field, value, classPrefix } = params;
    return ({
        className: `${classPrefix}-tooltip-stacked-row`,
        data: [{
            value: field,
            className: `${classPrefix}-tooltip-stacked-row-key`
        }, {
            value: `${value}`,
            className: `${classPrefix}-tooltip-stacked-row-value`
        }]
    });
};

const getKeyValue = (params) => {
    const { field, value, classPrefix, margin, isSelected, removeKey, stackedSum, isStackedBar } = params;
    let { stackedValue } = params;

    if (!removeKey) {
        const keyObj = {
            value: field,
            className: `${classPrefix}-tooltip-key`
        };
        const valueObj = {
            value,
            className: `${classPrefix}-tooltip-value`
        };

        if (stackedValue === NULL || stackedValue === UNDEFINED) {
            stackedValue = 0;
        }

        const stackedValueObj = {
            value: stackedSum ? `(${(stackedValue * 100 / stackedSum).toFixed(2)} %)` : undefined,
            className: `${classPrefix}-tooltip-stacked-percentage`
        };

        if (margin !== undefined) {
            keyObj.style = {
                'margin-left': `${margin}px`
            };
            valueObj.style = {
                'margin-left': `${margin}px`
            };
            stackedValueObj.style = {
                'margin-left': `${margin}px`
            };
        }

        return ({
            className: isSelected ? `${classPrefix}-tooltip-row ${classPrefix}-tooltip-selected-row`
                : `${classPrefix}-tooltip-row`,
            data: stackedSum && isStackedBar ? [keyObj, stackedValueObj, valueObj] : [keyObj, valueObj]
        });
    }
    return ({
        data: [{
            className: '',
            value,
            style: {
                'margin-left': FIRST_VALUE_MARGIN
            }
        }],
        className: `${classPrefix}-tooltip-first`
    });
};

export const getStackedSum = (values, index) => values.reduce((a, b) => {
    if (b[index] instanceof InvalidAwareTypes) {
        return a + 0;
    }
    return a + b[index];
}, 0);

export const isStackedChart = layers => layers.some(d => d.transformType() === STACK);
export const isStackedBarChart = layers => layers.some(d => d.transformType() === STACK && d.config().mark === BAR);

const generateRetinalFieldsValues = (valueArr, retinalFields, content, context) => {
    const {
        fieldsConfig,
        dimensionMeasureMap,
        axes,
        config,
        fieldInf,
        dataLen,
        target,
        stackedSum,
        isStackedBar
    } = context;
    const { classPrefix, margin, separator } = config;
    const colorAxis = axes.color[0];
    const shapeAxis = axes.shape[0];
    const sizeAxis = axes.size[0];
    const REF_VALUES_INDEX = 1;
    const REF_KEYS_INDEX = 0;

    for (const retField in retinalFields) {
        const retIndex = fieldsConfig[retField].index;
        const retinalFieldValue = valueArr[retIndex];
        const measuresArr = dimensionMeasureMap[retField];
        const icon = {
            type: 'icon',
            color: colorAxis.getColor(retinalFieldValue),
            size: sizeAxis.config().value,
            shape: shapeAxis.getShape(retinalFieldValue)
        };
        const { displayName, fn } = fieldInf[retField];
        const formattedRetinalValue = fn(retinalFieldValue);

        if (isSingleValue(dataLen, stackedSum)) {
            content.push(getKeyValue({
                field: displayName,
                value: formattedRetinalValue,
                classPrefix,
                margin: SINGLE_DATA_MARGIN
            }));
        } else {
            const hasMultipleMeasures = measuresArr.length > 1;
            hasMultipleMeasures && (content.push({ data: [icon, formattedRetinalValue] }));
            const selectedContext = target && target[REF_VALUES_INDEX][target[REF_KEYS_INDEX].indexOf(retField)];
            const isSelected = selectedContext === retinalFieldValue;

            measuresArr.forEach((measure) => {
                const measureIndex = fieldsConfig[measure].index;
                const { displayName: dName, fn: formatterFn } = fieldInf[measure];
                const currentMeasureValue = valueArr[measureIndex];
                const value = formatterFn(currentMeasureValue);
                const keyValue = getKeyValue({
                    field: hasMultipleMeasures ? `${dName}${separator}` : formattedRetinalValue,
                    value,
                    classPrefix,
                    margin: hasMultipleMeasures ? margin : undefined,
                    isSelected,
                    stackedSum,
                    stackedValue: currentMeasureValue instanceof InvalidAwareTypes
                    ? currentMeasureValue.value()
                    : currentMeasureValue.toFixed(2),
                    isStackedBar
                });

                if (!hasMultipleMeasures) {
                    keyValue.data = [icon, ...keyValue.data];
                }
                content.push(keyValue);
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
    const { color, shape, size } = context.retinalFields;
    const detailFields = context.detailFields || [];
    const { showStackSum = true } = context.config || {};
    const { selectedMeasures = [] } = context.payload;
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
        const isStacked = isStackedChart(context.layers);
        const isStackedBar = isStackedBarChart(context.layers);
        const filteredMeasures = !isSingleValue(dataLen, isStacked)
            ? measures.filter(d => allMeasures.indexOf(d.name) === -1)
            : measures;

        nestedDataObj = nestCollection({
            data,
            keys: indices
        });

        nestedDataObj = !('key' in nestedDataObj[0]) ? [{
            values: nestedDataObj
        }] : nestedDataObj;

        const generateTooltipContent = (nestedData, index = 0, content = []) => {
            const { classPrefix, separator } = config;
            for (let i = 0, len = nestedData.length; i < len; i++) {
                const { values, key } = nestedData[i];
                const field = getObjProp(schema, indices[index], 'name');
                const margin = dataLen === 1 || Object.keys(retinalFields).length === 0
                ? SINGLE_DATA_MARGIN : undefined;
                if (field) {
                    const { displayName, fn } = fieldInf[field];
                    const formattedValue = fn(key);
                    const removeKey = !isSingleValue(dataLen, isStacked);
                    content.push(getKeyValue({
                        field: `${displayName}${separator}`,
                        value: formattedValue,
                        classPrefix,
                        margin,
                        isSelected: undefined,
                        removeKey
                    }));
                }

                if (values[0] && values[0].key) {
                    generateTooltipContent(values, index + 1, content);
                } else {
                    let stackedSum = 0;
                    if (isStacked && showStackSum) {
                        stackedSum = getStackedSum(
                            values,
                            fieldsConfig[measures[0].name].index
                        );
                        const nf = measures[0].numberFormat;
                        content.push(getStackedKeyValue({
                            field: `${'Total'}${separator}`,
                            value: nf ? nf(stackedSum.toFixed(2)) : stackedSum.toFixed(2),
                            classPrefix
                        }));
                    }
                    for (let j = 0, len2 = values.length; j < len2; j++) {
                        const valueArr = values[j];
                        generateRetinalFieldsValues(valueArr, retinalFields, content, {
                            fieldInf,
                            axes,
                            config,
                            fieldsConfig,
                            dimensionMeasureMap,
                            dataLen,
                            target: context.payload.target,
                            stackedSum,
                            isStackedBar
                        });
                        filteredMeasures.forEach((measure) => {
                            const { name } = measure;
                            const { displayName, fn } = fieldInf[name];
                            content.push(getKeyValue({
                                field: `${displayName}${separator}`,
                                isSelected: selectedMeasures.indexOf(name) !== -1,
                                value: fn(valueArr[fieldsConfig[name].index]),
                                classPrefix,
                                margin: SINGLE_DATA_MARGIN
                            }));
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

/**
 * Calculate aggregated values of measures from entry set and datamodel.
 *
 * @param {DataModel} dm DataModel instance
 * @param {EntrySet} entrySet Entry set
 */
const getAggregatedValues = (dm, entrySet) => {
    // const fields = entrySet.fields;
    const aggFns = entrySet.aggFns;
    // Create a map of all the dimensions and the measures
    const dimsMap = entrySet.uids.reduce((acc, v) => {
        const dims = v[0];

        !acc[dims] && (acc[dims] = []);
        acc[dims].push(v[1]);
        return acc;
    }, {});
    const aggMeasures = Object.keys(dm.getFieldspace().getMeasure());
    const aggregatedValues = {};
    aggMeasures.forEach((measure) => {
        // Filter all the rows which has this measure and dimensions and apply aggregation.
        const groupedDm = dm.select((dmFields) => {
            const id = dmFields[ReservedFields.ROW_ID];
            const measures = dimsMap[id];
            if (measures) {
                return measures.find(arr => arr.indexOf(measure) !== -1);
            }
            return false;
        }, {
            saveChild: false
        }).groupBy([''], {
            [measure]: aggFns[measure] === COUNT ? SUM : aggFns[measure]
        }, {
            saveChild: false
        });
        const fieldsConfig = groupedDm.getFieldsConfig();
        if (!groupedDm.isEmpty()) {
            aggregatedValues[measure] = groupedDm.getData().data[0][fieldsConfig[measure].index];
        }
    });
    return aggregatedValues;
};

export const strategies = {
    [SELECTION_SUMMARY]: (dm, config, context) => {
        const { selectionSet } = context;
        const { classPrefix } = config;
        const tooltipConf = context.config;
        const { showMultipleMeasures } = tooltipConf;
        const aggFns = selectionSet.mergedEnter.aggFns;
        const entryUids = selectionSet.mergedEnter.uids;
        const fieldsConf = dm.getFieldsConfig();
        const aggregatedValues = getAggregatedValues(dm, selectionSet.mergedEnter);
        const values = [{
            className: `${classPrefix}-tooltip-row`,
            data: [{
                value: `${entryUids.length}`,
                style: {
                    'font-weight': 'bold'
                }
            }, 'Items Selected']
        }];
        let measures = Object.keys(aggregatedValues);
        if (!showMultipleMeasures) {
            measures = measures.slice(0, 1);
        }
        // Prepare the tooltip content
        measures.forEach((measure) => {
            const { numberFormat = defNumberFormat } = fieldsConf[measure].def;
            const value = aggregatedValues[measure];
            const rowValues = value instanceof InvalidAwareTypes ? [] : [`(${aggFns[measure].toUpperCase()})`,
                `${retrieveFieldDisplayName(dm, measure)}:`,
                {
                    value: numberFormat(value),
                    style: {
                        'font-weight': 'bold'
                    },
                    className: `${classPrefix}-tooltip-value`
                }];
            if (showMultipleMeasures) {
                values.push({
                    className: `${classPrefix}-tooltip-row`,
                    data: rowValues
                });
            } else {
                values[0].data.push(...rowValues);
            }
        });

        return values;
    },
    [HIGHLIGHT_SUMMARY]: (data, config, context) => buildTooltipData(data, config, context)
};
