import { intersect } from 'muze-utils';
import * as BEHAVIOURS from './enums/behaviours';
import * as SIDE_EFFECTS from './enums/side-effects';
import { unionSets } from './helper';

const nullDataTooltipMap = {
    area: true,
    arc: false,
    line: true,
    text: false,
    point: false,
    bar: false,
    tick: false
};

const applySideEffectOnEmptyTarget = (sideEffect, { target }) => {
    const layers = sideEffect.layers();
    const showTooltipOnEmptyTarget = layers.some((l) => {
        const layerName = l.constructor.formalName();
        return nullDataTooltipMap[layerName];
    });
    return showTooltipOnEmptyTarget || target;
};

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: ['selectionBox', {
        name: 'highlighter',
        options: {
            strategy: 'fadeOnBrush'
        }
    }, 'brush-anchors'],
    [BEHAVIOURS.HIGHLIGHT]: [{
        name: 'highlighter',
        options: {
            strategy: 'highlight',
            // behaviours for which the current strategy won't apply
            // accepts an array or fn
            excludeSet: [BEHAVIOURS.SELECT, BEHAVIOURS.BRUSH]
        }
    }, 'crossline', {
        name: 'tooltip',
        options: {
            setTransform: (selectionSet, payload, sideEffect) => {
                if (sideEffect.firebolt._actions.behavioural.brush.active) {
                    return null;
                }
                if (applySideEffectOnEmptyTarget(sideEffect, payload)) {
                    return selectionSet;
                }
                return null;
            }
        }
    }, 'anchors', {
        name: 'tooltip',
        options: {
            strategy: 'selectionSummary',
            setTransform: (selectionSet, payload, sideEffect) => {
                if (sideEffect.firebolt._actions.behavioural.brush.active === true) {
                    return null;
                }
                const selectEntrySet = sideEffect.firebolt.getEntryExitSet(BEHAVIOURS.SELECT);
                const brushEntrySet = sideEffect.firebolt.getEntryExitSet(BEHAVIOURS.BRUSH);
                if (selectEntrySet || brushEntrySet) {
                    const unionedSet = unionSets(sideEffect.firebolt, [BEHAVIOURS.SELECT, BEHAVIOURS.BRUSH]);
                    const { uids } = unionedSet.mergedEnter;
                    const { uids: highlightUids } = selectionSet.mergedEnter;

                    if (intersect(uids, highlightUids, [id => id[0], id => id[0]]).length) {
                        return unionedSet;
                    }
                }

                return null;
            }
        }
    }, {
        name: SIDE_EFFECTS.AXIS_LABEL_HIGHLIGHTER,
        options: {
            setTransform: (selectionSet, payload, sideEffect) => {
                if (sideEffect.firebolt._actions.behavioural.brush.active) {
                    return null;
                }
                if (applySideEffectOnEmptyTarget(sideEffect, payload)) {
                    return selectionSet;
                }
                return null;
            }
        }
    }],
    [BEHAVIOURS.FILTER]: ['filter'],
    [BEHAVIOURS.SELECT]: [{
        name: 'highlighter',
        options: {
            strategy: 'focus'
        }
    }, 'persistent-anchors', {
        name: 'tooltip',
        options: {
            strategy: 'selectionSummary'
        }
    }],
    pseudoSelect: [{
        name: 'highlighter',
        options: {
            strategy: 'pseudoFocus'
        }
    }]
};
