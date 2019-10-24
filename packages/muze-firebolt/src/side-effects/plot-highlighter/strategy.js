import { getFormattedSet } from './helper';

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
            context.applyInteractionStyle(completeSet, {}, 'focusStroke', false);
        } else {
            context.applyInteractionStyle(mergedExit, {}, 'focus', true);
            context.applyInteractionStyle(mergedEnter, {}, 'focus', false);

            context.applyInteractionStyle(mergedExit, {}, 'focusStroke', false);
            context.applyInteractionStyle(mergedEnter, {}, 'focusStroke', true);
        }
    },
    highlight: (set, context, strategy, excludeSetIds) => {
        const {
            mergedEnter,
            mergedExit,
            entrySet,
            exitSet,
            completeSet
        } = set;

        // Get all sets except the excludeSet points
        const formattedCompleteSet = getFormattedSet(completeSet, excludeSetIds);
        const formattedEntrySet = getFormattedSet(entrySet[1], excludeSetIds);
        const formattedExitSet = getFormattedSet(exitSet[1], excludeSetIds);

        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(formattedCompleteSet, {}, strategy, false);
        } else {
            context.applyInteractionStyle(formattedEntrySet, {}, strategy, true);
            context.applyInteractionStyle(formattedExitSet, {}, strategy, false);
        }
    }
};
