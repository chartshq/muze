/* eslint-disable default-case */

import { FieldType } from 'muze-utils';
import {
    persistDerivation,
    getRootGroupByModel,
    propagateToAllDataModels,
    getRootDataModel,
    propagateImmutableActions
} from './helper';
import { DM_DERIVATIVES, PROPAGATION } from './constants';
import {
    dataBuilder,
    rowDiffsetIterator,
    groupBy
} from './operator';
import { createBinnedFieldData } from './operator/bucket-creator';
import Relation from './relation';
import reducerStore from './utils/reducer-store';
import createFields from './field-creator';

/**
 * A model which has been built on the concept of relational algebra.
 *
 * @extends Relation
 */
class DataModel extends Relation {

    /**
     * Creates a new DataModel instance.
     *
     * @param {Array} args - The arguments which is passed directly to the parent class.
     */
    constructor (...args) {
        super(...args);

        this._onPropagation = [];
        this._sortingDetails = [];
    }

    static get Reducers () {
        return reducerStore;
    }

    /**
     * Returns the data after operation in the format of
     * multidimensional array according to the given option value.
     *
     * @public
     * @param {Object} [options] - Define how the data need to be returned.
     * @param {Object} [options.order='row'] - Define the order of the data: row or column.
     * @param {Object} [options.formatter=null] - An object map containing field specific formatter function.
     * @param {Object} [options.withUid=false] - Whether the data uids will be included or not.
     * @param {Object} [options.sort=[]] - The sorting details to sort the data.
     * @return {Array} Returns a multidimensional array of the data.
     * @example
     *
     * // Return data with formatted date value.
     * const options = {
     *  order: 'row',
     *  formatter: {
     *      birthday: (val, rowId, schema) => {
     *          return yourCustomFormatter(val, "%Y-%m-%d");
     *      }
     *  }
     * }
     *
     *  const dm = new DataModel(data, schema);
     *  const dataFormatted = dm.getData(options);
     */
    getData (options) {
        const defOptions = {
            order: 'row',
            formatter: null,
            withUid: false,
            getAllFields: false,
            sort: []
        };
        options = Object.assign({}, defOptions, options);
        const fields = this.getPartialFieldspace().fields;

        const dataGenerated = dataBuilder.call(
            this,
            this.getPartialFieldspace().fields,
            this._rowDiffset,
            options.getAllFields ? fields.map(d => d.name).join() : this._colIdentifier,
            options.sort,
            {
                columnWise: options.order === 'column',
                addUid: !!options.withUid
            }
        );

        if (!options.formatter) {
            return dataGenerated;
        }

        const { formatter } = options;
        const { data, schema, uids } = dataGenerated;
        const fieldNames = schema.map((e => e.name));
        const fmtFieldNames = Object.keys(formatter);
        const fmtFieldIdx = fmtFieldNames.reduce((acc, next) => {
            const idx = fieldNames.indexOf(next);
            if (idx !== -1) {
                acc.push([idx, formatter[next]]);
            }
            return acc;
        }, []);

        if (options.order === 'column') {
            fmtFieldIdx.forEach((elem) => {
                const fIdx = elem[0];
                const fmtFn = elem[1];

                data[fIdx].forEach((datum, datumIdx) => {
                    data[fIdx][datumIdx] = fmtFn.call(
                        undefined,
                        datum,
                        uids[datumIdx],
                        schema[fIdx]
                    );
                });
            });
        } else {
            data.forEach((datum, datumIdx) => {
                fmtFieldIdx.forEach((elem) => {
                    const fIdx = elem[0];
                    const fmtFn = elem[1];

                    datum[fIdx] = fmtFn.call(
                        undefined,
                        datum[fIdx],
                        uids[datumIdx],
                        schema[fIdx]
                    );
                });
            });
        }

        return dataGenerated;
    }

