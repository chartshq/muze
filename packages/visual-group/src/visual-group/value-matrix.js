/**
 *
 *
 * @export
 * @class ValueMatrix
 */
class ValueMatrix {

    /**
     *Creates an instance of ValueMatrix.
     * @param {*} matrixArr
     * @memberof ValueMatrix
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

    /**
     *
     *
     * @param {*} id
     * @return
     * @memberof ValueMatrix
     */
    instancesById (...id) {
        if (id.length) {
            this._instancesById = id[0];
            return this;
        }
        return this._instancesById;
    }

    /**
     *
     *
     * @param {*} m
     * @return
     * @memberof ValueMatrix
     */
    matrix (...matrix) {
        if (matrix.length) {
            this._matrix = matrix[0];
            return this;
        }
        return this._matrix;
    }

    /**
     *
     *
     * @param {*} fn
     * @return
     * @memberof ValueMatrix
     */
    filter (...fn) {
        if (fn.length) {
            this._filterFn = fn[0];
            return this;
        }
        return this._filterFn;
    }

    /**
     *
     *
     * @return
     * @memberof ValueMatrix
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
     *
     *
     * @return
     * @memberof ValueMatrix
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
     *
     *
     * @param {*} fn
     * @return
     * @memberof ValueMatrix
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

    /**
     *
     *
     * @param {*} id
     * @return
     * @memberof ValueMatrix
     */
    findPlaceHolderById (id) {
        return this.instancesById()[id];
    }

    /**
     *
     *
     * @return
     * @memberof ValueMatrix
     */
    getMatrixArray () {
        return this.matrix();
    }
}

export default ValueMatrix;
