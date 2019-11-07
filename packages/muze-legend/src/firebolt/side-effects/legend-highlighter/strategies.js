import { selectElement } from 'muze-utils';

export const strategies = (firebolt) => {
    const context = firebolt.context;
    const classed = (set, className, change) => {
        const classPrefix = context.config().classPrefix;
        const uids = set.uids.map(d => d[0]);
        selectElement(context.mount())
                        .selectAll(`.${classPrefix}-legend-columns`)
                        .filter(d => uids.indexOf(d.id) !== -1)
                        .selectAll('div')
                        .classed(className, change);
    };

    return {
        fade: (set, config = {}) => {
            const classPrefix = context.config().classPrefix;
            if (!set.mergedEnter.length && !set.mergedExit.length) {
                classed(set.completeSet, config.className || `${classPrefix}-legend-fadeout`, false);
            } else {
                classed(set.mergedExit, config.className || `${classPrefix}-legend-brighten`, false);
                classed(set.mergedExit, config.className || `${classPrefix}-legend-fadeout`, true);
                classed(set.mergedEnter, config.className || `${classPrefix}-legend-fadeout`, false);
            }
        },
        brighten: (set, config = {}) => {
            const classPrefix = context.config().classPrefix;
            if (!set.mergedEnter.length && !set.mergedExit.length) {
                classed(set.completeSet, config.className || `${classPrefix}-legend-brighten`, false);
            } else {
                classed(set.mergedEnter, config.className || `${classPrefix}-legend-brighten`, true);
                classed(set.mergedExit, config.className || `${classPrefix}-legend-brighten`, false);
            }
        }
    };
};
