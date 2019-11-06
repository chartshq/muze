import { getArrayDiff } from 'muze-utils';

/**
 * @private
 * @param {Object} set Points set
 * @param {Array.<number>} selectedPointsId array of id of selected points
 * @return {Object} Returns the set with the selected points removed
 */
export const getFormattedSet = (set, selectedPointsId) => {
    const formattedSet = getArrayDiff(set.uids, selectedPointsId);
    return {
        ...set,
        ...{
            uids: formattedSet,
            length: formattedSet.length
        }
    };
};
