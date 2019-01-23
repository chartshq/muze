import {
    TOP, BOTTOM, LEFT, RIGHT, CENTER, BLANK_BORDERS, COLUMN, ROW,
    VIEW_INDEX, ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX, MIDDLE, NO_BORDERS
} from '../enums/constants';

const borderMap = {
    [`${TOP}-${LEFT}`]: NO_BORDERS,
    [`${TOP}-${MIDDLE}`]: COLUMN,
    [`${TOP}-${RIGHT}`]: NO_BORDERS,
    [`${CENTER}-${LEFT}`]: ROW,
    [`${CENTER}-${MIDDLE}`]: CENTER,
    [`${CENTER}-${RIGHT}`]: ROW,
    [`${RIGHT}-${LEFT}`]: NO_BORDERS,
    [`${RIGHT}-${MIDDLE}`]: COLUMN,
    [`${RIGHT}-${RIGHT}`]: NO_BORDERS
};

const applySpecificBorder = (cells, color, type, style) => {
    cells.style(`border-${type}`, `${style} ${color}`);
};

const specificBorderApplier = (borderTypes, showBorders, cells, borderInfo) => {
    const {
        color,
        width,
        style
    } = borderInfo;
    const borderStyle = `${width}px ${style}`;

    borderTypes.forEach((borderType) => {
        applySpecificBorder(cells, showBorders[borderType] ? color : BLANK_BORDERS, borderType, borderStyle);
    });
};

const borderApplier = (cells, borderInfo) => {
    const {
       showRowBorders,
      showColBorders,
      showValueBorders
  } = borderInfo;
    return {
        row: () => specificBorderApplier([TOP, BOTTOM], showRowBorders, cells, borderInfo),
        column: () => specificBorderApplier([LEFT, RIGHT], showColBorders, cells, borderInfo),
        center: () => specificBorderApplier([LEFT, RIGHT, TOP, BOTTOM], showValueBorders, cells, borderInfo)
    };
};

export const applyBorders = (cells, border, row, column) => {
    const borderApplierFn = borderApplier(cells, border);
    const borderMapVal = borderMap[`${ROW_MATRIX_INDEX[VIEW_INDEX[row]]}-${COLUMN_MATRIX_INDEX[column]}`];
    if (borderMapVal) {
        borderApplierFn[borderMapVal]();
    }
};
