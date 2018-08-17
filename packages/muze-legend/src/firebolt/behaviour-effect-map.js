import * as BEHAVIOURS from '../enums/behaviours';
import * as sideEffects from '../enums/side-effects';

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: [sideEffects.SELECTIONBOX, {
        name: sideEffects.Highlighter,
        strategy: 'fade'
    }],
    [BEHAVIOURS.HIGHLIGHT]: [sideEffects.Highlighter],
    select: [{
        name: sideEffects.Highlighter,
        strategy: 'fade'
    }]
};

export const propagationSideEffects = {
    [BEHAVIOURS.BRUSH]: [{
        name: sideEffects.Highlighter,
        strategy: 'fade'
    }],
    [BEHAVIOURS.HIGHLIGHT]: [{
        name: sideEffects.Highlighter,
        strategy: 'fade'
    }]
};

