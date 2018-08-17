import { DimensionSubtype, FieldType } from 'muze-utils';
/**
 * Gets the drag action configuration
 * @param {VisualUnit} instance instance of visual unit
 * @param {Object} config x y positions
 * @return {Object} Payload of behaviour
*/
/* istanbul ignore next */ const getDragActionConfig = (sourceInfo, config, fieldsConfig) => {
    if (!(sourceInfo.axes.x || sourceInfo.axes.y)) {
        return {
            criteria: null
        };
    }

    const axes = sourceInfo.axes;
    const xAxis = axes.x[0];
    const yAxis = axes.y[0];
    const axisFields = sourceInfo.fields;
    const xField = axisFields.x[0].getMembers()[0];
    const yField = axisFields.y[0].getMembers()[0];
    const xFieldType = fieldsConfig[xField].def.subtype ? fieldsConfig[xField].def.subtype :
        fieldsConfig[xField].def.type;
    const yFieldType = fieldsConfig[yField].def.subtype ? fieldsConfig[yField].def.subtype :
            fieldsConfig[yField].def.type;
    const dimensions = {};
    const stPos = config.startPos;
    const endPos = config.endPos;

    if (stPos.x === endPos.x && stPos.y === endPos.y) {
        return {
            criteria: null,
            interpolated: true
        };
    }

    const dragDim = xFieldType === FieldType.MEASURE ? (yFieldType === FieldType.MEASURE ? ['x', 'y'] : ['y']) : ['x'];
    const criteria = {};
    const isXDimension = xFieldType === DimensionSubtype.CATEGORICAL;
    const isYDimension = yFieldType === DimensionSubtype.CATEGORICAL;
    const xRange = xAxis.constructor.type() === 'band' ? xAxis.scale().invertExtent(stPos.x, endPos.x) :
        xAxis.invert(stPos.x, endPos.x);
    const yRange = yAxis.constructor.type() === 'band' ? yAxis.scale().invertExtent(stPos.y, endPos.y) :
        yAxis.invert(stPos.y, endPos.y);
    const selectedDomains = {
        x: stPos.x === endPos.x ? [] : (isXDimension ? xRange : xRange.sort((a, b) => a - b)),
        y: stPos.y === endPos.y ? [] : (isYDimension ? yRange : yRange.sort((a, b) => a - b))
    };
    const rangeObj = {};

    if (dragDim.length === 2) {
        rangeObj[xField] = selectedDomains.x;
        rangeObj[yField] = selectedDomains.y;
        if (xField === yField) {
            const xdom = selectedDomains.x;
            const ydom = selectedDomains.y;

            if ((Math.abs(xdom[1] - xdom[0])) < (Math.abs(ydom[1] - ydom[0]))) {
                rangeObj[xField] = xdom;
            } else {
                rangeObj[yField] = ydom;
            }
            dimensions.x = [stPos.x, endPos.x];
            dimensions.y = [stPos.y, endPos.y];
        }
    } else {
        criteria[dragDim[0]] = selectedDomains[dragDim[0]] || [];

        if (dragDim[0] === 'x') {
            rangeObj[xField] = criteria.x;
            if (xFieldType === DimensionSubtype.CATEGORICAL) {
                dimensions.x = (config.snap && stPos.x !== endPos.x) ? xAxis.getNearestRange(stPos.x, endPos.x) :
                    [stPos.x, endPos.x];
            }
        } else {
            rangeObj[yField] = criteria.y;
            if (yFieldType === DimensionSubtype.CATEGORICAL) {
                dimensions.y = (config.snap && stPos.y !== endPos.y) ? yAxis.getNearestRange(stPos.y, endPos.y) :
                    [stPos.y, endPos.y];
            }
        }
    }

    return {
        criteria: rangeObj,
        dimensions,
        interpolated: true
    };
};

export default getDragActionConfig;
