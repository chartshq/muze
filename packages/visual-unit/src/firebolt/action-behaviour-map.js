import { BEHAVIOURS, ACTIONS } from '@chartshq/muze-firebolt';

export const actionBehaviourMap = {
    [ACTIONS.DRAG]: {
        behaviours: [BEHAVIOURS.BRUSH],
        touch: false
    },
    [ACTIONS.HOVER]: {
        behaviours: [BEHAVIOURS.HIGHLIGHT]
    },
    [ACTIONS.LONGTOUCH]: {
        behaviours: [BEHAVIOURS.SELECT],
        touch: true
    },
    [ACTIONS.TOUCHDRAG]: {
        behaviours: [BEHAVIOURS.BRUSH],
        touch: true
    },
    [ACTIONS.CLICK]: {
        behaviours: [BEHAVIOURS.SELECT],
        touch: false
    }
};
