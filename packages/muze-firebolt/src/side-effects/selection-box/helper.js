import { selectElement } from 'muze-utils';

export const getBoxDimensionsFromPayload = (payload, axes, axisFields) => {
    let x1;
    let x2;
    let y1;
    let y2;
    let xRange;
    let yRange;
    const criteria = payload.criteria;
    const dimensions = payload.dimensions || {};
    const { x: xDim, y: yDim } = dimensions;

    if (!criteria) return null;

    if (axes.x && axes.y) {
        const xAxis = axes.x[0];
        const yAxis = axes.y[0];
        const xLinear = xAxis.constructor.type() === 'linear';
        const yLinear = yAxis.constructor.type() === 'linear';
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

        if (xRange && xRange.length) {
            const domain = xAxis.domain();
            const bandScale = xAxis.constructor.type() === 'band';
            let x1Val = xRange[0];
            let x2Val = xRange[xRange.length - 1];

            if (bandScale) {
                let x1DomainIndex = domain.indexOf(xRange[0]);
                let x2DomainIndex = domain.indexOf(xRange[xRange.length - 1]);
                [x1DomainIndex, x2DomainIndex] = [x1DomainIndex, x2DomainIndex].sort((a, b) => a - b);
                x1Val = domain[x1DomainIndex];
                x2Val = domain[x2DomainIndex];
            }

            x1 = xAxis.getScaleValue(x1Val);
            x2 = xAxis.getScaleValue(x2Val);
            x2 += bandScale ? xAxis.getUnitWidth() : 0;
        }

        if (yRange && yRange.length) {
            const domain = yAxis.domain();
            const bandScale = yAxis.constructor.type() === 'band';
            let y1Val = yRange[0];
            let y2Val = yRange[yRange.length - 1];

            if (bandScale) {
                let y1DomainIndex = domain.indexOf(yRange[0]);
                let y2DomainIndex = domain.indexOf(yRange[yRange.length - 1]);
                [y1DomainIndex, y2DomainIndex] = [y1DomainIndex, y2DomainIndex].sort(((a, b) => b - a));
                y1Val = domain[y1DomainIndex];
                y2Val = domain[y2DomainIndex];
            }

            y1 = yAxis.getScaleValue(y1Val);
            y2 = yAxis.getScaleValue(y2Val);
            y2 += yAxis.constructor.type() === 'band' ? yAxis.getUnitWidth() : 0;
        }

        if ((yLinear && xLinear) || !payload.dragEnd) {
            if (xDim) {
                [x1, x2] = xDim;
            }
            if (yDim) {
                [y1, y2] = yDim;
            }
        }
    }

    return {
        dimension: {
            x1,
            x2,
            y1,
            y2
        },
        direction: 'both'
    };
};

export const changeVisibility = (context, sideEffectGroup, visible) => {
    const config = context.config();
    const className = config.defClassName;
    const classPrefix = config.classPrefix;
    selectElement(sideEffectGroup).selectAll(`.${classPrefix}-${className}`)
                    .style('display', visible ? 'block' : 'none');
};
