import GenericBehaviour from './generic';
import { getMergedSet } from '../../helper';
import * as SELECTION from '../../enums/selection';

export default class PersistentBehaviour extends GenericBehaviour {
    setSelectionSet (addSet, selectionSet) {
        if (addSet === null) {
            selectionSet.reset();
        } else {
            const propagationInf = this.firebolt.getPropagationInf();
            // new add set
            const existingAddSet = addSet.filter(d => selectionSet._set[d] === SELECTION.SELECTION_NEW_ENTRY
                || selectionSet._set[d] === SELECTION.SELECTION_OLD_ENTRY);
            if (propagationInf.sourceId) {
                selectionSet.updateExit();
                const { entrySet } = selectionSet.getSets({ keys: true });
                selectionSet.reset(getMergedSet(entrySet));
                selectionSet.add(addSet);
                selectionSet.update(existingAddSet);
            } else {
                selectionSet.updateEntry();
                selectionSet.add(addSet);
            }
        }

        return this;
    }
}
