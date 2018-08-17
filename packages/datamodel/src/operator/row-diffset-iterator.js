/**
 * Iterates through the diffSet array and call the callback with the current
 * index.
 *
 * @param {string} rowDiffset - The row diffset string e.g. '0-4,6,10-13'.
 * @param {Function} callback - The callback function to be called with every index.
 */
export function rowDiffsetIterator (rowDiffset, callback) {
    if (rowDiffset.length > 0) {
        const rowDiffArr = rowDiffset.split(',');
        rowDiffArr.forEach((diffStr) => {
            const diffStsArr = diffStr.split('-');
            const start = +(diffStsArr[0]);
            const end = +(diffStsArr[1] || diffStsArr[0]);
            if (end >= start) {
                for (let i = start; i <= end; i += 1) {
                    callback(i);
                }
            }
        });
    }
}
