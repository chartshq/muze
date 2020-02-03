import { COORD_TYPES } from 'muze-utils';

const dragCriteriaRetriever = {
    [COORD_TYPES.CARTESIAN]: (firebolt, sourceInfo, { startPos, endPos }) => {
        if (startPos.x === endPos.x && startPos.y === endPos.y) {
            return {
                criteria: null
            };
        }
        const ranges = firebolt.context.getRangeFromPositions({
            startPos,
            endPos
        });
        const dimensions = {};
        dimensions.x = [startPos.x, endPos.x];
        dimensions.y = [startPos.y, endPos.y];

        return {
            criteria: ranges,
            dimensions
        };
    },
    [COORD_TYPES.POLAR]: () => ({
        criteria: null
    })
};

/**
 * Gets the drag action configuration
 * @param {VisualUnit} instance instance of visual unit
 * @param {Object} config x y positions
 * @return {Object} Payload of behaviour
*/
/* istanbul ignore next */ const getDragActionConfig = (firebolt, config) => {
    const context = firebolt.context;
    const sourceInfo = context.getSourceInfo();
    const coordType = context.coord();
    return dragCriteriaRetriever[coordType](firebolt, sourceInfo, config);
};

export default getDragActionConfig;
