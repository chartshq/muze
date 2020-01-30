import { ReservedFields } from 'muze-utils';
import {
    SELECTION_NEW_ENTRY, SELECTION_NEW_EXIT, SELECTION_NULL, SELECTION_OLD_ENTRY, SELECTION_OLD_EXIT
} from '../enums/selection';
/* eslint-disable guard-for-in */

/**
 * This component is used to keep track of the row tuples of the data which gets added and removed. This keeps
 * information of which rows are in previous and new entry set and previous and new exit set. This is initialized by
 * {@link Firebolt}.
 *
 * @public
 *
 * @class SelectionSet
 */
class SelectionSet {
    /**
     * Creates an instance of selection set
     *
     * @param {Array.<string>} completeSet Set of unique ids.
     */
    constructor ({ keys, fields }, _volatile) {
        this.completeSet = keys;
        this._set = {};
        this._uidMap = {};
        this._measureNames = {};
        this._dimVals = {};

        for (const key in keys) {
            this._set[key] = SELECTION_NULL;
            this._uidMap[key] = keys[key].uid;
            this._measureNames[key] = keys[key].measureNames;
            this._dimVals[key] = keys[key].dims;
        }
        this._fields = fields;
        this._fieldIndices = fields.reduce((acc, v, i) => {
            acc[v] = i;
            return acc;
        }, {});
        this._volatile = _volatile;
        this._completeSetCount = Object.keys(keys).length;
        this._resetted = true;
    }

    /**
     * Adds a set of ids to the selection set. This also moves the other rows to exit set.
     *
     * @public
     * @param {Array.<number|string>} ids Array of unique ids.
     *
     * @return {SelectionSet} Instance of selection set.
     */
    add (ids) {
        this._resetted = false;

        const set = this._set;
        // from exitset to entryset
        ids.forEach((i) => {
            if (i in set) {
                set[i] = SELECTION_NEW_ENTRY;
            }
        });

        for (const key in set) {
            if (set[key] !== SELECTION_NEW_ENTRY && set[key] !== SELECTION_OLD_ENTRY) {
                set[key] = set[key] < 0 ? SELECTION_OLD_EXIT : SELECTION_NEW_EXIT;
            }
        }
        return this;
    }

    /**
     * Adds an array of ids to the old entry set.
     *
     * @param {Array.<number|string>} ids Array of unique ids
     *
     * @return {SelectionSet} Instance of selection set.
     */
    update (ids) {
        const set = this._set;
        // from exitset to entryset
        ids.forEach((i) => {
            if (i in set) {
                set[i] = SELECTION_OLD_ENTRY;
            }
        });

        return this;
    }

    /**
     * Moves all ids which in new entry set  to old entry set.
     *
     * @public
     * @param {Array.<number|string>} ids Array of unique ids
     *
     * @return {SelectionSet} Instance of selection set.
     */
    updateEntry () {
        const set = this._set;

        // from exitset to entryset
        for (const key in set) {
            set[key] = set[key] === SELECTION_NEW_ENTRY ? SELECTION_OLD_ENTRY : set[key];
        }
        return this;
    }

    /**
     * Moves an array of ids which are in new exit set to old exit set.
     *
     * @public
     *
     * @param {Array.<number|string>} ids Array of unique ids.
     *
     * @return {SelectionSet} Instance of selection set.
     */
    updateExit () {
        const set = this._set;
        // from exitset to entryset
        for (const key in set) {
            set[key] = set[key] === SELECTION_NEW_EXIT ? SELECTION_OLD_EXIT : set[key];
        }
        return this;
    }

    /**
     * Removes an array of ids from the selection set. It also moves the remaining row ids to entry set.
     *
     * @public
     * @param {Array.<string>} ids Array of unique ids
     *
     * @return {SelectionSet}  Instance of selection set
     */
    remove (ids) {
        this._resetted = false;

        const set = this._set;
        ids.forEach((i) => {
            i in set && (set[i] = SELECTION_NEW_EXIT);
        });

        for (const key in set) {
            if (set[key] !== SELECTION_NEW_EXIT && set[key] !== SELECTION_OLD_EXIT) {
                set[key] = set[key] === 0 ? SELECTION_NEW_ENTRY : SELECTION_OLD_ENTRY;
            }
        }

        return this;
    }

