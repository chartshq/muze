import {
    FieldType,
    COORD_TYPES,
    transformToHex
} from 'muze-utils';
import { ENCODING } from '../../enums/constants';
import {
    getIndividualClassName,
    resolveEncodingValues,
    getColorMetaInf,
    positionPoints
} from '../../helpers';

export const prepareDrawingInf = ({ data, datum, i, layerInst, xPx, yPx }) => {
    const axes = layerInst.axes();
    const { shape: shapeAxis, color: colorAxis, size: sizeAxis } = axes;
    let shape = shapeAxis.getShape(datum.shape);
    let size = sizeAxis.getSize(datum.size);
    let color = colorAxis.getColor(datum.color);
    const resolvedEncodings = resolveEncodingValues({
        values: {
            x: xPx,
            y: yPx,
            color,
            size,
            shape,
            data: datum
        },
        data: datum
    }, i, data, layerInst);
    const layerEncoding = layerInst.config().encoding;
    const { rowId, source } = datum;
    ({ shape, size, color } = resolvedEncodings);
    const style = {
        fill: color,
        stroke: layerEncoding.stroke.value,
        'stroke-width': layerEncoding['stroke-width'].value
    };
    const { x, y } = resolvedEncodings;
    const pos = { x, y };
    return {
        enter: pos,
        update: pos,
        shape,
        source,
        rowId,
        style,
        meta: getColorMetaInf(style),
        size
    };
};

export const pointTranslators = {
    [COORD_TYPES.CARTESIAN]: (data, config, layerInst) => {
        let points = [];
        const encoding = layerInst.config().encoding;
        const axes = layerInst.axes();
        const { x, y } = encoding;
        const xField = x.field;
        const yField = y.field;
        const fieldsConfig = layerInst.data().getFieldsConfig();
        const isXDim = fieldsConfig[xField] && fieldsConfig[xField].def.type === FieldType.DIMENSION;
        const isYDim = fieldsConfig[yField] && fieldsConfig[yField].def.type === FieldType.DIMENSION;
        const key = isXDim ? ENCODING.X : (isYDim ? ENCODING.Y : null);
        const measurement = layerInst.measurement();
        const { x: offsetX, y: offsetY } = config.offset;

        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];

            let [xPx, yPx] = [ENCODING.X, ENCODING.Y].map((type) => {
                const value = d[type] === null ? undefined : d[type];
                const measure = type === ENCODING.X ? measurement.width : measurement.height;
                return !encoding[type].field ? measure / 2 : axes[type].getScaleValue(value);
            });

            xPx += offsetX;
            yPx += offsetY;
            if (!isNaN(xPx) && !isNaN(yPx)) {
                const point = prepareDrawingInf({
                    data,
                    datum: d,
                    i,
                    layerInst,
                    xPx,
                    yPx
                });
                point.className = getIndividualClassName(d, i, data, layerInst);
                points.push(point);
                layerInst.cachePoint(d[key], point);
            }
        }
        points = positionPoints(layerInst, points);
        return points;
    }
};

export const getStrokeWidthByPosition = (position, radius) => {
    const strokeWidthWithOffsetMap = {
        center: -radius,
        inside: -(radius * Math.PI),
        outside: +(radius * Math.PI)
    };
    return strokeWidthWithOffsetMap[position];
};

const getPreviousStyle = (meta, styleType) => {
    const { originalStyle, currentState, interactionOrder } = meta;

    if (interactionOrder.length) {
        const type = interactionOrder[interactionOrder.length - 1];
        return currentState[type][styleType];
    }
    return originalStyle[styleType];
};

export const interactionFn = (context, elem, apply, interactionType, styleValue, styleType) => {
    const datum = elem.data()[0];
    const datumStyle = elem.style(styleType);
    const interactions = context.config().interaction;
    const { originalStyle, currentState, interactionOrder } = datum.meta;

    currentState[interactionType] = currentState[interactionType] || {};

    // Get evaluated value if styleVal is a fn
    if (typeof styleValue === 'function') {
        styleValue = styleValue(transformToHex(datumStyle), datum, apply);
    }

    elem.style(styleType, () => {
        if (apply && !currentState[interactionType][styleType]) {
            // apply interaction styles
            currentState[interactionType][styleType] = styleValue;

            // Add to last evaluated style list
            if (!interactionOrder.includes(interactionType)) {
                interactionOrder.push(interactionType);
            }

            // Add/style path border
            context.addOverlayPath(
                elem.node(),
                datum,
                { type: styleType, value: styleValue },
                interactionType
            );

            // Add className to group
            elem.classed(interactions[interactionType].className || '', true);
            return styleValue;
        } else if (!apply && currentState[interactionType][styleType]) {
            // remove interaction styles
            if (interactionOrder.includes(interactionType)) {
                interactionOrder.pop();
                delete currentState[interactionType];
            }

            if (interactionOrder.length > 0) {
                interactionType = interactionOrder[interactionOrder.length - 1];
            }

            const previousInteractionStyle = getPreviousStyle(datum.meta, styleType);
            currentState[interactionType] = currentState[interactionType] || {};
            currentState[interactionType][styleType] = previousInteractionStyle;

            context.removeOverlayPath(datum, currentState[interactionType]);

            elem.classed(interactions[interactionType].className || '', false);
            return currentState[interactionType][styleType];
        }

        const styleVal = currentState[interactionType][styleType] ?
            currentState[interactionType][styleType] :
            originalStyle[styleType];
        return styleVal;
    });

    return true;
};
