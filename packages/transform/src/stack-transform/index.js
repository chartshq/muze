import { stack, InvalidAwareTypes } from 'muze-utils';

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
    });
    const uniqueFieldIndex = schema.findIndex(d => d.name === uniqueField);
    const valueFieldIndex = schema.findIndex(d => d.name === valueField);
    const seriesKeyIndex = schema.findIndex(d => d.name === groupBy);
    const seriesKeys = data.map(d => d[seriesKeyIndex]).filter((item, pos, arr) => arr.indexOf(item) === pos).sort();

    const fieldNames = schema.reduce((acc, obj, i) => {
        acc[i] = obj.name;
        return acc;
    }, {});
    const dataArr = groupedData.map((arr) => {
        const tuples = {};
        const rowObj = arr.values.reduce((acc, row) => {
            acc = row.reduce((obj, value, i) => {
                if (i === seriesKeyIndex) {
                    if (row[valueFieldIndex] instanceof InvalidAwareTypes) {
                        row[valueFieldIndex] = null;
                    }
                    obj[value] = row[valueFieldIndex];
                    tuples[value] = row;
                } else if (i !== valueFieldIndex) {
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
                const newArr = new Array(arr.values[0].length);
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
    const { uniqueField, value: valueField, groupBy } = config;
    const sort = config.sort || 'descending';
    const normalizedData = normalizeData(data, schema, valueField, uniqueField, groupBy);
    const keys = normalizedData.keys;
    const map = {};
    const orderBy = config.orderBy;
    const orderIndex = schema.findIndex(d => d.name === orderBy);
    const groupByIndex = schema.findIndex(d => d.name === groupBy);

    if (orderIndex !== -1) {
        keys.forEach((key) => {
            const name = data.find(d => d[groupByIndex] === key);
            map[key] = name[orderIndex];
        });
        normalizedData.keys.sort((a, b) => map[a].localeCompare(map[b]));
    }

    const stackData = stack({
        keys: normalizedData.keys,
        offset: config.offset || 'diverging',
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

