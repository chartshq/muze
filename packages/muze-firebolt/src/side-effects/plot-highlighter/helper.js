import { difference, intersect } from 'muze-utils';

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
