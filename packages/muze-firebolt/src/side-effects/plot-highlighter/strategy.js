const fadeFn = (set, context, strategy) => {
    const {
        mergedEnter,
        mergedExit,
        exitSet,
        completeSet
    } = set;

    if (!mergedEnter.length && !mergedExit.length) {
        context.applyInteractionStyle(completeSet, {}, strategy, false);
    } else {
        context.applyInteractionStyle(exitSet[1], {}, strategy, true);
        context.applyInteractionStyle(mergedEnter, {}, strategy, false);
    }
};

export const strategies = {
    fade: fadeFn,
    focus: (set, context) => {
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = set;
        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(completeSet, {}, 'focus', false);
        } else {
            context.applyInteractionStyle(mergedExit, {}, 'focus', true);
            context.applyInteractionStyle(mergedEnter, {}, 'focus', false);
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
            context.applyInteractionStyle(completeSet, {}, 'highlight', false);
        } else {
            context.applyInteractionStyle(entrySet[1], {}, 'highlight', true);
            context.applyInteractionStyle(exitSet[1], {}, 'highlight', false);
        }
    }
};
