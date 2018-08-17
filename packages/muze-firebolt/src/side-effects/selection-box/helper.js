import { selectElement } from 'muze-utils';

export const getBoxDimensionsFromPayload = (payload, sourceInf) => {
    let x1;
    let x2;
    let y1;
    let y2;
    let xRange;
    let yRange;
    let direction;
    const criteria = payload.criteria;
    const axes = sourceInf.axes;
    const axisFields = sourceInf.fields;
    const dimensions = payload.dimensions || {};
    const xDim = dimensions.x;
    const yDim = dimensions.y;

    if (criteria === null) {
        return null;
    }

    const xAxis = axes.x[0];
    const yAxis = axes.y[0];
    const xField = `${axisFields.x[0]}`;
    const yField = `${axisFields.y[0]}`;
    const xCriteria = criteria[xField];
    const yCriteria = criteria[yField];

    if (xCriteria && xCriteria[0] instanceof Array) {
        xRange = xCriteria[0];
        yRange = xCriteria[1];
    } else {
        xRange = xCriteria || [];
        yRange = yCriteria || [];
    }
    direction = xCriteria && yCriteria ? 'both' : (xCriteria ? 'vertical' : 'horizontal');
    if (xRange && xRange.length) {
        if ((yAxis.constructor.type() === 'band' && xAxis.constructor.type() === 'linear')) {
            x1 = x2 = undefined;
            direction = 'horizontal';
        } else {
            x1 = xAxis.getScaleValue(xRange[0]);
            x2 = xAxis.getScaleValue(xRange[xRange.length - 1]);
            x2 += xAxis.constructor.type() === 'band' ? xAxis.getUnitWidth() : 0;
        }
    } else {
        x1 = x2 = undefined;
    }
    if (yRange && yRange.length) {
        if ((xAxis.constructor.type() === 'band' && yAxis.constructor.type() === 'linear')) {
            y1 = y2 = undefined;
            direction = 'vertical';
        }
        else {
            y1 = yAxis.getScaleValue(yRange[0]);
            y2 = yAxis.getScaleValue(yRange[yRange.length - 1]);
            y2 += yAxis.constructor.type() === 'band' ? yAxis.getUnitWidth() : 0;
        }
    } else {
        y1 = y2 = undefined;
    }

    return {
        dimension: {
            x1: xDim ? xDim[0] : x1,
            x2: xDim ? xDim[1] : x2,
            y1: yDim ? yDim[0] : y1,
            y2: yDim ? yDim[1] : y2
        },
        direction
    };
};

export const changeVisibility = (context, sideEffectGroup, visible) => {
    const config = context.config();
    const className = config.defClassName;
    const classPrefix = config.classPrefix;
    selectElement(sideEffectGroup).selectAll(`.${classPrefix}-${className}`)
                    .style('display', visible ? 'block' : 'none');
};
