import * as BEHAVIOURS from './enums/behaviours';

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: ['selectionBox', {
        name: 'highlighter',
        options: {
            strategy: 'fadeOnBrush'
        }
    }, 'brush-anchors'],
    [`${BEHAVIOURS.BRUSH},${BEHAVIOURS.SELECT}`]: [{
        name: 'tooltip',
        options: {
            strategy: 'selectionSummary',
            order: 1
        }
    }],
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
            order: 0
        }
    }, 'anchors'],
    [BEHAVIOURS.FILTER]: ['filter'],
    [BEHAVIOURS.SELECT]: [{
        name: 'highlighter',
        options: {
            strategy: 'focus'
        }
    }, 'persistent-anchors']
};