    getSets (config = {}) {
        const set = this._set;
        const uidMap = this._uidMap;
        const retObj = {
            entrySet: [[], []],
            exitSet: [[], []],
            mergedEnter: [],
            mergedExit: [],
            completeSet: []
        };
        const dimVals = this._dimVals;
        const { keepDims, fields = [], keys = false } = config;
        const measureNames = this._measureNames;

        for (const key in set) {
            const measureNamesArr = measureNames[key] || [];
            let val;
            if (keepDims) {
                val = fields.map((field) => {
                    if (field === ReservedFields.MEASURE_NAMES) {
                        return measureNamesArr;
                    } else if (field === ReservedFields.ROW_ID) {
                        return uidMap[key];
                    }
                    return dimVals[key][this._fieldIndices[field]];
                });
            } else if (keys) {
                val = key;
            } else {
                val = measureNamesArr.length ? [uidMap[key], measureNamesArr] : [uidMap[key]];
            }

            if (set[key] > 0) {
                [SELECTION_OLD_ENTRY, SELECTION_NEW_ENTRY].forEach((v, i) => {
                    if (set[key] === v) {
                        retObj.entrySet[i].push(val);
                    }
                });
                if (set[key] === SELECTION_OLD_ENTRY || set[key] === SELECTION_NEW_ENTRY) {
                    retObj.mergedEnter.push(val);
                }
            } else if (set[key] < 0) {
                [SELECTION_OLD_EXIT, SELECTION_NEW_EXIT].forEach((v, i) => {
                    if (set[key] === v) {
                        retObj.exitSet[i].push(val);
                    }
                });
                if (set[key] === SELECTION_OLD_EXIT || set[key] === SELECTION_NEW_EXIT) {
                    retObj.mergedExit.push(val);
                }
            }
            retObj.completeSet.push(val);
        }

        return retObj;
    }

    /**
     * Resets an array of ids in the selection set to initial state. It sets the value of every unique id value to
     * null in the selection set which means they are neither in entry set nor in exit set. If no ids are passed,
     * then it resets all the ids to null.
     *
     * @public
     *
     * @param {Array} ids Array of unique ids.
     * @return {SelectionSet} Instance of selection set.
     */
    reset (ids) {
        const set = this._set;
        if (ids) {
            ids.forEach((i) => {
                i in set && (set[i] = SELECTION_NULL);
            });
        } else {
            for (const key in set) {
                set[key] = SELECTION_NULL;
            }
        }
        this._resetted = true;
        return this;
    }

    /**
     * Gets the set of ids which are added in the selection set.
     *
     * @public
     *
     * @return {Array.<string>} Array of unique ids
     */
    getEntrySet () {
        const set = this._set;
        const addSet = [];

        for (const key in set) {
            set[key] === SELECTION_NEW_ENTRY && addSet.push(key);
        }

        return addSet;
    }

    /**
     * Returns a set of unique ids which are already present in entry set.
     *
     * @public
     * @param {Array} addSet Array of unique ids which are added
     *
     * @return {Array} Array of unique ids which are already in old entry set or new entry set
     */
    getExistingEntrySet (addSet) {
        const set = this._set;
        return addSet.filter(d => set[d] === SELECTION_NEW_ENTRY || set[d] === SELECTION_OLD_ENTRY);
    }

    /**
     * Returns a set of unique ids which are already present in exit set.
     *
     * @public
     * @param {Array} addSet Array of unique ids which are added
     *
     * @return {Array} Array of unique ids which are already in old exit set or new exit set
     */
    getExistingExitSet (removeSet) {
        const set = this._set;
        return removeSet.filter(d => set[d] === SELECTION_NEW_EXIT || set[d] === SELECTION_OLD_EXIT);
    }

    /**
     * Gets the array of ids which are in the exit set.
     *
     * @public
     * @return {Array.<string>} Array of unique ids
     */
    getExitSet () {
        const set = this._set;
        const removeSet = [];

        for (const key in set) {
            set[key] === SELECTION_NEW_EXIT && removeSet.push(key);
        }
        return removeSet;
    }

    /**
     * Gets all the ids which are either in exit or entry set.
     *
     * @public
     * @return {Array} Array of unique ids
     */
    getCompleteSet () {
        const set = this._set;
        const completeSet = [];

        for (const key in set) {
            completeSet.push(key);
        }

        return completeSet;
    }

    getCompleteSetCount () {
        return this._completeSetCount;
    }

    resetted () {
        return this._resetted;
    }
}

export default SelectionSet;
