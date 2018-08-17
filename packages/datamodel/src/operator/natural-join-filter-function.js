import { getCommonSchema } from './get-common-schema';

/**
 * The filter function used in natural join.
 * It generates a function that will have the logic to join two
 * DataModel instances by the process of natural join.
 *
 * @param {DataModel} dm1 - The left DataModel instance.
 * @param {DataModel} dm2 - The right DataModel instance.
 * @return {Function} Returns a function that is used in cross-product operation.
 */
export function naturalJoinFilter (dm1, dm2) {
    const dm1FieldStore = dm1.getFieldspace();
    const dm2FieldStore = dm2.getFieldspace();
    const dm1FieldStoreName = dm1FieldStore.name;
    const dm2FieldStoreName = dm2FieldStore.name;
    const commonSchemaArr = getCommonSchema(dm1FieldStore, dm2FieldStore);

    return (obj) => {
        let retainTuple = true;
        commonSchemaArr.forEach((fieldName) => {
            if (obj[dm1FieldStoreName][fieldName] ===
                obj[dm2FieldStoreName][fieldName] && retainTuple) {
                retainTuple = true;
            } else {
                retainTuple = false;
            }
        });
        return retainTuple;
    };
}
