export const strokeWidthPositionMap = ({ width, position = 'center' }) => {
    const offset = width ? width / 2 : 1;
    const strokeWidthWithOffsetMap = {
        center: {
            M: { x: 0, y: 0 },
            L: { x: 0, y: 0 }
        },
        inside: {
            M: { x: +offset, y: +offset },
            L: { x: -offset, y: +offset }
        },
        outside: {
            M: { x: -offset, y: -offset },
            L: { x: +offset, y: -offset }
        }
    };
    return strokeWidthWithOffsetMap[position];
};
