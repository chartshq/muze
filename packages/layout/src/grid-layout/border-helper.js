import {
    TOP, BOTTOM, LEFT, RIGHT, CENTER, COLUMN, ROW,
    VIEW_INDEX, ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX, MIDDLE, NO_BORDERS
} from '../enums/constants';

const borderMap = (isFacet, showHeaders) => ({
    [`${TOP}-${LEFT}`]: isFacet && showHeaders ? LEFT : NO_BORDERS,
    [`${TOP}-${MIDDLE}`]: COLUMN,
    [`${TOP}-${RIGHT}`]: isFacet && showHeaders ? RIGHT : NO_BORDERS,
    [`${CENTER}-${LEFT}`]: isFacet ? `${CENTER}${LEFT}` : ROW,
    [`${CENTER}-${MIDDLE}`]: CENTER,
    [`${CENTER}-${RIGHT}`]: isFacet ? `${CENTER}${RIGHT}` : ROW,
    [`${BOTTOM}-${LEFT}`]: NO_BORDERS,
    [`${BOTTOM}-${MIDDLE}`]: COLUMN,
    [`${BOTTOM}-${RIGHT}`]: NO_BORDERS
});

const applySpecificBorder = (params) => {
    const { type, borderWidth, borderStyle, cells, color } = params;
    cells.style(`border-${type}`, `${borderWidth}px ${borderStyle} ${color}`);
};

const specificBorderApplier = (params) => {
    const { borderTypes, showBorders, cells, borderInfo, name, isFacet } = params;
    const {
        color,
        style,
        width
    } = borderInfo;

    borderTypes.forEach((borderType) => {
        applySpecificBorder({
            cells,
            color: showBorders[borderType] ? color : 'transparent',
            type: borderType,
            borderWidth: width,
            borderStyle: style,
            name,
            isFacet
        });
    });
};

const borderApplier = (cells, borderInfo, name, isFacet) => {
    const {
        showRowBorders,
        showColBorders,
        showValueBorders
    } = borderInfo;
    return {
        [ROW]: () => specificBorderApplier({
            borderTypes: [TOP, BOTTOM],
            showBorders: showRowBorders,
            cells,
            borderInfo,
            name,
            isFacet
        }),
        [COLUMN]: () => specificBorderApplier({
            borderTypes: [LEFT, RIGHT],
            showBorders: showColBorders,
            cells,
            borderInfo,
            name,
            isFacet
        }),
        [CENTER]: () => specificBorderApplier({
            borderTypes: [LEFT, RIGHT, TOP, BOTTOM],
            showBorders: showValueBorders,
            cells,
            borderInfo,
            name,
            isFacet
        }),
        [LEFT]: () => specificBorderApplier({
            borderTypes: [LEFT],
            showBorders: showRowBorders,
            cells,
            borderInfo,
            name,
            isFacet
        }),
        [RIGHT]: () => specificBorderApplier({
            borderTypes: [RIGHT],
            showBorders: showRowBorders,
            cells,
            borderInfo,
            name,
            isFacet
        }),
        [`${CENTER}${LEFT}`]: () => specificBorderApplier({
            borderTypes: [LEFT, TOP, BOTTOM],
            showBorders: showRowBorders,
            cells,
            borderInfo,
            name,
            isFacet
        }),
        [`${CENTER}${RIGHT}`]: () => specificBorderApplier({
            borderTypes: [RIGHT, TOP, BOTTOM],
            showBorders: showRowBorders,
            cells,
            borderInfo,
            name,
            isFacet
        })
    };
};

export const applyBorders = (params) => {
    const { cells, border, row, column, isFacet, showHeaders } = params;
    const name = `${ROW_MATRIX_INDEX[VIEW_INDEX[row]]}-${COLUMN_MATRIX_INDEX[column]}`;
    const borderApplierFn = borderApplier(cells, border, name, isFacet);
    const borderMapVal = borderMap(isFacet, showHeaders)[name];
    if (borderMapVal) {
        borderApplierFn[borderMapVal]();
    }
};
