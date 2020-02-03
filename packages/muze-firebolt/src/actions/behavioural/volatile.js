import GenericBehaviour from './generic';
import { getMergedSet } from '../../helper';
import * as SELECTION from '../../enums/selection';

export default class VolatileBehaviour extends GenericBehaviour {
    setSelectionSet (addSet, selectionSet) {
        if (addSet === null) {
            selectionSet.reset();
        } else if (addSet.length) {
                // new add set
            const existingAddSet = addSet.filter(d => selectionSet._set[d] === SELECTION.SELECTION_NEW_ENTRY
                    || selectionSet._set[d] === SELECTION.SELECTION_OLD_ENTRY);
            selectionSet.updateExit();
            const { entrySet } = selectionSet.getSets({ keys: true });
            selectionSet.reset(getMergedSet(entrySet));
            selectionSet.add(addSet);
            selectionSet.update(existingAddSet);
        } else {
            selectionSet.remove(selectionSet.getCompleteSet());
        }
    }
}
