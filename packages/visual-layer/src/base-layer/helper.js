import {
    transformToHex,
    detectColor
} from 'muze-utils';

const getLastItemInMap = map => Array.from(map)[map.size - 1];

const getPreviousStyle = (meta, interactionType) => {
    const { originalStyle, currentState } = meta;
    let stylesForCurrentLevel = originalStyle;

    if (currentState.size > 0) {
        interactionType = getLastItemInMap(currentState)[0];
        stylesForCurrentLevel = currentState.get(interactionType) || {};
    }
    return stylesForCurrentLevel;
};

export const interactionFn = (context, elem, apply, interactionType, styleValue, styleType) => {
    let datum = elem.data()[0];
    const datumStyle = elem.style(styleType);
    const interactions = context.config().interaction;
    const className = interactions[interactionType].className || '';

    // Get evaluated value if styleValue is a fn
    if (typeof styleValue === 'function') {
        if (isNaN(datumStyle)) {
            const colorType = detectColor(datumStyle);
            const colorHexCode = transformToHex(datumStyle, colorType);
            let sanitizedVal = datumStyle;

            if (colorHexCode) {
                sanitizedVal = colorHexCode;
            }
            styleValue = styleValue(sanitizedVal, datum, apply);
        } else {
            const numValue = parseInt(datumStyle, 10);
            styleValue = styleValue(numValue, datum, apply);
        }
    }

    // Apply style on the path elem and the border
    elem.style(styleType, (d, i) => {
        datum = Array.isArray(d.data) ? d.data[i] : d;

        const { currentState } = datum.meta;
        const interactionVal = currentState.get(interactionType);
        currentState.set(interactionType, interactionVal || {});

        const lastInteractionVal = currentState.get(interactionType);

        if (apply) {
            // apply interaction styles
            lastInteractionVal[styleType] = styleValue;

            // Add to last evaluated style list
            currentState.set(interactionType, {});
            // if (!currentState.get(interactionType)) {
            // }

            // Add/style path border
            context.addOverlayPath(
                elem.node(),
                datum,
                { type: styleType, value: styleValue },
                interactionType
            );
            // Add className to group
            elem.classed(className || '', true);
            return styleValue;
        }

        // remove interaction styles
        // if (currentState.get(interactionType)) {
        currentState.delete(interactionType);
        // }

        const stylesForCurrentLevel = getPreviousStyle(datum.meta, interactionType);
        context.removeOverlayPath(datum, stylesForCurrentLevel);
        elem.classed(className || '', false);

        return stylesForCurrentLevel[styleType];
    });
};
