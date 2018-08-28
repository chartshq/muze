import { BEHAVIOURS, ACTIONS } from '@chartshq/muze-firebolt';

const CLASSPREFIX = 'muze';

export const actionBehaviourMap = {
    [ACTIONS.DRAG]: {
        target: `.${CLASSPREFIX}-gradient-rect`,
        behaviours: [BEHAVIOURS.BRUSH]
    },
    [ACTIONS.HOVER]: {
        target: [`.${CLASSPREFIX}-legend-columns`],
        behaviours: [BEHAVIOURS.HIGHLIGHT]
    },
    [ACTIONS.CLICK]: {
        target: [`.${CLASSPREFIX}-legend-columns`],
        behaviours: [BEHAVIOURS.SELECT]
    }
};

export const propagationBehaviourMap = {
    [BEHAVIOURS.SELECT]: BEHAVIOURS.FILTER,
    [BEHAVIOURS.BRUSH]: BEHAVIOURS.HIGHLIGHT
};
