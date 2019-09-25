import { DimensionSubtype, MeasureSubtype, COORD_TYPES } from 'muze-utils';

const dragCriteriaRetriever = {
    [COORD_TYPES.CARTESIAN]: (context, sourceInfo, { startPos, endPos, snap }) => {
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

        // x, y
        // const dragDim = xFieldType === MeasureSubtype.CONTINUOUS ? (yFieldType === MeasureSubtype.CONTINUOUS ?
        //     ['x', 'y'] : ['y']) : ['x'];
        // const dragDim = ['x', 'y'];
        // const criteria = {};
        const isXDimension = xFieldType === DimensionSubtype.CATEGORICAL;
        const isYDimension = yFieldType === DimensionSubtype.CATEGORICAL;
        const xRange = xAxis.invertExtent(startPos.x, endPos.x);
        const yRange = yAxis.invertExtent(startPos.y, endPos.y);
        // const selectedDomains = {
        //     x: startPos.x === endPos.x ? [] : (isXDimension ? xRange : xRange.sort((a, b) => a - b)),
        //     y: startPos.y === endPos.y ? [] : (isYDimension ? yRange : yRange.sort((a, b) => a - b))
        // };
        const selectedDomains = {
            x: isXDimension ? xRange : xRange.sort((a, b) => a - b),
            y: isYDimension ? yRange : yRange.sort((a, b) => a - b)
        };
        const rangeObj = {};

        rangeObj[xField] = selectedDomains.x;
        rangeObj[yField] = selectedDomains.y;
        console.log(snap);

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
            dimensions.x = [startPos.x, endPos.x];
            dimensions.y = [startPos.y, endPos.y];
        }

        // if (xFieldType === DimensionSubtype.CATEGORICAL) {
        //     dimensions.x = (snap && startPos.x !== endPos.x) ? xAxis.getNearestRange(startPos.x, endPos.x) :
        //                     [startPos.x, endPos.x];
        // }

        // else {
        //     criteria[dragDim[0]] = selectedDomains[dragDim[0]] || [];

        //     if (dragDim[0] === 'x') {
        //         rangeObj[xField] = criteria.x;
        //         if (xFieldType === DimensionSubtype.CATEGORICAL) {
        //             dimensions.x = (snap && startPos.x !== endPos.x) ? xAxis.getNearestRange(startPos.x, endPos.x) :
        //                 [startPos.x, endPos.x];
        //         }
        //     } else {
        //         rangeObj[yField] = criteria.y;
        //         if (yFieldType === DimensionSubtype.CATEGORICAL) {
        //             dimensions.y = (snap && startPos.y !== endPos.y) ? yAxis.getNearestRange(startPos.y, endPos.y) :
        //                 [startPos.y, endPos.y];
        //         }
        //     }
        // }

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
