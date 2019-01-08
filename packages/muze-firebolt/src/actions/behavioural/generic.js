import { getSetInfo, getMergedSet, getSourceFields } from '../../helper';

/**
 * This is the base class has all the common functionalities needed for all behavioural actions. Any other behavioural
 * action needs to extend this class.
 *
 * @public
 * @class GenericBehaviour
 * @module GenericBehaviour
 */
export default class GenericBehaviour {
    constructor (firebolt) {
        this.firebolt = firebolt;
        this._enabled = true;
    }

    /**
     * Returns entry and exit set information. This method is called by firebolt when ```dispatchBehaviour``` is called
     * dynamically or when any physical action is triggered on the chart.
     *
     * @param {Object} payload Payload information.
     * @param {Object|Array} payload.criteria Identifiers of data interacted with.
     *
     * @return {Array} Entry and exit set information.
     */
    dispatch (payload) {
        const criteria = payload.criteria;
        const firebolt = this.firebolt;
        const formalName = this.constructor.formalName();
        const selectionSets = firebolt.getSelectionSets(formalName);
        const {
            model: filteredDataModel,
            uids
        } = this.firebolt.getAddSetFromCriteria(criteria, this.firebolt.getPropagationInf());
        const entryExitSets = selectionSets.map((selectionSet) => {
            this.setSelectionSet(uids, selectionSet);
            return this.getEntryExitSet(selectionSet, filteredDataModel, payload);
        });

        return entryExitSets;
    }

    /**
     * Updates the selection set by adding uids to the instance of {@link SelectionSet} or removing them.
     * {@link SelectionSet} keeps the information of which rows are in the entry set and exit set.
     *
     * @public
     * @param {Array} addSet Array of row ids which got affected during interaction.
     * @param {SelectionSet} selectionSet Instance of selection set.
     *
     * @return {GenericBehaviour} Instance of behaviour.
     */
    setSelectionSet () {
        return this;
    }

    getEntryExitSet (selectionSet, filteredDataModel, payload) {
        const {
            entrySet,
            exitSet,
            completeSet
        } = selectionSet.getSets();
        const propagationInf = this.firebolt.getPropagationInf();
        const dataModel = this.firebolt.getFullData();
        const setConfig = {
            isSourceFieldPresent: propagationInf.isSourceFieldPresent,
            dataModel,
            filteredDataModel,
            propagationData: propagationInf.data,
            selectionSet
        };

        return {
            entrySet: [getSetInfo('oldEntry', entrySet[0], setConfig),
                getSetInfo('newEntry', entrySet[1], setConfig)],
            exitSet: [getSetInfo('oldEntry', exitSet[0], setConfig),
                getSetInfo('newExit', exitSet[1], setConfig)],
            mergedEnter: getSetInfo('mergedEnter', getMergedSet(entrySet), setConfig),
            mergedExit: getSetInfo('mergedExit', getMergedSet(exitSet), setConfig),
            completeSet: getSetInfo('complete', completeSet, setConfig),
            isSourceFieldPresent: propagationInf.isSourceFieldPresent,
            fields: getSourceFields(propagationInf, payload.criteria),
            sourceSelectionSet: selectionSet._volatile === true
        };
    }

    static mutates () {
        return false;
    }

    enable () {
        this._enabled = true;
    }

    disable () {
        this._enabled = false;
    }

    isEnabled () {
        return this._enabled;
    }
}

