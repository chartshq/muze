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
        context.applyInteractionStyle(completeSet, { interactionType: 'fade', apply: false });
    } else {
        const layers = context.firebolt.context.layers();

        layers.forEach((layer) => {
            const layerName = layer.constructor.formalName();

            // Apply style only on the hovered layer
            if (layerName === 'area') {
                context.applyInteractionStyle(mergedEnter, { interactionType: 'fade', apply: true }, [layer]);
                context.applyInteractionStyle(exitSet, { interactionType: 'fade', apply: false }, [layer]);
            } else {
                context.applyInteractionStyle(exitSet, { interactionType: 'fade', apply: true }, [layer]);
                context.applyInteractionStyle(mergedEnter, { interactionType: 'fade', apply: false }, [layer]);
            }
        });
    }
};

const fadeOnBrushFn = (set, context, payload) => {
    const { formattedSet } = set;
    const {
        mergedEnter,
        mergedExit,
        exitSet,
        completeSet
    } = formattedSet;

    const interactionType = 'brushStroke';

    if (!mergedEnter.length && !mergedExit.length) {
        // context.applyInteractionStyle(completeSet, {}, 'fade', false);
        context.applyInteractionStyle(completeSet, { interactionType, apply: false });
    } else {
        const { dragEnd } = payload;
        context.applyInteractionStyle(exitSet, { interactionType, apply: false, dragEnd });
        context.applyInteractionStyle(mergedEnter, { interactionType, apply: true, dragEnd });
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
            context.applyInteractionStyle(completeSet, { interactionType: 'focus', apply: false });
            context.applyInteractionStyle(completeSet, { interactionType: 'focusStroke', apply: false });
        } else {
            context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: true });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: false });

            context.applyInteractionStyle(mergedExit, { interactionType: 'focusStroke', apply: false });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focusStroke', apply: true });
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
            context.applyInteractionStyle(completeSet, { interactionType: 'highlight', apply: false });
        } else {
            const layers = context.firebolt.context.layers();

            layers.forEach((layer) => {
                // get uids of only the currently highlighted point
                const actualPoint = payload.target ? layer.getUidsFromPayload(mergedEnter, payload.target) :
                    mergedEnter;
                // get uids of only the currently highlighted point excluding the excludeSet ids
                const currentHighlightedSet = getFormattedSet(actualPoint, excludeSetIds);

                context.applyInteractionStyle(currentHighlightedSet, { interactionType: 'highlight', apply: true }, [layer]);
                context.applyInteractionStyle(selectionSet.exitSet[1], { interactionType: 'highlight', apply: false }, [layer]);
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
            context.applyInteractionStyle(completeSet, { interactionType: 'focus', apply: false });
            context.applyInteractionStyle(completeSet, { interactionType: 'focusStroke', apply: false });
        } else {
            context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: false });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: true });

            context.applyInteractionStyle(mergedExit, { interactionType: 'focusStroke', apply: false });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focusStroke', apply: true });
        }
    }
};
