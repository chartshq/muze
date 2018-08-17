/**
 * The default sort function.
 *
 * @param {*} a - The first value.
 * @param {*} b - The second value.
 * @return {number} Returns the comparison result e.g. 1 or 0 or -1.
 */
function defSortFn (a, b) {
    const a1 = `${a}`;
    const b1 = `${b}`;
    if (a1 < b1) {
        return -1;
    }
    if (a1 > b1) {
        return 1;
    }
    return 0;
}

/**
 * The helper function for merge sort which creates the sorted array
 * from the two halves of the input array.
 *
 * @param {Array} arr - The target array which needs to be merged.
 * @param {number} lo - The starting index of the first array half.
 * @param {number} mid - The ending index of the first array half.
 * @param {number} hi - The ending index of the second array half.
 * @param {Function} sortFn - The sort function.
 */
function merge (arr, lo, mid, hi, sortFn) {
    const mainArr = arr;
    const auxArr = [];
    for (let i = lo; i <= hi; i += 1) {
        auxArr[i] = mainArr[i];
    }
    let a = lo;
    let b = mid + 1;

    for (let i = lo; i <= hi; i += 1) {
        if (a > mid) {
            mainArr[i] = auxArr[b];
            b += 1;
        } else if (b > hi) {
            mainArr[i] = auxArr[a];
            a += 1;
        } else if (sortFn(auxArr[a], auxArr[b]) <= 0) {
            mainArr[i] = auxArr[a];
            a += 1;
        } else {
            mainArr[i] = auxArr[b];
            b += 1;
        }
    }
}

/**
 * The helper function for merge sort which would be called
 * recursively for sorting the array halves.
 *
 * @param {Array} arr - The target array which needs to be sorted.
 * @param {number} lo - The starting index of the array half.
 * @param {number} hi - The ending index of the array half.
 * @param {Function} sortFn - The sort function.
 * @return {Array} Returns the target array itself.
 */
function sort (arr, lo, hi, sortFn) {
    if (hi === lo) { return arr; }

    const mid = lo + Math.floor((hi - lo) / 2);
    sort(arr, lo, mid, sortFn);
    sort(arr, mid + 1, hi, sortFn);
    merge(arr, lo, mid, hi, sortFn);

    return arr;
}

/**
 * The implementation of merge sort.
 * It is used in DataModel for stable sorting as it is not sure
 * what the sorting algorithm used by browsers is stable or not.
 *
 * @param {Array} arr - The target array which needs to be sorted.
 * @param {Function} [sortFn=defSortFn] - The sort function.
 * @return {Array} Returns the input array itself in sorted order.
 */
export function mergeSort (arr, sortFn = defSortFn) {
    if (arr.length > 1) {
        sort(arr, 0, arr.length - 1, sortFn);
    }
    return arr;
}
