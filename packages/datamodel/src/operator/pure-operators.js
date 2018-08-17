/**
 * Wrapper on calculateVariable() method of DataModel to behave
 * the pure-function functionality.
 *
 * @param {Array} args - The argument list.
 * @return {any} Returns the returned value of calling function.
 */
export const calculateVariable = (...args) => dm => dm.calculateVariable(...args);

/**
 * Wrapper on sort() method of DataModel to behave
 * the pure-function functionality.
 *
 * @param {Array} args - The argument list.
 * @return {any} Returns the returned value of calling function.
 */
export const sort = (...args) => dm => dm.sort(...args);
