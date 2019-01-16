import { TOP, BOTTOM, LEFT, TITLE, SUB_TITLE, GROUP, LAYOUT, LEGEND } from '../constants';

/**
 *
 *
 * @param {*} context
 *
 */
export const arrangeComponents = (context) => {
    const legendConfig = context.config().legend;
    const titleConfig = context.title()[1];
    const subtitleConfig = context.subtitle()[1];
    const titleLayouts = {
        [`${TOP}-${TOP}`]: [TITLE, SUB_TITLE, GROUP],
        [`${BOTTOM}-${BOTTOM}`]: [GROUP, SUB_TITLE, TITLE],
        [`${TOP}-${BOTTOM}`]: [TITLE, GROUP, SUB_TITLE],
        [`${BOTTOM}-${TOP}`]: [SUB_TITLE, GROUP, TITLE]
    };
    const legendLayouts = [
        [LEGEND, LAYOUT],
        [LAYOUT, LEGEND]
    ];
    const titlePosition = titleConfig.position || TOP;
    const subtitlePosition = subtitleConfig.position || TOP;

    return {
        headers: titleLayouts[`${titlePosition}-${subtitlePosition}`],
        legends: legendConfig.position === LEFT || legendConfig.position === TOP ?
        legendLayouts[0] : legendLayouts[1]
    };
};
