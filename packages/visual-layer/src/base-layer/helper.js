import {
    transformToHex,
    detectColor
} from 'muze-utils';

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

export const interactionFn = (context, elem, apply, interactionType, styleValue, styleType, mountPoint) => {
    let datum = elem.data()[0];
    const datumStyle = elem.style(styleType);
    const interactions = context.config().interaction;
    const strokePosition = interactions[interactionType].strokePosition || 'center';
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

        if (apply) {
            currentState.set(interactionType, interactionVal || {});
            const lastInteractionVal = currentState.get(interactionType);

            // apply interaction styles
            lastInteractionVal[styleType] = styleValue;

            // Add to last evaluated style list
            if (!currentState.get(interactionType)) {
                currentState.set(interactionType, {});
            }

            // Add className to group
            elem.classed(className || '', true);

            if (styleType === 'stroke-width') {
                if (strokePosition === 'center') {
                    return styleValue;
                }

                // Apply stroke only to path and return 0 for the element's strokeWidth
                context.addOverlayPath(
                    elem.node(),
                    datum,
                    { type: styleType, value: styleValue },
                    interactionType,
                    mountPoint
                );
                return 0;
            }

            // Add/style path border
            context.addOverlayPath(
                elem.node(),
                datum,
                { type: styleType, value: styleValue },
                interactionType,
                mountPoint
            );

            return styleValue;
        }

        // remove interaction styles
        if (currentState.get(interactionType)) {
            currentState.delete(interactionType);
        }

        const stylesForCurrentLevel = getPreviousStyle(datum.meta, interactionType);
        context.removeOverlayPath(datum, stylesForCurrentLevel);
        elem.classed(className || '', false);

        if (styleType === 'stroke-width') {
            return 0;
        }
        return stylesForCurrentLevel[styleType];
    });
};
