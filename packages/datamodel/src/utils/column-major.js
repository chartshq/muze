/**
 * The utility function to calculate major column.
 *
 * @param {Object} store - The store object.
 * @return {Function} Returns the push function.
 */
export default (store) => {
    let i = 0;
    return (...fields) => {
        fields.forEach((val, fieldIndex) => {
            if (!(store[fieldIndex] instanceof Array)) {
                store[fieldIndex] = Array.from({ length: i });
            }
            store[fieldIndex].push(val);
        });
        i++;
    };
};
