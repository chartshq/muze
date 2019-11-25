import GenericBehaviour from './generic';
import { getMergedSet } from '../../helper';
import * as SELECTION from '../../enums/selection';

export default class PersistentBehaviour extends GenericBehaviour {
    setSelectionSet (addSet, selectionSet) {
        if (addSet === null) {
            selectionSet.reset();
        } else if (addSet.length) {
            const propagationInf = this.firebolt.getPropagationInf();
            // new add set
            const existingAddSet = addSet.filter(d => selectionSet._set[d] === SELECTION.SELECTION_NEW_ENTRY
                || selectionSet._set[d] === SELECTION.SELECTION_OLD_ENTRY);
            if (propagationInf.sourceId) {
                selectionSet.updateExit();
                const { entrySet } = selectionSet.getSets({ keepDims: true });
                selectionSet.reset(getMergedSet(entrySet));
                selectionSet.add(addSet);
                selectionSet.update(existingAddSet);
            } else {
                // existing add set
                if (existingAddSet.length) {
                    selectionSet.updateExit();
                    selectionSet.remove(existingAddSet);
                } else {
                    selectionSet.updateEntry();
                    selectionSet.add(addSet);
                }
                const { exitSet } = selectionSet.getSets({ keepDims: true });
                const mergedExitSet = getMergedSet(exitSet);
                const completeSetCount = selectionSet.getCompleteSet().length;
                if (mergedExitSet.length === completeSetCount) {
                    selectionSet.reset();
                }
            }
        } else {
            selectionSet.remove(selectionSet.getCompleteSet());
        }

        return this;
    }
}
