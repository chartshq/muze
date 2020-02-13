import { intersect, difference } from 'muze-utils';
import { BEHAVIOURS } from '../..';

const fadeFn = (set, context) => {
    const {
        mergedEnter,
        mergedExit,
        completeSet
    } = set;

    if (!mergedEnter.length && !mergedExit.length) {
        context.applyInteractionStyle(completeSet, { interactionType: 'fade', apply: false });
    } else {
        const layers = context.firebolt.context.layers();

        layers.forEach((layer) => {
            const layerName = layer.constructor.formalName();

            // Apply style only on the hovered layer
            if (layerName === 'area') {
                context.applyInteractionStyle(mergedEnter, { interactionType: 'fade', apply: true }, [layer]);
                context.applyInteractionStyle(mergedExit, { interactionType: 'fade', apply: false }, [layer]);
            } else {
                context.applyInteractionStyle(mergedExit, { interactionType: 'fade', apply: true }, [layer]);
                context.applyInteractionStyle(mergedEnter, { interactionType: 'fade', apply: false }, [layer]);
            }
        });
    }
};

const fadeOnBrushFn = (set, context, payload) => {
    const {
        mergedEnter,
        mergedExit,
        completeSet
    } = set;

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
        }
        const layers = context.firebolt.context.layers();

        layers.forEach((layer) => {
            const layerName = layer.constructor.formalName();

            // Apply style only on the hovered layer
            if (layerName === 'area') {
                if (dragEnd) {
                    context.applyInteractionStyle(mergedExit, { interactionType: 'fade', apply: false }, [layer]);
                    mergedEnter.length &&
                        context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: true }, [layer]);
                }
            } else {
                // dragEnd style
                context.applyInteractionStyle(mergedExit, { interactionType, apply: false }, [layer]);
                if (!payload.dragEnd) {
                    context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: false }, [layer]);
                } else {
                    context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: true }, [layer]);
                }

                interactionType !== 'doubleStroke' &&
                    context.applyInteractionStyle(mergedExit, { interactionType: 'doubleStroke', apply: false });
                context.applyInteractionStyle(mergedEnter, { interactionType, apply: true }, [layer]);
            }
        });
    }
};

export const strategies = {
    fade: fadeFn,
    fadeOnBrush: fadeOnBrushFn,
    focus: (set, context) => {
        const {
            mergedEnter,
            mergedExit,
            completeSet
        } = set;
        const { firebolt } = context;

        if (!mergedEnter.length && !mergedExit.length) {
            context.applyInteractionStyle(completeSet, { interactionType: 'focus', apply: false });
            context.applyInteractionStyle(completeSet, { interactionType: 'focusStroke', apply: false });
            context.applyInteractionStyle(completeSet, { interactionType: 'commonDoubleStroke', apply: false });
        } else {
            context.applyInteractionStyle(mergedExit, { interactionType: 'focusStroke', apply: false });
            context.applyInteractionStyle(mergedEnter, { interactionType: 'focusStroke', apply: true });

            const payload = firebolt.getPayload(BEHAVIOURS.HIGHLIGHT) || {};
            const entryExitSet = firebolt.getEntryExitSet(BEHAVIOURS.HIGHLIGHT);
            const layers = firebolt.context.layers();

            layers.forEach((layer) => {
                const layerName = layer.constructor.formalName();

                if (layerName === 'area') {
                    context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: false }, [layer]);
                    context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: true }, [layer]);
                } else {
                    context.applyInteractionStyle(mergedExit, { interactionType: 'focus', apply: true }, [layer]);
                    context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: false }, [layer]);
                }

                if (payload.target !== null && entryExitSet) {
                    // get uids of only the currently highlighted point
                    const actualPoint = layer.getUidsFromPayload(entryExitSet.mergedEnter, payload.target);

                    const commonSet = intersect(mergedEnter.uids, actualPoint.uids,
                        [v => v[0], v => v[0]]);

                    if (commonSet.length) {
                        context.applyInteractionStyle({ uids: commonSet },
                                { interactionType: 'commonDoubleStroke', apply: true },
                                [layer]
                            );
                    } else {
                        context.applyInteractionStyle({ uids: mergedExit.uids },
                            { interactionType: 'commonDoubleStroke', apply: false },
                            [layer]
                        );
                    }
                }
            });
        }
    },
    highlight: (selectionSet, context, payload) => {
        if (!selectionSet.mergedEnter.length && !selectionSet.mergedExit.length) {
            // Remove focusStroke on selected but currently non-highlighted set
            context.applyInteractionStyle(selectionSet.completeSet, { interactionType: 'highlight', apply: false });
            context.applyInteractionStyle(selectionSet.completeSet,
                { interactionType: 'commonDoubleStroke', apply: false }
            );
        } else {
            const layers = context.firebolt.context.layers();

            layers.forEach((layer) => {
                if (payload.target !== null) {
                    // get uids of only the currently highlighted point
                    const currentHighlightedSet = layer.getUidsFromPayload(selectionSet.mergedEnter, payload.target);

                    // Apply highlight on the currently hovered point
                    context.applyInteractionStyle(currentHighlightedSet,
                        { interactionType: 'highlight', apply: true },
                        [layer]
                    );

                    context.applyInteractionStyle(selectionSet.mergedExit,
                        { interactionType: 'highlight', apply: false },
                        [layer]
                    );

                    const selectEntrySet = context.firebolt.getEntryExitSet('select');
                    if (selectEntrySet) {
                        const commonSet = intersect(selectEntrySet.mergedEnter.uids, currentHighlightedSet.uids,
                            [v => v[0], v => v[0]]);
                        const diffSet = difference(selectEntrySet.mergedEnter.uids, currentHighlightedSet.uids,
                            [v => v[0], v => v[0]]);

                        if (commonSet.length) {
                            context.applyInteractionStyle({ uids: commonSet },
                                { interactionType: 'commonDoubleStroke', apply: true },
                                [layer]
                            );
                        }
                        context.applyInteractionStyle({ uids: diffSet },
                            { interactionType: 'commonDoubleStroke', apply: false },
                            [layer]
                        );
                    }
                }
            });
        }
    },
    pseudoFocus: (set, context) => {
        const {
            mergedEnter
        } = set;

        context.applyInteractionStyle(mergedEnter, { interactionType: 'focus', apply: false });
    }
};
