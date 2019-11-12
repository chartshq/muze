export const getStrokeWidthByPosition = (position, radius) => {
    const strokeWidthWithOffsetMap = {
        center: -radius,
        inside: -(radius * Math.PI),
        outside: +(radius * Math.PI)
    };
    return strokeWidthWithOffsetMap[position];
};

export const interactionStyleMap = {
    // focusStroke: {
    //     stroke: (...params) => strokeInteractionStyle(...params),
    //     'stroke-width': (...params) => strokeInteractionStyle(...params)
    // },
    highlight: {
        stroke: () => true,
        'stroke-width': () => true
    },
    focusStroke: {
        stroke: () => true,
        'stroke-width': () => true
    }
};
