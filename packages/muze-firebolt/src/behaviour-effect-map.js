import * as BEHAVIOURS from './enums/behaviours';

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: ['selectionBox', {
        name: 'highlighter',
        strategy: 'fade'
    }],
    [BEHAVIOURS.HIGHLIGHT]: [{
        name: 'highlighter',
        strategy: 'highlight'
    }, 'crossline', 'tooltip', 'anchors'],
    [BEHAVIOURS.FILTER]: ['filter'],
    [BEHAVIOURS.SELECT]: [{
        name: 'highlighter',
        strategy: 'focus'
    }, 'persistent-anchors']
};
