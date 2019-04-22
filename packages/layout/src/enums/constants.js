/**
 * This file exports constants that will be used to
 * create the state store of the table layout.
 */
/**
 * The index of top, bottom and center in the matrix
 */
export const VIEW_INDEX = {
    top: 0,
    center: 1,
    bottom: 2
};

export const ROW_MATRIX_INDEX = {
    0: 'top',
    1: 'center',
    2: 'bottom'
};

export const COLUMN_MATRIX_INDEX = {
    0: 'left',
    1: 'middle',
    2: 'right'
};

/**
 * The width of the grid suppied by the user.
 */
export const GRID_WIDTH = 'width';

/**
 * The height of the grid supplied by the user.
 */
export const GRID_HEIGHT = 'height';

/**
  * The border for the grid
  */
export const BORDER = 'border';

 /**
  *  The index of the first visible row in view matrix.
  */
export const ROW_POINTER = 'rowPointer';

/**
 * The index of the first visible column in the view matrix.
 */
export const COLUMN_POINTER = 'columnPointer';

/**
 * Flag to specify whether row sizes should be equal.
 */
export const ROW_SIZE_IS_EQUAL = 'isRowSizeEqual';

/**
 * Flag to specify whether column sizes are equal.
 */
export const COLUMN_SIZE_IS_EQUAL = 'isColumnSizeEqual';

/**
 * Field to store an array an of the widths of visible columns.
 * @computed
 */
export const COLUMN_WIDTHS = 'visibleColumnWidths';

/**
 * Field to store an array of heights of visible rows.
 * @computed
 */
export const ROW_HEIGHTS = 'visibleRowHeights';

/**
 * Field to store the width of the left matrix.
 * @computed
 */
export const LEFT_MATRIX_WIDTH = 'leftMatrixWidth';

/**
 * Field to store the width of the right matrix.
 * @computed
 */
export const RIGHT_MATRIX_WIDTH = 'rightMatrixWidth';

/**
 * Field to store the height of the top matrix.
 * @computed
 */
export const TOP_MATRIX_HEIGHT = 'topMatrixHeight';

/**
 * Field to store the height of the bottom matrix.
 * @computed
 */
export const BOTTOM_MATRIX_HEIGHT = 'bottomMatrixHeight';

/**
 * The dom element to render the layout inside.
 */
export const MOUNT_POINT = 'mount';

/**
 * The id attribute of the left table element.
 */
export const LEFT_TABLE_ID = 'grid-left';

/**
 * The id attribute of the right table element.
 */
export const RIGHT_TABLE_ID = 'grid-right';

/**
 * The id attribute of the top table.
 */
export const TOP_TABLE_ID = 'grid-top';

/**
 * The id attribute of the bottom table.
 */
export const BOTTOM_TABLE_ID = 'grid-bottom';

/**
 * The id attribute of the center table.
 */
export const CENTER_TABLE_ID = 'grid-center';

/**
 * The id attribute of the top div.
 */
export const TOP_DIV_ID = 'muze-div-top';

/**
 * The id attribute of the bottom div.
 */
export const BOTTOM_DIV_ID = 'muze-div-bottom';

/**
 * The id attribute of the center div.
 */
export const CENTER_DIV_ID = 'muze-div-center';

/**
 * Field that indicates if the row configuration has changed
 */
export const HAVE_ROWS_CHANGED = 'haveRowsChanged';

/**
 * Field that indicates if the column configuration has changed
 */
export const HAVE_COLUMNS_CHANGED = 'haveColumnsChanged';

/**
 * Field that indicates if the values configuration for the center matrix has changed
 */
export const HAVE_VALUES_CHANGED = 'haveValuesChanged';

/**
 * Field that indicates the width of row matrix
 */
export const ROW_MATRIX_WIDTH = 'rowMatrixWidth';

/**
 * Field that indicates the height of row matrix
 */
export const COLUMN_MATRIX_HEIGHT = 'columnMatrixHeight';

/**
 * Field that indicates the unit width of layout
 */
export const UNIT_WIDTH = 'unitWidth';

/**
 * Field that indicates the unit height of layout
 */
export const UNIT_HEIGHT = 'unitHeight';

/**
 * Field that indicates the style object
 */
export const STYLE = 'style';

/**
 * Field that indicates the color configuration
 */
export const COLOR = 'color';

/**
 * Field that indicates width
 */
export const WIDTH = 'width';

/**
 * Field that indicates collpase property for border
 */
export const COLLAPSE = 'collapse';

/**
 * Field that indicates spacing property for border
 */
export const SPACING = 'spacing';

/**
 * Field that indicates spacing property for border
 */
export const DISTRIBUTION = 'distribution';

/**
 * Field that indicates spacing property for border
 */
export const GUTTERSPACE = 'gutterSpace';

/**
 * Field that indicates spacing property for border
 */
export const BREAK_PAGE = 'breakPage';

/**
 * Field that indicates spacing property for border
 */
export const SHOW_ROW_BORDERS = 'showRowBorders';

/**
 * Field that indicates spacing property for border
 */
export const SHOW_COL_BORDERS = 'showColBorders';

/**
 * Field that indicates spacing property for border
 */
export const SHOW_VALUE_BORDERS = 'showValueBorders';

export const HEIGHT = 'height';
export const COLUMN = 'column';
export const ROW = 'row';
export const TOP = 'top';
export const LEFT = 'left';
export const RIGHT = 'right';
export const BOTTOM = 'bottom';
export const CENTER = 'center';
export const CLICK = 'click';
export const ROW_LEFT = 'rowLeft';
export const ROW_RIGHT = 'rowRight';
export const COLUMN_BOTTOM = 'colBottom';
export const COLUMN_TOP = 'colTop';
export const AUTO = 'auto';
export const ROW_SPAN = 'rowSpan';
export const COL_SPAN = 'colSpan';
export const ROW_ROOT = 'rowRoot';
export const COLUMN_ROOT = 'columnRoot';
export const PRIMARY = 'primary';
export const SECONDARY = 'secondary';
export const VERTICAL = 'vertical';
export const HORIZONTAL = 'horizontal';
export const GRID = 'grid';

export const BLANK_BORDERS = 'rgba(0,0,0,0)';

export const PAGINATION = 'pagination';
export const BUFFER = 'buffer';
export const HOLISTIC = 'holistic';
export const SCROLL = 'scroll';
export const MIDDLE = 'middle';
export const NO_BORDERS = null;

export const MAX_WIDTH_AVAIL_FOR_COL_MATRIX = 'maxWidthAvailableForColumnMatrix';
export const COLUMN_MATRIX = 'columnMatrix';
export const MAX_HEIGHT_AVAIL_FOR_ROW_MATRIX = 'maxHeightAvailableForRowMatrix';
export const ROW_MATRIX = 'rowMatrix';
