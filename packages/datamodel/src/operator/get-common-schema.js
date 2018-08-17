/**
 * The helper function that returns an array of common schema
 * from two fieldStore instances.
 *
 * @param {FieldStore} fs1 - The first FieldStore instance.
 * @param {FieldStore} fs2 - The second FieldStore instance.
 * @return {Array} An array containing the common schema.
 */
export function getCommonSchema (fs1, fs2) {
    const retArr = [];
    const fs1Arr = [];
    fs1.fields.forEach((field) => {
        fs1Arr.push(field.schema.name);
    });
    fs2.fields.forEach((field) => {
        if (fs1Arr.indexOf(field.schema.name) !== -1) {
            retArr.push(field.schema.name);
        }
    });
    return retArr;
}
