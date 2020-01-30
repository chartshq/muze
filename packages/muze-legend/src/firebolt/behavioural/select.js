import { PersistentBehaviour, SELECTION } from '@chartshq/muze-firebolt';

export default class SelectBehaviour extends PersistentBehaviour {
    static formalName () {
        return 'select';
    }

    setSelectionSet (addSet, selectionSet) {
        if (addSet === null) {
            selectionSet.reset();
        } else if (addSet.length) {
            const propagationInf = this.firebolt._propagationInf;
            // new add set
            const existingRemoveSet = addSet.filter(d => selectionSet._set[d] === SELECTION.SELECTION_OLD_EXIT
                || selectionSet._set[d] === SELECTION.SELECTION_NEW_EXIT);

            if (propagationInf.sourceId) {
                selectionSet.reset();
                selectionSet.add(addSet);
            } else {
                // existing add set
                if (existingRemoveSet.length) {
                    selectionSet.updateEntry();
                    selectionSet.add(existingRemoveSet);
                } else {
                    selectionSet.updateExit();
                    selectionSet.remove(addSet);
                }
                const { exitSet } = selectionSet.getSets({ keys: true });
                const mergedExitSet = [...new Set(exitSet[1]), ...new Set(exitSet[0])];
                const completeSetCount = selectionSet.getCompleteSet().length;
                if (exitSet[1].length !== completeSetCount && mergedExitSet.length === completeSetCount) {
                    selectionSet.reset();
                }
            }
        } else {
            selectionSet.remove(selectionSet.getCompleteSet());
        }
        return this;
    }
}
