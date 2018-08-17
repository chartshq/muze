/**
 * Generates domain for measure field.
 *
 * @param {Array} data - The array of data.
 * @return {Array} Returns the measure domain.
 */
export default (data) => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    data.forEach((d) => {
        if (d < min) {
            min = d;
        }
        if (d > max) {
            max = d;
        }
    });

    return [min, max];
};
