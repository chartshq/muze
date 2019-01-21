import {
    TOP, BOTTOM, LEFT, RIGHT, CENTER, BLANK_BORDERS, COLUMN, ROW, VIEW_INDEX
} from '../enums/constants';

const borderMap = {
    '00': null,
    '01': COLUMN,
    '02': null,
    10: ROW,
    11: CENTER,
    12: ROW,
    20: null,
    21: COLUMN,
    22: null
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
    const borderMapVal = borderMap[`${VIEW_INDEX[row]}${column}`];
    if (borderMapVal) {
        borderApplierFn[borderMapVal]();
    }
};
