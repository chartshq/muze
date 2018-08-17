import DataModel from '../index';
import { extend2 } from '../utils';
import { rowDiffsetIterator } from './row-diffset-iterator';
import { isArrEqual } from '../utils/helper';

/**
 * Performs the union operation between two dm instances.
 *
 * @todo Fix the conflicts between union and difference terminology here.
 *
 * @param {dm} dm1 - The first dm instance.
 * @param {dm} dm2 - The second dm instance.
 * @return {dm} Returns the newly created dm after union operation.
 */
export function difference (dm1, dm2) {
    const hashTable = {};
    const schema = [];
    const schemaNameArr = [];
    const data = [];
    const dm1FieldStore = dm1.getFieldspace();
    const dm2FieldStore = dm2.getFieldspace();
    const dm1FieldStoreFieldObj = dm1FieldStore.fieldsObj();
    const dm2FieldStoreFieldObj = dm2FieldStore.fieldsObj();
    const name = `${dm1FieldStore.name} union ${dm2FieldStore.name}`;

   // For union the columns should match otherwise return a clone of the dm1
    if (!isArrEqual(dm1._colIdentifier.split(',').sort(), dm2._colIdentifier.split(',').sort())) {
        return null;
    }

    // Prepare the schema
    (dm1._colIdentifier.split(',')).forEach((fieldName) => {
        const field = dm1FieldStoreFieldObj[fieldName];
        schema.push(extend2({}, field.schema));
        schemaNameArr.push(field.schema.name);
    });

    /**
     * The helper function to create the data.
     *
     * @param {dm} dm - The dm instance for which the data is inserted.
     * @param {Object} fieldsObj - The fieldStore object format.
     * @param {boolean} addData - If true only tuple will be added to the data.
     */
    function prepareDataHelper(dm, fieldsObj, addData) {
        rowDiffsetIterator(dm._rowDiffset, (i) => {
            const tuple = {};
            let hashData = '';
            schemaNameArr.forEach((schemaName) => {
                const value = fieldsObj[schemaName].data[i];
                hashData += `-${value}`;
                tuple[schemaName] = value;
            });
            if (!hashTable[hashData]) {
                if (addData) { data.push(tuple); }
                hashTable[hashData] = true;
            }
        });
    }

    // Prepare the data
    prepareDataHelper(dm2, dm2FieldStoreFieldObj, false);
    prepareDataHelper(dm1, dm1FieldStoreFieldObj, true);

    return new DataModel(data, schema, name);
}

