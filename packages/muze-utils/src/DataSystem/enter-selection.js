import Selection from './selection';
/**
 * Represents a selecton in enter phase.
 *
 * @class EnterSelection
 */
class EnterSelection {

    /**
     * Creates an instance of EnterSelection.
     * @param {Array} enterData The input data.
     * @memberof EnterSelection
     */
    constructor(enterData, idMap, idGetter) {
        this._enterData = enterData;
        this._idMap = idMap;
        this._idGetter = idGetter;
    }

    /**
     * Applies the supplied callback to each data element
     * and returns a new selection.
     *
     * @param {Function} callback Callback to execute on each item.
     * @return {Selection} New selection with data created using callback.
     * @memberof EnterSelection
     */
    append(callback) {
        const objects = this._enterData.forEach((...params) => {
            const data = params[0];
            const id = this._idGetter ? this.idGetter(data) : (data.id || params[1]);
            this._idMap[id] = callback(...params);
        });

        return new Selection().appendObjects(objects).data(this._enterData);
    }
}

export default EnterSelection;
