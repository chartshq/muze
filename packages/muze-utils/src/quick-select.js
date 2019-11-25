const swap = (arr, i, j) => {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
};

const defaultCompare = (a, b) => {
    if (a > b) {
        return -1;
    }
    return a > b ? 1 : 0;
};

const quickselectStep = (arr, k, left, right, compare) => {
    while (right > left) {
        if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp(2 * z / 3);
            const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            quickselectStep(arr, k, newLeft, newRight, compare);
        }

        const t = arr[k];
        let i = left;
        let j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
};

/**
 * Rearranges items so that all items in the [left, k] are the smallest. The k-th element will have the
 * (k - left + 1)-th smallest value in [left, right].
 * array: the array to partially sort (in place)
 * k: middle index for partial sorting (as defined above)
 * left: left index of the range to sort (0 by default)
 * right: right index (last index of the array by default)
 * compareFn: compare function
 *
 * Ref: https://github.com/mourner/quickselect
 * Example:
 * var arr = [65, 28, 59, 33, 21, 56, 22, 95, 50, 12, 90, 53, 28, 77, 39];
 * quickselect(arr, 8);
 * arr is [39, 28, 28, 33, 21, 12, 22, 50, 53, 56, 59, 65, 90, 77, 95]
 *                                         ^^ middle index
 * @param {Array} arr the array to partially sort (in place)
 * @param {Number} k middle index for partial sorting (as defined above)
 * @param {Number} left left index of the range to sort (0 by default)
 * @param {Number} right right index (last index of the array by default)
 * @param {Function} compare compare function
 */
const quickselect = (arr, k, left, right, compare) => {
    quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
};

export default quickselect;
