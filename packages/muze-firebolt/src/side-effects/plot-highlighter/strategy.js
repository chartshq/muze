import { getFormattedSet } from './helper';

const fadeFn = (set, context) => {
    const { formattedSet } = set;
    const {
        mergedEnter,
        mergedExit,
        exitSet,
        completeSet
    } = formattedSet;

    if (!mergedEnter.length && !mergedExit.length) {
        context.applyInteractionStyle(completeSet, {}, 'fade', false);
    } else {
        context.applyInteractionStyle(exitSet, {}, 'fade', true);
        context.applyInteractionStyle(mergedEnter, {}, 'fade', false);
    }
};

const fadeOnBrushFn = (set, context) => {
    const { formattedSet } = set;
    const {
        mergedEnter,
        mergedExit,
        exitSet,
        completeSet
    } = formattedSet;

    if (!mergedEnter.length && !mergedExit.length) {
        context.applyInteractionStyle(completeSet, {}, 'fade', false);
        context.applyInteractionStyle(completeSet, {}, 'brushStroke', false);
    } else {
        context.applyInteractionStyle(exitSet, {}, 'fade', true);
        context.applyInteractionStyle(mergedEnter, {}, 'fade', false);

        context.applyInteractionStyle(exitSet, {}, 'brushStroke', false);
        context.applyInteractionStyle(mergedEnter, {}, 'brushStroke', true);
    }
};

export const strategies = {
    fade: fadeFn,
    fadeOnBrush: fadeOnBrushFn,
    focus: (set, context) => {
        const { formattedSet } = set;
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = formattedSet;

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
    highlight: (set, context, payload, excludeSetIds) => {
        const { selectionSet, formattedSet } = set;
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = formattedSet;

        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(completeSet, {}, 'highlight', false);
        } else {
            const layers = context.firebolt.context.layers();

            layers.forEach((layer) => {
                // get uids of only the currently highlighted point
                const actualPoint = payload.target ? layer.getUidsFromPayload(mergedEnter, payload.target) :
                    mergedEnter;
                // get uids of only the currently highlighted point excluding the excludeSet ids
                const currentHighlightedSet = getFormattedSet(actualPoint, excludeSetIds);

                context.applyInteractionStyle(currentHighlightedSet, {}, 'highlight', true, payload);
                context.applyInteractionStyle(selectionSet.exitSet[1], {}, 'highlight', false);
            });
        }
    },
    areaFocus: (set, context) => {
        const { formattedSet } = set;
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = formattedSet;
        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(completeSet, {}, 'focus', false);
            context.applyInteractionStyle(completeSet, {}, 'focusStroke', false);
        } else {
            context.applyInteractionStyle(mergedExit, {}, 'focus', false);
            context.applyInteractionStyle(mergedEnter, {}, 'focus', true);

            context.applyInteractionStyle(mergedExit, {}, 'focusStroke', false);
            context.applyInteractionStyle(mergedEnter, {}, 'focusStroke', true);
        }
    },
    areaFade: (set, context) => {
        const { formattedSet } = set;
        const {
            mergedEnter,
            mergedExit,
            exitSet,
            completeSet
        } = formattedSet;

        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(completeSet, {}, 'fade', false);
        } else {
            context.applyInteractionStyle(exitSet, {}, 'fade', false);
            context.applyInteractionStyle(mergedEnter, {}, 'fade', true);
        }
    }
};
