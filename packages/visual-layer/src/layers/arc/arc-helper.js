import { getObjProp, interpolator, FieldType, selectElement } from 'muze-utils';
import { ANGLE, RADIUS, SIZE, COLOR } from '../../enums/constants';

export const getPreviousPoint = (prevData, currIndex, context) => {
    const prevArc = prevData[currIndex - 1];
    const nextArc = prevData[currIndex];
    const [startAngle, endAngle] = context.axes().angle.range();
    if (prevArc && nextArc) {
        return {
            update: {
                angle0: getObjProp(prevArc, 'update', 'angle'),
                angle: getObjProp(nextArc, 'update', 'angle0')
            }
        };
    } else if (!nextArc) {
        return {
            update: {
                angle0: (endAngle - 90) * Math.PI * 2 / 360,
                angle: (endAngle - 90) * Math.PI * 2 / 360
            }
        };
    }
    return {
        update: {
            angle0: (startAngle - 90) * Math.PI * 2 / 360,
            angle: (startAngle - 90) * Math.PI * 2 / 360
        }
    };
};

export const tweenPie = (path, b) => {
    const datum = b[0];
    return function (t) {
        return path(interpolator()(datum._previousInfo, datum)(t));
    };
};

export const tweenExitPie = (consecutiveExits, transition, path) => {
    if (consecutiveExits.length > 0) {
        consecutiveExits.forEach((consecutiveExitArr) => {
            const startAngle = consecutiveExitArr[0].datum.update.angle0;
            const endAngle = consecutiveExitArr[consecutiveExitArr.length - 1].datum.update.angle;
            const mid = (Math.PI * 2 * startAngle) / ((Math.PI * 2) + startAngle - endAngle);

            consecutiveExitArr.forEach((e) => {
                const { elem, datum } = e;

                elem.each(function () {
                    const gElem = selectElement(this);
                    gElem.selectAll('path')
                                    .transition()
                                    .duration(transition.duration)
                                    .attrTween('d', () => function (t) {
                                        return path(interpolator()(datum, {
                                            update: {
                                                angle0: mid,
                                                angle: mid,
                                                radius: datum.radius,
                                                radius0: datum.radius0
                                            }
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
