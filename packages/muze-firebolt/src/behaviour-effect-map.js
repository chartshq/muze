import { intersect } from 'muze-utils';
import * as BEHAVIOURS from './enums/behaviours';
import * as SIDE_EFFECTS from './enums/side-effects';
import { unionSets } from './helper';

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: ['selectionBox', {
        name: 'highlighter',
        options: {
            strategy: 'fadeOnBrush'
        }
    }, 'brush-anchors'],
    [BEHAVIOURS.HIGHLIGHT]: [
        {
            name: 'highlighter',
            options: {
                strategy: 'highlight'
            }
        }, 'crossline', {
            name: 'tooltip',
            options: {
                setTransform: (selectionSet, payload, firebolt) => {
                    if (firebolt._actions.behavioural.brush.active === true) {
                        return null;
                    }
                    return selectionSet;
                }
            }
        }, 'anchors', {
            name: 'tooltip',
            options: {
                strategy: 'selectionSummary',
                setTransform: (selectionSet, payload, firebolt) => {
                    if (firebolt._actions.behavioural.brush.active === true) {
                        return null;
                    }
                    const selectEntrySet = firebolt.getEntryExitSet(BEHAVIOURS.SELECT);
                    const brushEntrySet = firebolt.getEntryExitSet(BEHAVIOURS.BRUSH);

                    if (selectEntrySet || brushEntrySet) {
                        const unionedSet = unionSets(firebolt, [BEHAVIOURS.SELECT, BEHAVIOURS.BRUSH]);
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
            name: SIDE_EFFECTS.AXIS_LABEL_HIGHLIGHTER
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
