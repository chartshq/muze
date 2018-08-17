import { FilteringMode, getUniqueId } from 'muze-utils';
import { persistDerivation, updateFields, cloneWithSelect, cloneWithProject, updateData } from './helper';
import { crossProduct, difference, naturalJoinFilter, union } from './operator';
import { DM_DERIVATIVES } from './constants';

/**
 * Provides the relation algebra logics.
 */
class Relation {

    /**
     * If passed any data this will create a field array and will create
     * a field store with these fields in global space which can be used
     * by other functions for calculations and other operations on data
     *
     * @param {Object | string | Relation} data - The input tabular data in dsv or json format or
     * an existing Relation instance object.
     * @param {Array} schema - An array of data schema.
     * @param {Object} [options] - The optional options.
     */
    constructor (...params) {
        let source;

        this._parent = null;
        this._derivation = [];
        this._children = [];


        if (params.length === 1 && ((source = params[0]) instanceof Relation)) {
            // parent datamodel was passed as part of source
            this._colIdentifier = source._colIdentifier;
            this._rowDiffset = source._rowDiffset;
            this._parent = source;
            this._partialFieldspace = this._parent._partialFieldspace;
            this._fieldStoreName = getUniqueId();
            this.__calculateFieldspace().calculateFieldsConfig();
        } else {
            updateData(this, ...params);
            this._fieldStoreName = this._partialFieldspace.name;
            this.__calculateFieldspace().calculateFieldsConfig();
            this._propagationNameSpace = {
                mutableActions: {},
                immutableActions: {}
            };
        }
    }

    /**
     * Returns the schema details for all fields.
     *
     * @public
     * @return {Array} Returns an array of field schema.
     */
    getSchema () {
        return this.getFieldspace().fields.map(d => d.schema);
    }

    getName () {
        return this._fieldStoreName;
    }

    getFieldspace () {
        return this._fieldspace;
    }

    __calculateFieldspace () {
        this._fieldspace = updateFields([this._rowDiffset, this._colIdentifier],
             this.getPartialFieldspace(), this._fieldStoreName);
        return this;
    }

    getPartialFieldspace () {
        return this._partialFieldspace;
    }

    /**
     * this reflect the cross-product of the relational algebra or can be called as theta join.
     * It take another DataModel instance and create new DataModel with the cross-product data and
     * filter the data according to the filter function provided.
     * Say there are two dataModel modelA with 4 column 5 rows and modelB with 3 column 6 row
     * so the new DataModel modelA X modelB will have 7(4 + 3) rows and 30(5 * 6) columns (if no
     * filter function is provided).
     *
     * @todo Make this API user-friendly.
     *
     * @public
     * @param  {DataModel} joinWith The DataModel to be joined with this DataModel
     * @param  {Function} filterFn Function that will filter the result of the crossProduct
     * DataModel
     * @return {DataModel}          the new DataModel created by joining
     */
    join (joinWith, filterFn) {
        return crossProduct(this, joinWith, filterFn);
    }

    /**
     * This can join two DataModel to form a new DataModel which meet the requirement of
     * natural join.
     * it's not possible to pass a filter function as the filter function is decided according to
     * the definition of natural join
     *
     * @todo Make this API user-friendly.
     *
     * @public
     * @param  {DataModel} joinWith the DataModel with whom this DataModel will be joined
     * @return {DataModel}          The new joined DataModel
     */
    naturalJoin (joinWith) {
        return crossProduct(this, joinWith, naturalJoinFilter(this, joinWith), true);
    }

    /**
     * Performs union operation of the relational algebra.
     * It can be termed as vertical joining of all the unique tuples
     * from both the DataModel instances. The requirement is both
     * the DataModel instances should have same column name and order.
     *
     * @public
     * @param {DataModel} unionWith - Another DataModel instance to which union
     * operation is performed.
     * @return {DataModel} Returns the new DataModel instance after operation.
     */
    union (unionWith) {
        return union(this, unionWith);
    }

    /**
     * Performs difference operation of the relational algebra.
     * It can be termed as vertical joining of all the tuples
     * those are not in the second DataModel. The requirement
     * is both the DataModel instances should have same column name and order.
     *
     * @public
     * @param {DataModel} differenceWith - Another DataModel instance to which difference
     * operation is performed.
     * @return {DataModel} Returns the new DataModel instance after operation.
     */
    difference (differenceWith) {
        return difference(this, differenceWith);
    }

