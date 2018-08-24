import { getSetInfo, getMergedSet, getSourceFields } from '../../helper';

export default class GenericBehaviour {
    constructor (firebolt) {
        this.firebolt = firebolt;
    }

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
}

