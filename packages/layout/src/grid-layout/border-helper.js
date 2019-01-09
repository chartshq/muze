import {
    TOP, BOTTOM, LEFT, RIGHT, CENTER, BLANK_BORDERS
} from '../enums/constants';

const applyRowBorders = (cells, borderStyle, showBorders, color) => {
    [TOP, BOTTOM].forEach((borderType) => {
        const style = `${borderStyle} ${showBorders[borderType] ? color : BLANK_BORDERS}`;
        cells.style(`border-${borderType}`, style);
    });
};

const applyColBorders = (cells, borderStyle, showBorders, color) => {
    [LEFT, RIGHT].forEach((borderType) => {
        const style = `${borderStyle} ${showBorders[borderType] ? color : BLANK_BORDERS}`;
        cells.style(`border-${borderType}`, style);
    });
};

export const applyBorders = (cells, border, type, index) => {
    const {
      width,
      style,
      color,
      showRowBorders,
      showColBorders,
      showValueBorders
  } = border;
    const borderStyle = `${width}px ${style}`;

    if (type === CENTER && index === 1) {
        [TOP, BOTTOM, LEFT, RIGHT].forEach((borderType) => {
            cells.style(`border-${borderType}`, `${borderStyle} ${showValueBorders[borderType] ?
              color : BLANK_BORDERS}`);
        });
    } else if (type === CENTER) {
        applyRowBorders(cells, borderStyle, showRowBorders, color);
    } else if (index === 1) {
        applyColBorders(cells, borderStyle, showColBorders, color);
    }
};
