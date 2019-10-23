import { getArrayDiff } from 'muze-utils';

/**
 * @private
 * @param {Object} set Points set
 * @param {Array.<number>} selectedPointsId array of id of selected points
 * @return {Object} Returns the set with the selected points removed
 */
const getFormattedSet = (set, selectedPointsId) => {
    const formattedSet = getArrayDiff(set.uids, selectedPointsId);
    return {
        ...set,
        ...{
            uids: formattedSet,
            length: formattedSet.length
        }
    };
};

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
    // Apply highlight only if the point is not already selected
    highlight: (set, context) => {
        const {
            mergedEnter,
            mergedExit,
            entrySet,
            exitSet,
            completeSet
        } = set;

        // Selected points
        const selectedPoints = context.firebolt.getEntryExitSet('select') || {};
        const selectedPointsIds = (selectedPoints.mergedEnter || {}).uids || [];

        // Get all sets excluding the selected points
        const formattedCompleteSet = getFormattedSet(completeSet, selectedPointsIds);
        const formattedEntrySet = getFormattedSet(entrySet[1], selectedPointsIds);
        const formattedExitSet = getFormattedSet(exitSet[1], selectedPointsIds);

        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(formattedCompleteSet, {}, 'highlight', false);
        } else {
            context.applyInteractionStyle(formattedEntrySet, {}, 'highlight', true);
            context.applyInteractionStyle(formattedExitSet, {}, 'highlight', false);
        }
    }
};
