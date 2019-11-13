import { getFormattedSet } from './helper';

const fadeFn = (set, context) => {
    const {
        mergedEnter,
        mergedExit,
        exitSet,
        completeSet
    } = set;

    if (!mergedEnter.length && !mergedExit.length) {
        context.applyInteractionStyle(completeSet, {}, 'fade', false);
    } else {
        context.applyInteractionStyle(exitSet, {}, 'fade', true);
        context.applyInteractionStyle(mergedEnter, {}, 'fade', false);
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
    highlight: (set, context, payload, excludeSetIds) => {
        const {
            mergedEnter,
            mergedExit,
            exitSet,
            completeSet
        } = set;

        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(completeSet, {}, 'highlight', false);
        } else {
            const layers = context.firebolt.context.layers();

            layers.forEach((layer) => {
                // get uids of only the currently highlighted point
                const formattedSet = payload.target ? layer.getUidsFromPayload(mergedEnter, payload.target) :
                    mergedEnter;
                // get uids of only the currently highlighted point excluding the excludeSet ids
                const currentHighlightedSet = getFormattedSet(formattedSet, excludeSetIds);

                context.applyInteractionStyle(currentHighlightedSet, {}, 'highlight', true, payload);
                context.applyInteractionStyle(exitSet, {}, 'highlight', false);
            });
        }
    }
};