    /**
     * Performs group-by operation on the current DataModel instance according to
     * the fields and reducers provided.
     * The fields can be skipped in that case all field will be taken into consideration.
     * The reducer can also be given, If nothing is provided sum will be the default reducer.
     *
     * @public
     * @param {Array} fieldsArr - An array containing the name of the columns.
     * @param {Object | Function | string} [reducers={}] - The reducer function.
     * @param {string} [saveChild=true] - Whether the child to save  or not.
     * @param {DataModel} [existingDataModel] - An optional existing DataModel instance.
     * @return {DataModel} Returns the new DataModel instance after operation.
     */
    groupBy (fieldsArr, reducers = {}, config = { saveChild: true }) {
        const groupByString = `${fieldsArr.join()}`;
        let params = [this, fieldsArr, reducers];
        const newDataModel = groupBy(...params);

        if (config.saveChild) {
            this._children.push(newDataModel);
            persistDerivation(
                newDataModel,
                DM_DERIVATIVES.GROUPBY,
                { fieldsArr, groupByString, defaultReducer: reducerStore.defaultReducer() },
                reducers
            );
        }

        newDataModel._parent = this;
        return newDataModel;
    }

    /**
     * It helps to define the sorting order of the returned data.
     * This is similar to the orderBy functionality of the database
     * you have to pass the array of array [['columnName', 'sortType(asc|desc)']] and the
     * function getData will give the data accordingly.
     *
     * @public
     * @param {Array} sortingDetails - An array containing the sorting details with column names;
     * @return {DataModel} Returns a new sorted instance of DataModel.
     */
    sort (sortingDetails) {
        const rawData = this.getData({
            order: 'row',
            sort: sortingDetails
        });
        const header = rawData.schema.map(field => field.name);
        const dataInCSVArr = [header].concat(rawData.data);

        const sortedDm = new this.constructor(dataInCSVArr, rawData.schema, null, { dataFormat: 'DSVArr' });
        sortedDm._sortingDetails = sortingDetails;
        return sortedDm;
    }

    addField (field) {
        const fieldName = field.fieldName();
        this._colIdentifier += `,${fieldName}`;
        const partialFieldspace = this._partialFieldspace;

        if (!partialFieldspace.fieldsObj()[field.fieldName()]) {
            partialFieldspace.fields.push(field);
        } else {
            const fieldIndex = partialFieldspace.fields.findIndex(fieldinst => fieldinst.name === fieldName);
            fieldIndex >= 0 && (partialFieldspace.fields[fieldIndex] = field);
        }

        this.__calculateFieldspace().calculateFieldsConfig();
        return this;
    }

    /**
     *
     * @param {Object} varConfig :{
     *  name: 'new-var',
     *  type: 'measure | dimension',
     *  subype: 'temporal | ...',
     *  all the variable what schema gets
     *  }}
     *  @param {Array} paramConfig : ['dep-var-1', 'dep-var-2', 'dep-var-3', ([var1, var2, var3], rowIndex, dm) => {}]
     * @param {Object} config : { saveChild : true | false , removeDependentDimensions : true|false}
     */
    calculateVariable (schema, dependency, config = { saveChild: true, replaceVar: false }) {
        const fieldsConfig = this.getFieldsConfig();
        const depVars = dependency.slice(0, dependency.length - 1);
        const retrieveFn = dependency[dependency.length - 1];

        if (fieldsConfig[schema.name] && !config.replaceVar) {
            throw new Error(`${schema.name} field already exists in model.`);
        }
        const depFieldIndices = depVars.map((field) => {
            const fieldSpec = fieldsConfig[field];
            if (!fieldSpec) {
                // @todo dont throw error here, use warning in production mode
                throw new Error(`${field} is not a valid column name.`);
            }
            return fieldSpec.index;
        });

        let clone = this.clone();

        const fs = clone.getFieldspace().fields;
        const suppliedFields = depFieldIndices.map(idx => fs[idx]);

        const computedValues = [];
        rowDiffsetIterator(clone._rowDiffset, (i) => {
            const fieldsData = suppliedFields.map(field => field.data[i]);
            computedValues[i] = retrieveFn(...fieldsData, i, fs);
        });
        const [field] = createFields([computedValues], [schema], [schema.name]);
        clone.addField(field);

        if (config.saveChild) {
            persistDerivation(clone, DM_DERIVATIVES.CAL_VAR, { config: schema, fields: depVars }, retrieveFn);
        }

        return clone;
    }

