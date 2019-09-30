import { DimensionSubtype, COORD_TYPES } from 'muze-utils';

const dragCriteriaRetriever = {
    [COORD_TYPES.CARTESIAN]: (context, sourceInfo, { startPos, endPos }) => {
        const fieldsConfig = context.data().getFieldsConfig();
        const axes = sourceInfo.axes;
        const xAxis = axes.x[0];
        const yAxis = axes.y[0];
        const axisFields = sourceInfo.fields;
        const xField = axisFields.x[0].getMembers()[0];
        const yField = axisFields.y[0].getMembers()[0];
        const xFieldType = fieldsConfig[xField].def.subtype;
        const yFieldType = fieldsConfig[yField].def.subtype;
        const dimensions = {};

        const isXDimension = xFieldType === DimensionSubtype.CATEGORICAL;
        const isYDimension = yFieldType === DimensionSubtype.CATEGORICAL;
        const xRange = xAxis.invertExtent(startPos.x, endPos.x);
        const yRange = yAxis.invertExtent(startPos.y, endPos.y);
        const selectedDomains = {
            x: isXDimension ? xRange : xRange.sort((a, b) => a - b),
            y: isYDimension ? yRange : yRange.sort((a, b) => a - b)
        };
        const rangeObj = {};

        if (selectedDomains.x) rangeObj[xField] = selectedDomains.x;
        if (selectedDomains.y) rangeObj[yField] = selectedDomains.y;

        if (xField === yField) {
            const xdom = selectedDomains.x;
            const ydom = selectedDomains.y;
            const min = xdom[0] > ydom[0] ? ydom : xdom;
            const max = min === ydom ? xdom : ydom;
            if (min[1] < max[0]) {
                rangeObj[xField] = [];
            } else {
                rangeObj[xField] = [max[0], min[1] < max[1] ? min[1] : max[1]];
            }
        }

        dimensions.x = [startPos.x, endPos.x];
        dimensions.y = [startPos.y, endPos.y];

        return {
            criteria: rangeObj,
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
/* istanbul ignore next */ const getDragActionConfig = (context, config) => {
    const sourceInfo = context.getSourceInfo();
    const { startPos, endPos } = config;
    const coordType = context.coord();

    if (startPos.x === endPos.x && startPos.y === endPos.y) {
        return {
            criteria: null
        };
    }

    return dragCriteriaRetriever[coordType](context, sourceInfo, config);
};

export default getDragActionConfig;
