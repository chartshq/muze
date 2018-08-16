import { BEHAVIOURS, ACTIONS } from 'muze-firebolt';

const CLASSPREFIX = 'muze';

export const actionBehaviourMap = {
    [ACTIONS.DRAG]: {
        target: `${CLASSPREFIX}-gradient-shape`,
        behaviours: [BEHAVIOURS.BRUSH]
    },
    [ACTIONS.HOVER]: {
        target: [`${CLASSPREFIX}-legend-columns`],
        behaviours: [BEHAVIOURS.HIGHLIGHT]
    },
    [ACTIONS.CLICK]: {
        target: [`${CLASSPREFIX}-legend-columns`],
        behaviours: [BEHAVIOURS.SELECT]
    }
};

export const propagationBehaviourMap = {
    [BEHAVIOURS.SELECT]: BEHAVIOURS.FILTER,
    [BEHAVIOURS.BRUSH]: BEHAVIOURS.HIGHLIGHT
};
