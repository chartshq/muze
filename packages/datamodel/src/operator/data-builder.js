import { FieldType, DimensionSubtype } from 'muze-utils';
import { rowDiffsetIterator } from './row-diffset-iterator';
import { mergeSort } from './merge-sort';
import { fieldInSchema } from '../helper';
import { isCallable, isArray, } from '../utils';
/**
 * Generates the sorting functions to sort the data of a DataModel instance
 * according to the input data type.
 *
 * @param {string} dataType - The data type e.g. 'measure', 'datetime' etc.
 * @param {string} sortType - The sorting order i.e. 'asc' or 'desc'.
 * @param {integer} index - The index of the data which will be sorted.
 * @return {Function} Returns the the sorting function.
 */
function getSortFn (dataType, sortType, index) {
    let retFunc;
    switch (dataType) {
    case FieldType.MEASURE:
    case DimensionSubtype.TEMPORAL:
        if (sortType === 'desc') {
            retFunc = (a, b) => b[index] - a[index];
        } else {
            retFunc = (a, b) => a[index] - b[index];
        }
        break;
    default:
        retFunc = (a, b) => {
            const a1 = `${a[index]}`;
            const b1 = `${b[index]}`;
            if (a1 < b1) {
                return sortType === 'desc' ? 1 : -1;
            }
            if (a1 > b1) {
                return sortType === 'desc' ? -1 : 1;
            }
            return 0;
        };
    }
    return retFunc;
}

/**
 * Groups the data according to the specified target field.
 *
 * @param {Array} data - The input data array.
 * @param {number} fieldIndex - The target field index within schema array.
 * @return {Array} Returns an array containing the grouped data.
 */
function groupData(data, fieldIndex) {
    const hashMap = new Map();
    const groupedData = [];

    data.forEach((datum) => {
        const fieldVal = datum[fieldIndex];
        if (hashMap.has(fieldVal)) {
            groupedData[hashMap.get(fieldVal)][1].push(datum);
        } else {
            groupedData.push([fieldVal, [datum]]);
            hashMap.set(fieldVal, groupedData.length - 1);
        }
    });

    return groupedData;
}

/**
 * Creates the argument value used for sorting function when sort is done
 * with another fields.
 *
 * @param {Array} groupedDatum - The grouped datum for a single dimension field value.
 * @param {Array} targetFields - An array of the sorting fields.
 * @param {Array} targetFieldDetails - An array of the sorting field details in schema.
 * @return {Object} Returns an object containing the value of sorting fields and the target field name.
 */
function createSortingFnArg(groupedDatum, targetFields, targetFieldDetails) {
    const arg = {
        label: groupedDatum[0]
    };

    targetFields.reduce((acc, next, idx) => {
        acc[next] = groupedDatum[1].map(datum => datum[targetFieldDetails[idx].index]);
        return acc;
    }, arg);

    return arg;
}

/**
 * Sorts the data before return in dataBuilder.
 *
 * @param {Object} dataObj - An object containing the data and schema.
 * @param {Array} sortingDetails - An array containing the sorting configs.
 */
function sortData(dataObj, sortingDetails) {
    const { data, schema } = dataObj;
    let fieldName;
    let sortMeta;
    let fDetails;
    let i = sortingDetails.length - 1;

    for (; i >= 0; i--) {
        fieldName = sortingDetails[i][0];
        sortMeta = sortingDetails[i][1];
        fDetails = fieldInSchema(schema, fieldName);

        if (!fDetails) {
            // eslint-disable-next-line no-continue
            continue;
        }

        if (isCallable(sortMeta)) {
            // eslint-disable-next-line no-loop-func
            mergeSort(data, (a, b) => sortMeta(a[fDetails.index], b[fDetails.index]));
        } else if (isArray(sortMeta)) {
            const groupedData = groupData(data, fDetails.index);
            const sortingFn = sortMeta[sortMeta.length - 1];
            const targetFields = sortMeta.slice(0, sortMeta.length - 1);
            const targetFieldDetails = targetFields.map(f => fieldInSchema(schema, f));

            groupedData.forEach((groupedDatum) => {
                groupedDatum.push(createSortingFnArg(groupedDatum, targetFields, targetFieldDetails));
            });

            mergeSort(groupedData, (a, b) => {
                const m = a[2];
                const n = b[2];
                return sortingFn(m, n);
            });

            // Empty the array
            data.length = 0;
            groupedData.forEach((datum) => {
                data.push(...datum[1]);
            });
        } else {
            sortMeta = String(sortMeta).toLowerCase() === 'desc' ? 'desc' : 'asc';
            mergeSort(data, getSortFn(fDetails.type, sortMeta, fDetails.index));
        }
    }

    dataObj.uids = [];
    data.forEach((value) => {
        dataObj.uids.push(value.pop());
    });
}


/**
 * Builds the actual data array.
 *
 * @param {Array} fieldStore - An array of field.
 * @param {string} rowDiffset - A string consisting of which rows to be included eg. '0-2,4,6';
 * @param {string} colIdentifier - A string consisting of the details of which column
 * to be included eg 'date,sales,profit';
 * @param {Object} sortingDetails - An object containing the sorting details of the DataModel instance.
 * @param {Object} options - The options required to create the type of the data.
 * @return {Object} Returns an object containing the multidimensional array and the relative schema.
 */
export function dataBuilder (fieldStore, rowDiffset, colIdentifier, sortingDetails, options) {
    const defOptions = {
        addUid: false,
        columnWise: false
    };
    options = Object.assign({}, defOptions, options);

    const retObj = {
        schema: [],
        data: [],
        uids: []
    };
    const addUid = options.addUid;
    const reqSorting = sortingDetails && sortingDetails.length > 0;
    // It stores the fields according to the colIdentifier argument
    const tmpDataArr = [];
    // Stores the fields according to the colIdentifier argument
    const colIArr = colIdentifier.split(',');

    colIArr.forEach((colName) => {
        for (let i = 0; i < fieldStore.length; i += 1) {
            if (fieldStore[i].name === colName) {
                tmpDataArr.push(fieldStore[i]);
                break;
            }
        }
    });

    // Inserts the schema to the schema object
    tmpDataArr.forEach((field) => {
        /** @todo Need to use extend2 here otherwise user can overwrite the schema. */
        retObj.schema.push(field.schema);
    });

    if (addUid) {
        retObj.schema.push({
            name: 'uid',
            type: 'identifier'
        });
    }

    rowDiffsetIterator(rowDiffset, (i) => {
        retObj.data.push([]);
        const insertInd = retObj.data.length - 1;
        let start = 0;
        tmpDataArr.forEach((field, ii) => {
            retObj.data[insertInd][ii + start] = field.data[i];
        });
        if (addUid) {
            retObj.data[insertInd][tmpDataArr.length] = i;
        }
        // Creates an array of unique identifiers for each row
        retObj.uids.push(i);

        // If sorting needed then there is the need to expose the index
        // mapping from the old index to its new index
        if (reqSorting) { retObj.data[insertInd].push(i); }
    });

    // Handles the sort functionality
    if (reqSorting) {
        sortData(retObj, sortingDetails);
    }

    if (options.columnWise) {
        const tmpData = Array(...Array(retObj.schema.length)).map(() => []);
        retObj.data.forEach((tuple) => {
            tuple.forEach((data, i) => {
                tmpData[i].push(data);
            });
        });
        retObj.data = tmpData;
    }

    return retObj;
}
