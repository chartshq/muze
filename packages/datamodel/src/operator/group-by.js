import { extend2 } from '../utils';
import { rowDiffsetIterator } from './row-diffset-iterator';
import DataModel from '../index';
import reducerStore from '../utils/reducer-store';

/**
 * This function sanitize the user given field and return a common Array structure field
 * list
 * @param  {DataModel} dataModel the dataModel operating on
 * @param  {Array} fieldArr  user input of field Array
 * @return {Array}           arrays of field name
 */
function getFieldArr (dataModel, fieldArr) {
    const retArr = [];
    const fieldStore = dataModel.getPartialFieldspace();
    const dimensions = fieldStore.getDimension();
    const measures = fieldStore.getMeasure();

    Object.entries(dimensions).forEach(([key]) => {
        if (fieldArr && fieldArr.length) {
            if (fieldArr.indexOf(key) !== -1) {
                retArr.push(key);
            }
        } else {
            retArr.push(key);
        }
    });

    Object.entries(measures).forEach(([key]) => {
        if (measures[key].subType() === 'discrete') {
            if (fieldArr && fieldArr.length) {
                if (fieldArr.indexOf(key) !== -1) {
                    retArr.push(key);
                }
            } else {
                retArr.push(key);
            }
        }
    });
    return retArr;
}

/**
 * This sanitize the reducer provide by the user and create a common type of object.
 * user can give function Also
 * @param  {DataModel} dataModel     dataModel to worked on
 * @param  {Object|function} [reducers={}] reducer provided by the users
 * @return {Object}               object containing reducer function for every measure
 */
function getReducerObj (dataModel, reducers = {}) {
    const retObj = {};
    const pReducers = reducers;
    const fieldStore = dataModel.getPartialFieldspace();
    const measures = fieldStore.getMeasure();
    let reducer = reducerStore.defaultReducer();
    if (typeof reducers === 'function') {
        reducer = reducers;
    }
    Object.entries(measures).forEach(([key]) => {
        if (typeof reducers[key] === 'string') {
            pReducers[key] = reducerStore.resolve(pReducers[key]) ? reducerStore.resolve(pReducers[key]) : reducer;
        }
        if (typeof reducers[key] !== 'function') {
            pReducers[key] = undefined;
        }
        retObj[key] = pReducers[key] || reducerStore.resolve(measures[key].defAggFn()) || reducer;
    });
    return retObj;
}

/**
 * main function which perform the group-by operations which reduce the measures value is the
 * fields are common according to the reducer function provided
 * @param  {DataModel} dataModel the dataModel to worked
 * @param  {Array} fieldArr  fields according to which the groupby should be worked
 * @param  {Object|Function} reducers  reducers function
 * @param {DataModel} existingDataModel Existing datamodel instance
 * @return {DataModel} new dataModel with the group by
 */
function groupBy (dataModel, fieldArr, reducers, existingDataModel) {
    const sFieldArr = getFieldArr(dataModel, fieldArr);
    const reducerObj = getReducerObj(dataModel, reducers);
    const fieldStore = dataModel.getPartialFieldspace();
    const fieldStoreObj = fieldStore.fieldsObj();
    const dbName = fieldStore.name;
    const dimensionArr = [];
    const measureArr = [];
    const schema = [];
    const hashMap = {};
    const data = [];
    let newDataModel;
    // Prepare the schema
    Object.entries(fieldStoreObj).forEach(([key, value]) => {
        if (sFieldArr.indexOf(key) !== -1 || reducerObj[key]) {
            schema.push(extend2({}, value.schema));
            if (value.schema.type === 'measure' && value.schema.subtype !== 'discrete') {
                measureArr.push(key);
            } else if (value.schema.type === 'dimension' || value.schema.subtype === 'discrete') {
                dimensionArr.push(key);
            }
        }
    });
    // Prepare the data
    let rowCount = 0;
    rowDiffsetIterator(dataModel._rowDiffset, (i) => {
        let hash = '';
        dimensionArr.forEach((_) => {
            hash = `${hash}-${fieldStoreObj[_].data[i]}`;
        });
        if (hashMap[hash] === undefined) {
            hashMap[hash] = rowCount;
            data.push({});
            dimensionArr.forEach((_) => {
                data[rowCount][_] = fieldStoreObj[_].data[i];
            });
            measureArr.forEach((_) => {
                data[rowCount][_] = [fieldStoreObj[_].data[i]];
            });
            rowCount += 1;
        } else {
            measureArr.forEach((_) => {
                data[hashMap[hash]][_].push(fieldStoreObj[_].data[i]);
            });
        }
    });
    // reduction
    data.forEach((row) => {
        const tuple = row;
        measureArr.forEach((_) => {
            tuple[_] = reducerObj[_](row[_]);
        });
    });
    if (existingDataModel) {
        existingDataModel.__calculateFieldspace();
        newDataModel = existingDataModel;
    }
    else {
        newDataModel = new DataModel(data, schema, dbName);
    }
    return newDataModel;
}

export { groupBy, getFieldArr, getReducerObj };
