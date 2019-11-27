import { difference, intersect } from 'muze-utils';
import { unionSets } from '../../helper';

/**
 * @private
 * @param {Object} set Points set
 * @param {Array.<number>} selectedPointsId array of id of selected points
 * @return {Object} Returns the set with the selected points removed
 */
export const getFormattedSet = (set, selectedPointsId, intersection = false) => {
    const fn = intersection ? intersect : difference;
    const formattedSet = fn(set.uids, selectedPointsId,
        [d => d[0], d => d[0]]);
    return {
        ...set,
        ...{
            uids: formattedSet,
            length: formattedSet.length
        }
    };
};

export const highlightSelectIntersection = (firebolt, selectionSet) => {
    const selectEntrySet = firebolt.getEntryExitSet('select');
    const highlightEntrySet = firebolt.getEntryExitSet('highlight');

    if (selectEntrySet || highlightEntrySet) {
        const unionedSet = unionSets(firebolt, ['select', 'highlight']);
        const { uids } = unionedSet.mergedEnter;
        const { uids: highlightUids } = selectionSet.mergedEnter;

        if (intersect(uids, highlightUids, [id => id[0], id => id[0]]).length) {
            return unionedSet;
        }
    }

    return null;
};
