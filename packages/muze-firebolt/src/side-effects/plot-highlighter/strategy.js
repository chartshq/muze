import { getFormattedSet, highlightSelectIntersection } from './helper';

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

    const { dragEnd } = payload;
    let interactionType = 'brushStroke';

    if (!mergedEnter.length && !mergedExit.length) {
        context.applyInteractionStyle(completeSet, { interactionType, apply: false });
        context.applyInteractionStyle(completeSet, { interactionType: 'doubleStroke', apply: false });
    } else {
        if (dragEnd) {
            interactionType = 'doubleStroke';
            // onDrag style
            context.applyInteractionStyle(completeSet, { interactionType: 'brushStroke', apply: false });
            // Fade out points onDragEnd
            context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: true });
        }
        const layers = context.firebolt.context.layers();

        layers.forEach((layer) => {
            const layerName = layer.constructor.formalName();

            // Apply style only on the hovered layer
            if (layerName === 'area') {
                context.applyInteractionStyle(mergedEnter, { interactionType: 'fade', apply: true }, [layer]);
                context.applyInteractionStyle(exitSet, { interactionType: 'fade', apply: false }, [layer]);
            } else {
                // Fade the non-brushed points
                // context.applyInterwactionStyle(exitSet, { interactionType: 'focus', apply: true }, [layer]);
                // context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: false }, [layer]);

                // dragEnd style
                context.applyInteractionStyle(exitSet, { interactionType, apply: false }, [layer]);
                context.applyInteractionStyle(mergedEnter, { interactionType, apply: true }, [layer]);
            }
        });
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
            // Remove all highlight styles
            context.applyInteractionStyle(completeSet, { interactionType: 'highlight', apply: false });
            // Remove brushed points when clicked on empty chart area
            // context.applyInteractionStyle(completeSet, { interactionType: 'doubleStroke', apply: false, reset: true });
        } else {
            context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: true });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: false });

            context.applyInteractionStyle(mergedExit, { interactionType: 'focusStroke', apply: false });
            context.applyInteractionStyle(formattedSet.entrySet, { interactionType: 'focusStroke', apply: true });
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
            // context.applyInteractionStyle(completeSet, { interactionType: 'doubleStroke', apply: false, reset: true });
        } else {
            context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: false });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: true });

            context.applyInteractionStyle(mergedExit, { interactionType: 'focusStroke', apply: false });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focusStroke', apply: true });
        }
    },
    highlight: (set, context, payload, excludeSetIds) => {
        const { formattedSet } = set;
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = formattedSet;

        if (!mergedEnter.length && !mergedExit.length) {
            // Remove focusStroke on selected but currently non-highlighted set
            context.applyInteractionStyle(completeSet, { interactionType: 'highlight', apply: false });
            const selectEntrySet = context.firebolt.getEntryExitSet('select');
            if (selectEntrySet) {
                context.applyInteractionStyle(selectEntrySet.mergedEnter,
                    { interactionType: 'focusStroke', apply: false });
            }
        } else {
            const layers = context.firebolt.context.layers();

            layers.forEach((layer) => {
                if (payload.target) {
                    // get uids of only the currently highlighted point
                    const actualPoint = layer.getUidsFromPayload(mergedEnter, payload.target);
                    // get uids of only the currently highlighted point excluding the excludeSet ids
                    const currentHighlightedSet = getFormattedSet(actualPoint, excludeSetIds);

                    // Apply highlight on the currently hovered point
                    context.applyInteractionStyle(currentHighlightedSet,
                        { interactionType: 'highlight', apply: true },
                        [layer]
                    );

                    // Get a set of both highlighted and selected points
                    const commonSelectHighlightSet = highlightSelectIntersection(context.firebolt);
                    const mergedEnterSet = (commonSelectHighlightSet || {}).mergedEnter;

                    // Appy focusStroke on point both hovered and selected
                    if (mergedEnterSet && mergedEnter.length) {
                        const pointHoveredAndSelected = layer.getUidsFromPayload(
                            mergedEnterSet, payload.target
                        );
                        context.applyInteractionStyle(pointHoveredAndSelected,
                            { interactionType: 'focusStroke', apply: true },
                            [layer]
                        );
                    }
                }
            });
        }
    },
    pseudoFocus: (set, context) => {
        const { formattedSet } = set;
        const {
            mergedEnter
        } = formattedSet;

        context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: false });
    }
};
