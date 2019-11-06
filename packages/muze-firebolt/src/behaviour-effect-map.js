import * as BEHAVIOURS from './enums/behaviours';

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: ['selectionBox', {
        name: 'highlighter',
        options: {
            strategy: 'fade'
        }
    }, 'brush-anchors'],
    [`${BEHAVIOURS.BRUSH},${BEHAVIOURS.SELECT}`]: [{
        name: 'tooltip',
        options: {
            strategy: 'selectionSummary',
            order: 0,
            filter: context => context.config().mode === 'fragmented'
        }
    }],
    [BEHAVIOURS.HIGHLIGHT]: [{
        name: 'highlighter',
        options: {
            strategy: 'highlight',
            // behaviours for which the current strategy won't apply
            // accepts an array or fn
            excludeSet: [BEHAVIOURS.SELECT]
        }
    }, 'crossline', {
        name: 'tooltip',
        options: {
            order: 9999
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
