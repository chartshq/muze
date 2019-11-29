/**
 * This is a wrapper class over the matrix of cells which gets created in visual group. Visual Group creates left,
 * right, bottom and top and center matrices and wraps them using this class.
 *
 * @public
 * @class ValueMatrix
 */
class ValueMatrix {

    /**
     * Creates an instance of ValueMatrix.
     *
     * @param {Array} matrixArr Matrix array.
     */
    constructor (matrixArr) {
        const instancesById = {};

        this.matrix(matrixArr || []);
        this.filter(() => true);

        this.each((el, rIdx, cIdx) => {
            const cellValue = el.valueOf();
            if (cellValue && cellValue.id) {
                const id = cellValue.id();
                instancesById[id] = {
                    instance: cellValue,
                    rowIndex: rIdx,
                    colIndex: cIdx
                };
            }
        });

        this.instancesById(instancesById);
    }

    instancesById (...id) {
        if (id.length) {
            this._instancesById = id[0];
            return this;
        }
        return this._instancesById;
    }

    /**
     * Returns the array of matrices contained in this instance.
     *
     * @public
     * @return {Array} Array of matrices.
     */
    matrix (...matrix) {
        if (matrix.length) {
            this._matrix = matrix[0];
            return this;
        }
        return this._matrix;
    }

    /**
     * Sets a filter criteria. This filter criteria gets applied when each function is called.
     *
     * @public
     * @param {Function} fn Filter function.
     *
     * @return {ValueMatrix} Instance of value matrix.
     */
    filter (...fn) {
        if (fn.length) {
            this._filterFn = fn[0];
            return this;
        }
        return this._filterFn;
    }

    /**
     * Returns the total width occupied by all the cells of the matrix.
     *
     * @return {Number} Width of the matrix.
     */
    width () {
        let rowWidth = 0;

        this.matrix().forEach((row) => {
            let currentRowWidth = 0;
            row.forEach((cell) => {
                currentRowWidth += cell.getLogicalSpace().width;
            });
            rowWidth = Math.max(rowWidth, currentRowWidth);
        });
        return rowWidth;
    }

    /**
     * Returns the total width occupied by all the cells of the matrix.
     *
     * @return {Number} Width of the matrix.
     */
    height () {
        let rowHeight = 0;

        this.matrix().forEach((row) => {
            let currentRowHeight = 0;
            row.forEach((cell) => {
                currentRowHeight = Math.max(currentRowHeight, cell.getLogicalSpace().height);
            });
            rowHeight += currentRowHeight;
        });
        return rowHeight;
    }

    /**
     * Iterates through the two dimensional matrix array and calls the given callback function with the cell instance,
     * row index, column index and the matrix array.
     *
     * @param {Function} fn Callback function which will get called for every cell.
     * @return {ValueMatrix} Instance of the value matrix.
     */
    each (fn) {
        const matrix = this.matrix();
        const filterFn = this.filter();

        matrix.forEach((row, rIndex) => {
            row.forEach((col, cIndex) => {
                if (filterFn(col)) {
                    fn(col, rIndex, cIndex, matrix);
                }
            });
        });
        return this;
    }

    findPlaceHolderById (id) {
        return this.instancesById()[id];
    }

    clear () {
        this.each(cell => cell.remove());
        this.matrix([]);
    }

    data () {

    }
}

export default ValueMatrix;
