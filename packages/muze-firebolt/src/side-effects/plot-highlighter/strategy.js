export const strategies = {
    fade: (set, context) => {
        const {
            mergedEnter,
            mergedExit,
            exitSet,
            completeSet
        } = set;

        if (!mergedEnter.length && !mergedExit.length) {
            context.unfadeSelection(completeSet);
        } else {
            context.fadeOutSelection(exitSet[1]);
            context.unfadeSelection(mergedEnter);
        }
    },
    focus: (set, context) => {
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = set;
        if (!mergedEnter.length && !mergedExit.length) {
            context.focusSelection(completeSet);
        } else {
            context.focusOutSelection(mergedExit);
            context.focusSelection(mergedEnter);
        }
    },
    highlight: (set, context) => {
        const {
            mergedEnter,
            mergedExit,
            entrySet,
            exitSet,
            completeSet
        } = set;
        if (!mergedEnter.length && !mergedExit.length) {
            context.dehighlightPoint(completeSet);
        } else {
            context.highlightPoint(entrySet[1]);
            context.dehighlightPoint(exitSet[1]);
        }
    }
};
