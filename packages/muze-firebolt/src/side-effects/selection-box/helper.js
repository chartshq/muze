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
    const dragEnd = payload.dragEnd;
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
            const domain = xAxis.domain();
            const bandScale = xAxis.constructor.type() === 'band';
            let x1Val;
            let x2Val;
            if (bandScale) {
                let x1DomainIndex = domain.indexOf(xRange[0]);
                let x2DomainIndex = domain.indexOf(xRange[xRange.length - 1]);
                [x1DomainIndex, x2DomainIndex] = [x1DomainIndex, x2DomainIndex].sort();
                x1Val = domain[x1DomainIndex];
                x2Val = domain[x2DomainIndex];
            } else {
                x1Val = xRange[0];
                x2Val = xRange[xRange.length - 1];
            }

            x1 = xAxis.getScaleValue(x1Val);
            x2 = xAxis.getScaleValue(x2Val);
            x2 += bandScale ? xAxis.getUnitWidth() : 0;
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
            const domain = yAxis.domain();
            const bandScale = yAxis.constructor.type() === 'band';
            let y1Val;
            let y2Val;
            if (bandScale) {
                let y1DomainIndex = domain.indexOf(yRange[0]);
                let y2DomainIndex = domain.indexOf(yRange[yRange.length - 1]);
                [y1DomainIndex, y2DomainIndex] = [y1DomainIndex, y2DomainIndex].sort(((a, b) => b - a));
                y1Val = domain[y1DomainIndex];
                y2Val = domain[y2DomainIndex];
            }
            else {
                y1Val = yRange[0];
                y2Val = yRange[yRange.length - 1];
            }
            y1 = yAxis.getScaleValue(y1Val);
            y2 = yAxis.getScaleValue(y2Val);
            y2 += yAxis.constructor.type() === 'band' ? yAxis.getUnitWidth() : 0;
        }
    } else {
        y1 = y2 = undefined;
    }

    if (!dragEnd) {
        if (xDim) {
            [x1, x2] = xDim;
        }
        if (yDim) {
            [y1, y2] = yDim;
        }
    }
    return {
        dimension: {
            x1,
            x2,
            y1,
            y2
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
