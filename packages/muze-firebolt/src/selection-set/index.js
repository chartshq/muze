import {
    SELECTION_NEW_ENTRY, SELECTION_NEW_EXIT, SELECTION_NULL, SELECTION_OLD_ENTRY, SELECTION_OLD_EXIT
} from '../enums/selection';
/* eslint-disable guard-for-in */

/**
 * This component is used to keep track of the row tuples of the data which gets added and removed.
 * @class SelectionSet
 */
class SelectionSet {
    /**
     * Creates an instance of selection set
     * @param {Array.<string>} completeSet Set of unique ids.
     */
    constructor (completeSet, _volatile) {
        this.completeSet = completeSet;
        this._set = completeSet.reduce((obj, key) => {
            obj[key] = SELECTION_NULL;
            return obj;
        }, {});
        this._volatile = _volatile;
        this._completeSetCount = completeSet.length;
        this._lockedSelection = {};
        this._resetted = true;
    }

    /**
     * Adds a set of ids to the selection set.
     * @param {Array.<number|string>} ids Array of unique ids
     * @return {SelectionSet} Instance of selection set.
     */
    add (ids) {
        this._resetted = false;

        const set = this._set;
        // from exitset to entryset
        ids.forEach((i) => {
            set[i] = SELECTION_NEW_ENTRY;
        });

        for (const key in set) {
            if (set[key] !== SELECTION_NEW_ENTRY && set[key] !== SELECTION_OLD_ENTRY) {
                set[key] = set[key] < 0 ? SELECTION_OLD_EXIT : SELECTION_NEW_EXIT;
            }
        }
        return this;
    }

    /**
     * Adds a set of ids to the selection set.
     * @param {Array.<number|string>} ids Array of unique ids
     * @return {SelectionSet} Instance of selection set.
     */
    update (ids) {
        const set = this._set;
        // from exitset to entryset
        ids.forEach((i) => {
            set[i] = SELECTION_OLD_ENTRY;
        });

        return this;
    }

    /**
     * Adds a set of ids to the selection set.
     * @param {Array.<number|string>} ids Array of unique ids
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
     * Adds a set of ids to the selection set.
     * @param {Array.<number|string>} ids Array of unique ids
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
     * Removes the ids from the selection set.
     * @param {Array.<string>} ids Array of unique ids
     * @return {SelectionSet}  Instance of selection set
     */
    remove (ids) {
        this._resetted = false;

        const set = this._set;
        ids.forEach((i) => {
            set[i] = SELECTION_NEW_EXIT;
        });

        for (const key in set) {
            if (set[key] !== SELECTION_NEW_EXIT && set[key] !== SELECTION_OLD_EXIT) {
                set[key] = set[key] === 0 ? SELECTION_NEW_ENTRY : SELECTION_OLD_ENTRY;
            }
        }

        return this;
    }

    getSets () {
        const set = this._set;
        const retObj = {
            entrySet: [[], []],
            exitSet: [[], []],
            completeSet: []
        };

        for (const key in set) {
            if (set[key] > 0) {
                set[key] === SELECTION_OLD_ENTRY && retObj.entrySet[0].push(key);
                set[key] === SELECTION_NEW_ENTRY && retObj.entrySet[1].push(key);
            } else if (set[key] < 0) {
                set[key] === SELECTION_OLD_EXIT && retObj.exitSet[0].push(key);
                set[key] === SELECTION_NEW_EXIT && retObj.exitSet[1].push(key);
            }
            retObj.completeSet.push(key);
        }

        ['entrySet', 'exitSet'].forEach((type) => {
            retObj[type] = retObj[type].map(e => e.map(Number));
        });
        retObj.completeSet = retObj.completeSet.map(Number);

        return retObj;
    }

    /**
     * Resets the selection set to initial state. It sets the value of every unique id value to
     * null in the selection set.
     * @return {SelectionSet} Instance of selection set.
     */
    reset (ids) {
        const set = this._set;
        if (ids) {
            ids.forEach((i) => {
                set[i] = SELECTION_NULL;
            });
        } else {
            const lockedSel = this._lockedSelection;
            for (const key in set) {
                if (!(key in lockedSel)) {
                    set[key] = SELECTION_NULL;
                }
            }
        }
        this._resetted = true;
        return this;
    }

    /**
     * Gets the set of ids which are added in the selection set.
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
     * Gets the set of ids which are added in the selection set.
     * @return {Array.<string>} Array of unique ids
     */
    getOldEntry () {
        const set = this._set;
        const updateSet = [];

        for (const key in set) {
            set[key] === SELECTION_OLD_ENTRY && updateSet.push(key);
        }
        return updateSet;
    }

    /**
     * Gets the set of ids which are added in the selection set.
     * @return {Array.<string>} Array of unique ids
     */
    getOldExit () {
        const set = this._set;
        const updateSet = [];

        for (const key in set) {
            set[key] === SELECTION_OLD_EXIT && updateSet.push(key);
        }

        return updateSet;
    }

    /**
     * Gets the set of ids which are in the remove set.
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

    /**
     * Swaps the add set and remove set in the selection set.
     * @return {SelectionSet} Instance of selection set.
     */
    toggle () {
        const set = this._set;

        for (const key in set) {
            if (set[key] === SELECTION_NEW_ENTRY) {
                set[key] = SELECTION_NEW_EXIT;
            } else if (set[key] === SELECTION_NEW_EXIT) {
                set[key] = SELECTION_NEW_ENTRY;
            } else if (set[key] === SELECTION_OLD_ENTRY) {
                set[key] = SELECTION_OLD_EXIT;
            } else {
                set[key] = SELECTION_OLD_ENTRY;
            }
        }

        return this;
    }
}

export default SelectionSet;