    /**
     * Propagates changes across all the connected DataModel instances.
     *
     * @public
     * @param {Array} identifiers - A list of identifiers that were interacted with.
     * @param {Object} payload - The interaction specific details.
     *
     * @return {DataModel} DataModel instance.
     */
    propagate (identifiers, payload, config = {}) {
        const isMutableAction = config.isMutableAction;
        const propagationSourceId = config.sourceId;
        const rootModel = getRootDataModel(this);
        const propagationNameSpace = rootModel._propagationNameSpace;
        const rootGroupByModel = getRootGroupByModel(this);
        const rootModels = {
            groupByModel: rootGroupByModel,
            model: rootModel
        };

        propagateToAllDataModels(identifiers, rootModels, {
            propagationNameSpace,
            payload,
            propagationSourceId
        });


        if (isMutableAction) {
            propagateImmutableActions(propagationNameSpace, rootModels, propagationSourceId);
        }
        return this;
    }

    addToPropNamespace (sourceId, payload, criteria, isMutableAction) {
        let sourceNamespace;
        const action = payload.action;
        const rootModel = getRootDataModel(this);
        const propagationNameSpace = rootModel._propagationNameSpace;

        if (isMutableAction) {
            !propagationNameSpace.mutableActions[sourceId] && (propagationNameSpace.mutableActions[sourceId] = {});
            sourceNamespace = propagationNameSpace.mutableActions[sourceId];
        } else {
            !propagationNameSpace.immutableActions[sourceId] && (propagationNameSpace.immutableActions[sourceId] = {});
            sourceNamespace = propagationNameSpace.immutableActions[sourceId];
        }

        if (criteria === null) {
            delete sourceNamespace[action];
        } else {
            sourceNamespace[action] = {
                criteria,
                payload
            };
        }

        return this;
    }

    /**
     * Associates a callback with an event name.
     *
     * @public
     * @param {string} eventName - The name of the event.
     * @param {Function} callback - The callback to invoke.
     * @return {DataModel} Returns this current DataModel instance itself.
     */
    on (eventName, callback) {
        switch (eventName) {
        case PROPAGATION:
            this._onPropagation.push(callback);
            break;
        }
        return this;
    }

    /**
     * Unsubscribes the callbacks for the provided event name.
     *
     * @public
     * @param {string} eventName - The name of the event to unsubscribe.
     * @return {DataModel} Returns the current DataModel instance itself.
     */
    unsubscribe (eventName) {
        switch (eventName) {
        case PROPAGATION:
            this._onPropagation = [];
            break;

        }
        return this;
    }

    /**
     * This method is used to invoke the method associated with
     * propagation.
     *
     * @todo Fix whether this method would be public or not.
     *
     * @private
     * @param {Object} payload The interaction payload.
     * @param {DataModel} identifiers The propagated DataModel.
     * @memberof DataModel
     */
    handlePropagation (payload) {
        let propListeners = this._onPropagation;
        propListeners.forEach(fn => fn.call(this, payload));
    }

    /**
     @param {String} measureName : name of measure which will be used to create bin
     @param {Object} config : bucketObj : {} || binSize : number || noOfBins : number || binFieldName : string
     @param {Function | FunctionName} reducer : binning reducer
     */
    bin (measureName, config = { }) {
        const clone = this.clone();
        const binFieldName = config.name || `${measureName}_binned`;
        if (this.getFieldsConfig()[binFieldName] || !this.getFieldsConfig()[measureName]) {
            throw new Error(`Field ${measureName} already exists.`);
        }
        const field = this._partialFieldspace.fields.find(currfield => currfield.name === measureName);
        const dataSet = createBinnedFieldData(field, this._rowDiffset, config);
        const binField = createFields([dataSet.data], [
            {
                name: binFieldName,
                type: FieldType.MEASURE,
                subtype: 'discrete', // @todo : DimensionSubtype
                bins: {
                    range: dataSet.range,
                    mid: dataSet.mid
                }
            }], [binFieldName])[0];
        clone.addField(binField);
        persistDerivation(clone, DM_DERIVATIVES.BIN, { measureName, config, binFieldName }, null);
        return clone;
    }
}

export default DataModel;
