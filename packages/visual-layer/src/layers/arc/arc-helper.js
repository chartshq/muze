import { getObjProp, interpolator, FieldType, selectElement } from 'muze-utils';
import { ANGLE, RADIUS, SIZE, COLOR } from '../../enums/constants';

/**
 * Returns the range value from a value inside the domain
 *
 * @param {Object} domainValue Value whose range has to be returned
 * @return {number} range value
 * @memberof ArcLayer
 */
export const getRangeValue = (datum, range, domain, defaultRadius, sizeAxis) => {
    let domainMultiplier = 1;
    const {
        outerRadiusValue,
        sizeVal
    } = datum;
    const sizeAxisDomain = sizeAxis.domain();
    const sizeMultiplier = sizeAxis.getSize(sizeVal) / (sizeAxisDomain ? sizeAxis.range()[1] : sizeAxis.config().value);

    domainMultiplier *= (range[1] - range[0]) / (domain[1] - domain[0]);
    const rangeVal = (range[0] + (outerRadiusValue - domain[0]) * domainMultiplier);
    return (rangeVal || defaultRadius) * sizeMultiplier;
};

/**
 *
 *
 * @memberof ArcLayer
 */
export const getRadiusRange = (width, height, config) => {
    const {
        minOuterRadius,
        innerRadius,
        outerRadius,
        innerRadiusFixer
    } = config;

    return [Math.max((innerRadius + innerRadiusFixer || 0), minOuterRadius), outerRadius || Math.min(height,
        width) / 2];
};
export const getPreviousPoint = (prevData, currIndex, config) => {
    const prevArc = prevData[currIndex - 1];
    const nextArc = prevData[currIndex];

    if (prevArc && nextArc) {
        return {
            startAngle: prevArc.endAngle,
            endAngle: nextArc.startAngle
        };
    } else if (!nextArc) {
        return {
            startAngle: config.endAngle * Math.PI * 2 / 360,
            endAngle: config.endAngle * Math.PI * 2 / 360
        };
    }
    return {
        startAngle: config.startAngle * Math.PI * 2 / 360,
        endAngle: config.startAngle * Math.PI * 2 / 360
    };
};

/**
 *
 *
 * @param {*} path
 * @param {*} b
 *
 * @memberof ArcLayer
 */
export const tweenPie = (path, rangeValueGetter, b) => {
    const { datum } = b[0];
    const outerRadius = rangeValueGetter(datum);
    datum.outerRadius = outerRadius;
    datum._previousInfo.outerRadius = datum._previousInfo.outerRadius || outerRadius;
    return function (t) {
        return path(interpolator()(datum._previousInfo, datum)(t));
    };
};

/**
 *
 *
 * @param {*} path
 * @param {*} b
 *
 * @memberof ArcLayer
 */
export const tweenExitPie = (consecutiveExits, transition, rangeValueGetter, path) => {
    if (consecutiveExits.length > 0) {
        consecutiveExits.forEach((consecutiveExitArr) => {
            const startAngle = consecutiveExitArr[0].datum.startAngle;
            const endAngle = consecutiveExitArr[consecutiveExitArr.length - 1].datum.endAngle;
            const mid = (Math.PI * 2 * startAngle) / ((Math.PI * 2) + startAngle - endAngle);

            consecutiveExitArr.forEach((e) => {
                const { elem, datum } = e;

                elem.each(function () {
                    const gElem = selectElement(this);
                    gElem.selectAll('path')
                                    .transition()
                                    .duration(transition.duration)
                                    .attrTween('d', () => function (t) {
                                        const outerRadius = rangeValueGetter(datum);
                                        datum.outerRadius = outerRadius;
                                        return path(interpolator()(datum, {
                                            startAngle: mid,
                                            endAngle: mid,
                                            outerRadius
                                        })(t));
                                    })
                                    .remove();
                    gElem.remove();
                });
            });
        });
    }
};

export const getFieldIndices = (encoding, fieldsConfig) => {
    const [angleField, radiusField, colorField, sizeField] = [ANGLE, RADIUS, COLOR, SIZE]
            .map(e => encoding[e].field);
    const [angleIndex, sizeIndex, radiusIndex] = [angleField, sizeField, radiusField]
        .map((e) => {
            const conf = fieldsConfig[e];
            if (conf && conf.def.type === FieldType.MEASURE) {
                return conf.index;
            }
            return null;
        });
    const colorIndex = getObjProp(fieldsConfig, colorField, 'index');
    return {
        angleIndex,
        sizeIndex,
        radiusIndex,
        colorIndex
    };
};
