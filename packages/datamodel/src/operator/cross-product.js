import DataModel from '../datamodel';
import { extend2 } from '../utils';
import { getCommonSchema } from './get-common-schema';
import { rowDiffsetIterator } from './row-diffset-iterator';
import { JOINS } from '../constants';
/**
 * Default filter function for crossProduct.
 *
 * @return {boolean} Always returns true.
 */
function defaultFilterFn() { return true; }

/**
 * Implementation of cross product operation between two DataModel instances.
 * It internally creates the data and schema for the new DataModel.
 *
 * @param {DataModel} dataModel1 - The left DataModel instance.
 * @param {DataModel} dataModel2 - The right DataModel instance.
 * @param {Function} filterFn - The filter function which is used to filter the tuples.
 * @param {boolean} [replaceCommonSchema=false] - The flag if the common name schema should be there.
 * @return {DataModel} Returns The newly created DataModel instance from the crossProduct operation.
 */
export function crossProduct (dm1, dm2, filterFn, replaceCommonSchema = false, jointype = JOINS.CROSS) {
    const schema = [];
    const data = [];
    const applicableFilterFn = filterFn || defaultFilterFn;
    const dm1FieldStore = dm1.getFieldspace();
    const dm2FieldStore = dm2.getFieldspace();
    const dm1FieldStoreName = dm1FieldStore.name;
    const dm2FieldStoreName = dm2FieldStore.name;
    const name = `${dm1FieldStore.name}.${dm2FieldStore.name}`;
    const commonSchemaList = getCommonSchema(dm1FieldStore, dm2FieldStore);

    if (dm1FieldStoreName === dm2FieldStoreName) {
        throw new Error('DataModels must have different alias names');
    }
    // Here prepare the schema
    dm1FieldStore.fields.forEach((field) => {
        const tmpSchema = extend2({}, field.schema);
        if (commonSchemaList.indexOf(tmpSchema.name) !== -1 && !replaceCommonSchema) {
            tmpSchema.name = `${dm1FieldStore.name}.${tmpSchema.name}`;
        }
        schema.push(tmpSchema);
    });
    dm2FieldStore.fields.forEach((field) => {
        const tmpSchema = extend2({}, field.schema);
        if (commonSchemaList.indexOf(tmpSchema.name) !== -1) {
            if (!replaceCommonSchema) {
                tmpSchema.name = `${dm2FieldStore.name}.${tmpSchema.name}`;
                schema.push(tmpSchema);
            }
        } else {
            schema.push(tmpSchema);
        }
    });

    // Here prepare Data
    rowDiffsetIterator(dm1._rowDiffset, (i) => {
        let rowAdded = false;
        let rowPosition;
        rowDiffsetIterator(dm2._rowDiffset, (ii) => {
            const tuple = [];
            const userArg = {};
            userArg[dm1FieldStoreName] = {};
            userArg[dm2FieldStoreName] = {};
            dm1FieldStore.fields.forEach((field) => {
                tuple.push(field.data[i]);
                userArg[dm1FieldStoreName][field.name] = field.data[i];
            });
            dm2FieldStore.fields.forEach((field) => {
                if (!(commonSchemaList.indexOf(field.schema.name) !== -1 && replaceCommonSchema)) {
                    tuple.push(field.data[ii]);
                }
                userArg[dm2FieldStoreName][field.name] = field.data[ii];
            });
            if (applicableFilterFn(userArg)) {
                const tupleObj = {};
                tuple.forEach((cellVal, iii) => {
                    tupleObj[schema[iii].name] = cellVal;
                });
                if (rowAdded && JOINS.CROSS !== jointype) {
                    data[rowPosition] = tupleObj;
                }
                else {
                    data.push(tupleObj);
                    rowAdded = true;
                    rowPosition = i;
                }
            }
            else if ((jointype === JOINS.LEFTOUTER || jointype === JOINS.RIGHTOUTER) && !rowAdded) {
                const tupleObj = {};
                let len = dm1FieldStore.fields.length - 1;
                tuple.forEach((cellVal, iii) => {
                    if (iii <= len) {
                        tupleObj[schema[iii].name] = cellVal;
                    }
                    else {
                        tupleObj[schema[iii].name] = null;
                    }
                });
                rowAdded = true;
                rowPosition = i;
                data.push(tupleObj);
            }
        });
    });

    return new DataModel(data, schema, name);
}
