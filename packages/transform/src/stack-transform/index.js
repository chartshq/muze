import { stack } from '../utils';

import group from '../group-transform';
/*
    Normalize the data to a form which can be given to d3 stack for stacking the data
    ['Product', 'Sales', 'Region'],
    0 ['A', 2000, 'North'],
    1 ['A', 3000, 'South'],
    2 ['B', 3000, 'South'],
    3 ['B', 2000, 'North'],
    4 ['C', 3000, 'South'],
    5 ['C', 2000, 'North']
            |
            |
    ['Product', 'North', 'South'],
    ['A', 2000, 3000],
    ['B', 2000, 3000],
    ['C', 2000, 3000]
*/
// eslint-disable-next-line require-jsdoc
const normalizeData = (data, schema, valueField, uniqueField, groupBy) => {
    const groupedData = group(schema, data, {
            groupBy: uniqueField
        }),
        uniqueFieldIndex = schema.findIndex(d => d.name === uniqueField),
        valueFieldIndex = schema.findIndex(d => d.name === valueField),
        seriesKeyIndex = schema.findIndex(d => d.name === groupBy),
        seriesKeys = data.map(d => d[seriesKeyIndex]).filter((item, pos, arr) =>
            arr.indexOf(item) === pos),
        fieldNames = schema.reduce((acc, obj, i) => {
            acc[i] = obj.name;
            return acc;
        }, {}),
        dataArr = groupedData.map((arr) => {
            let tuples = {},
                rowObj = arr.values.reduce((acc, row) => {
                    acc = row.reduce((obj, value, i) => {
                        if (i === seriesKeyIndex) {
                            obj[value] = row[valueFieldIndex];
                            tuples[value] = row;
                        }
                        else if (i !== valueFieldIndex) {
                            obj[fieldNames[i]] = value;
                        }
                        return obj;
                    }, acc);
                    return acc;
                }, {});
            rowObj._tuple = tuples;
            // Set missing values field to zero value
            seriesKeys.forEach((seriesKey) => {
                if (rowObj[seriesKey] === undefined) {
                    rowObj[seriesKey] = 0;
                    let newArr = new Array(arr.values[0].length);
                    newArr[uniqueFieldIndex] = arr.key;
                    newArr[seriesKeyIndex] = seriesKey;
                    rowObj._tuple[seriesKey] = newArr;
                }
            });
            return rowObj;
        });

    return {
        data: dataArr,
        keys: seriesKeys
    };
};
/**
 * Generate a stacked representation of data
 * @param {Array} schema schema Array
 * @param {Array} data data array
 * @param {Object} config Configuration object
 * @return {Array} stacked data
 */
export default (schema, data, config) => {
    const uniqueField = config.uniqueField,
        valueField = config.value,
        groupBy = config.groupBy,
        sort = config.sort || 'none',
        normalizedData = normalizeData(data, schema, valueField, uniqueField, groupBy),
        stackData = stack({
            keys: normalizedData.keys,
            offset: 'diverging',
            order: sort,
            data: normalizedData.data
        });
    stackData.forEach((seriesData) => {
        seriesData.forEach((dataObj) => {
            dataObj.data = dataObj.data._tuple[seriesData.key];
        });
    });
    return stackData;
};