    /**
     * Performs selection operation of the relational algebra.
     *
     * @public
     * @param {Function} selectFn - The function which will be looped through all the data
     * if it return true the row will be there in the DataModel.
     * @param {Object} [config] - The mode configuration.
     * @param {string} [config.mode=FilteringMode.NORMAL] - The mode of the selection.
     * @param {string} [saveChild=true] - It is used while cloning.
     * @return {DataModel} Returns the new DataModel instance(s) after operation.
     */
    select (selectFn, config) {
        const defConfig = {
            mode: FilteringMode.NORMAL,
            saveChild: true
        };
        config = Object.assign({}, defConfig, config);

        const cloneConfig = { saveChild: config.saveChild };
        let oDm;

        if (config.mode === FilteringMode.ALL) {
            const selectDm = cloneWithSelect(
                this,
                selectFn,
                { mode: FilteringMode.NORMAL },
                cloneConfig
            );
            const rejectDm = cloneWithSelect(
                this,
                selectFn,
                { mode: FilteringMode.INVERSE },
                cloneConfig
            );
            oDm = [selectDm, rejectDm];
        } else {
            oDm = cloneWithSelect(
                this,
                selectFn,
                config,
                cloneConfig
            );
        }

        return oDm;
    }

    /**
     * Returns whether datamodel has no data.
     *
     * @return {Boolean} Whether datamodel is empty or not.
     */


    isEmpty () {
        return !this._rowDiffset.length || !this._colIdentifier.length;
    }

    /**
     * Creates a clone  from the current DataModel instance with child parent relationship.
     *
     * @public
     * @param {boolean} [saveChild=true] - Whether the cloned instance would be recorded
     * in the parent instance.
     * @return {DataModel} - Returns the newly cloned DataModel instance.
     */
    clone (saveChild = true, linkParent = true) {
        let retDataModel;
        if (linkParent === false) {
            const dataObj = this.getData({
                getAllFields: true
            });
            const data = dataObj.data;
            const schema = dataObj.schema;
            const jsonData = data.map((row) => {
                const rowObj = {};
                schema.forEach((field, i) => {
                    rowObj[field.name] = row[i];
                });
                return rowObj;
            });
            retDataModel = new this.constructor(jsonData, schema);
        }
        else {
            retDataModel = new this.constructor(this);
        }

        if (saveChild) {
            this._children.push(retDataModel);
        }
        return retDataModel;
    }

    /**
     * Performs projection operation on the current DataModel instance.
     *
     * @public
     * @param {Array.<string | Regexp>} projField - An array of column names in string or regular expression.
     * @param {Object} [config={}] - An optional config.
     * @return {DataModel} Returns the new DataModel instance after operation.
     */
    project (projField, config) {
        const defConfig = {
            mode: FilteringMode.NORMAL,
            saveChild: true
        };
        config = Object.assign({}, defConfig, config);
        const fieldConfig = this.getFieldsConfig();
        const allFields = Object.keys(fieldConfig);
        const { mode } = config;

        let normalizedProjField = projField.reduce((acc, field) => {
            if (field.constructor.name === 'RegExp') {
                acc.push(...allFields.filter(fieldName => fieldName.search(field) !== -1));
            } else if (field in fieldConfig) {
                acc.push(field);
            }
            return acc;
        }, []);

        normalizedProjField = Array.from(new Set(normalizedProjField)).map(field => field.trim());
        let dataModel;

        if (mode === FilteringMode.ALL) {
            let projectionClone = cloneWithProject(this, normalizedProjField, {
                mode: FilteringMode.NORMAL,
                saveChild: config.saveChild
            }, allFields);
            let rejectionClone = cloneWithProject(this, normalizedProjField, {
                mode: FilteringMode.INVERSE,
                saveChild: config.saveChild
            }, allFields);
            dataModel = [projectionClone, rejectionClone];
        } else {
            let projectionClone = cloneWithProject(this, normalizedProjField, config, allFields);
            dataModel = projectionClone;
        }

        return dataModel;
    }

    /**
     * Returns index and field details in an object where key is the field name.
     *
     * @public
     * @return {Object} - Returns the field definitions.
     */
    getFieldsConfig () {
        return this._fieldConfig;
    }

    calculateFieldsConfig () {
        this._fieldConfig = this._fieldspace.fields.reduce((acc, fieldDef, i) => {
            acc[fieldDef.name] = {
                index: i,
                def: { name: fieldDef._ref.name, type: fieldDef._ref.fieldType, subtype: fieldDef._ref.subType() }
            };
            return acc;
        }, {});
        return this;
    }


    /**
     * break the link between its parent and itself
     */
    dispose () {
        this._parent.removeChild(this);
        this._parent = null;
    }

    /**
     *
     * @param {DataModel} child : Delegates the parent to remove this child
     */
    removeChild (child) {
        // remove from child list
        let idx = this._children.findIndex(sibling => sibling === child);
        idx !== -1 ? this._children.splice(idx, 1) : true;
    }
    /**
     *
     * @param { DataModel } parent datamodel instance which will act as its parent of this.
     * @param { Queue } criteriaQueue Queue contains in-between operation meta-data
     */
    addParent (parent, criteriaQueue = []) {
        persistDerivation(this, DM_DERIVATIVES.COMPOSE, null, criteriaQueue);
        this._parent = parent;
        parent._children.push(this);
    }
}

export default Relation;
