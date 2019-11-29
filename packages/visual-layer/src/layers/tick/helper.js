export const getStrokeWidthByPosition = (position, radius) => {
    const strokeWidthWithOffsetMap = {
        center: -radius,
        inside: -(radius * Math.PI),
        outside: +(radius * Math.PI)
    };
    return strokeWidthWithOffsetMap[position];
};
