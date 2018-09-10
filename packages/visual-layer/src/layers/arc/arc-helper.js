import { getObjProp, interpolator, FieldType } from 'muze-utils';
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
export const getPreviousPoint = (prevData, currIndex) => {
    const prevArc = prevData[currIndex - 1];
    const nextArc = prevData[currIndex + 1];
    if (prevArc && nextArc) {
        return {
            startAngle: prevArc.endAngle,
            endAngle: nextArc.startAngle
        };
    } else if (!nextArc) {
        return {
            startAngle: Math.PI * 2,
            endAngle: Math.PI * 2
        };
    }
    return { startAngle: 0, endAngle: 0 };
};

/**
 *
 *
 * @param {*} path
 * @param {*} b
 * @returns
 * @memberof ArcLayer
 */
export const tweenPie = (path, b) => {
    const { datum } = b[0];
    return function (t) {
        return path(interpolator()(datum._previousInfo, datum)(t));
    };
};

/**
 *
 *
 * @param {*} path
 * @param {*} b
 * @returns
 * @memberof ArcLayer
 */
export const tweenExitPie = (path, b) => {
    const { datum } = b[0];
    const startAngle = datum.startAngle;
    const endAngle = datum.endAngle;
    // Using the alliteration principle, the major arc will animate more than the smaller arc
    const mid = (Math.PI * 2 * startAngle) / ((Math.PI * 2) + startAngle - endAngle);

    return function (t) {
        return path(interpolator()(datum, { startAngle: mid,
            endAngle: mid })(t));
    };
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
