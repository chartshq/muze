import PersistentBehaviour from './persistent';
import { SELECT } from '../../enums/behaviours';
import { SELECTION } from '../..';
import { getMergedSet } from '../../helper';

export default class SelectBehaviour extends PersistentBehaviour {
    static formalName () {
        return SELECT;
    }

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
                const { entrySet } = selectionSet.getSets();
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
                const { exitSet } = selectionSet.getSets({ keys: true });
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

