import {
    FieldType,
    COORD_TYPES
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
        stroke: layerEncoding.stroke.value
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
        meta: getColorMetaInf(style, colorAxis),
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

// This is invoked only on point selection for applying a path around the point
const strokeInteractionStyle = (context, elem, apply, interactionType, style) => {
    const datum = elem.data()[0];
    const styleType = style.type;
    const { originalStrokeOnSelect, stateStrokeOnSelect } = datum.meta;
    stateStrokeOnSelect[interactionType] = stateStrokeOnSelect[interactionType] || {};

    if (apply && !stateStrokeOnSelect[interactionType][styleType]) {
        // apply
        stateStrokeOnSelect[interactionType][styleType] = style.props.value;
        context.addOverlayPath(elem.node().parentElement, elem.node(), datum, style);
    }
    if (!apply && stateStrokeOnSelect[interactionType][styleType]) {
        // remove
        stateStrokeOnSelect[interactionType][styleType] = originalStrokeOnSelect[styleType];
        context.removeOverlayPath(datum, originalStrokeOnSelect);
    }
    return true;
};

const highlightStrokeOnInteraction = (context, elem, apply, interactionType, style) => {
    const datum = elem.data()[0];
    const styleType = style.type;
    const { originalStrokeOnHighlight, stateStrokeOnHighlight } = datum.meta;
    stateStrokeOnHighlight[interactionType] = stateStrokeOnHighlight[interactionType] || {};

    if (apply && !stateStrokeOnHighlight[interactionType][styleType]) {
        // apply
        stateStrokeOnHighlight[interactionType][styleType] = style.props.value;
        context.addOverlayPath(elem.node().parentElement, elem.node(), datum, style);
    }
    if (!apply && stateStrokeOnHighlight[interactionType][styleType]) {
        // remove
        stateStrokeOnHighlight[interactionType][styleType] = originalStrokeOnHighlight[styleType];
        context.removeOverlayPath(datum, originalStrokeOnHighlight);
    }
    return true;
};

export const interactionStyleMap = {
    focusStroke: {
        stroke: (...params) => strokeInteractionStyle(...params),
        'stroke-width': (...params) => strokeInteractionStyle(...params)
    },
    highlight: {
        stroke: (...params) => highlightStrokeOnInteraction(...params),
        'stroke-width': (...params) => highlightStrokeOnInteraction(...params)
    }
};
