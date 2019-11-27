import { partition } from 'muze-utils';

const getLastItemInMap = map => Array.from(map)[map.size - 1];

const getPreviousStyle = (meta, interactionType) => {
    const { originalStyle, currentState } = meta;
    let stylesForCurrentLevel = Object.assign({}, originalStyle);

    if (currentState.size > 0) {
        interactionType = getLastItemInMap(currentState)[0];
        stylesForCurrentLevel = currentState.get(interactionType) || {};
        // const elemFill = elem.style('fill');
        // const newStyle = Object.assign({}, stylesForCurrentLevel, { fill: elemFill });
    }
    return stylesForCurrentLevel;
};

const strokeProps = {
    'stroke-width': 1,
    stroke: 1,
    'stroke-opacity': 1
};

const parseStyle = (value, { datum, datumStyle }, apply) => {
    if (typeof value === 'function') {
        if (isNaN(datumStyle)) {
            // const colorType = detectColor(datumStyle);
            const rgbaValues = datumStyle.replace(/[^\d,.]/g, '').split(',').map(s => Number(s));
            value = value(rgbaValues, datum, apply);
        } else {
            const numValue = parseFloat(datumStyle, 10);
            value = value(numValue, datum, apply);
        }
        return value;
    }
    return value;
};

export const applyStylesOnInteraction = (context, elem, interactionType, conf, options) => {
    const { mountPoint, apply, reset } = options;

    const d = elem.data()[0];
    let datum;

    if (Array.isArray(d)) {
        datum = d[0];
    } else {
        datum = Array.isArray(d.data) ? d.data[0] : d;
    }
    const { currentState, originalStyle } = datum.meta;

    let applicableStyles = {};

    const { style: styles, strokePosition } = conf;
    let applicableStrokePos = strokePosition;

    if (reset) {
        currentState.clear();
    }

    let applyStyle = true;

    if (apply) {
        const sanitizedStyles = {
            styles: {},
            strokePosition
        };
        for (const type in styles) {
            const parsedStyleVal = parseStyle(styles[type], {
                datum,
                datumStyle: elem.style(type)
            }, apply);

            sanitizedStyles.styles[type] = parsedStyleVal;
        }
        currentState.set(interactionType, sanitizedStyles);
        applicableStyles = sanitizedStyles.styles;
    } else if (!currentState.has(interactionType) && !reset) {
        applyStyle = false;
    } else {
        currentState.delete(interactionType);
        const currentStyle = getPreviousStyle(datum.meta, interactionType);
        applicableStyles = Object.assign({}, originalStyle.styles, currentStyle.styles);
        applicableStrokePos = currentStyle.strokePosition || originalStyle.strokePosition;
    }

    const styleKeys = Object.keys(applicableStyles);
    const [strokeStyles, otherStyles] = partition(styleKeys, v => v in strokeProps);

    applyStyle && context.applyStyles({
        strokeStyles,
        otherStyles,
        styleObj: applicableStyles,
        elem,
        datum,
        applicableStrokePos,
        mountPoint
    });
};
