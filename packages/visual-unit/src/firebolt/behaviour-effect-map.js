import * as BEHAVIOURS from '../enums/behaviours';
import * as sideEffects from '../enums/side-effects';

export const behaviourEffectMap = {
    [BEHAVIOURS.BRUSH]: [sideEffects.SELECTIONBOX, {
        name: sideEffects.Highlighter,
        options: {
            strategy: 'fade'
        }
    }],
    [BEHAVIOURS.SELECT]: [{
        name: sideEffects.Highlighter,
        options: {
            strategy: 'fade'
        }
    }]
};

export const propagationSideEffects = {
    [BEHAVIOURS.BRUSH]: [{
        name: sideEffects.Highlighter,
        options: {
            strategy: 'fade'
        }
    }],
    [BEHAVIOURS.HIGHLIGHT]: [{
        name: sideEffects.Highlighter,
        options: {
            strategy: 'fade'
        }
    }],
    [BEHAVIOURS.SELECT]: ['filter']
};

