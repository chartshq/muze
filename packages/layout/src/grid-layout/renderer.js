import { makeElement, selectElement } from 'muze-utils';
import { cellSpanMaker } from './span-maker';
import {
     TOP, LEFT, RIGHT, BOTTOM, CENTER, WIDTH, ROW_SPAN, COL_SPAN
} from '../enums/constants';
import { BLANK_BORDERS } from './defaults';

const getCellsForRow = (rowData, rowIndex) => {
    const cells = rowData.filter(e => e !== null && e.config().show).map(e =>
        ({ placeholder: e, rowIndex }));
    return cells;
};

/**
 * Creates a table element of the layout
 *
 * @param {Object} mount Mount point for table elements
 * @param {string} className defines class name
 * @param {Array} rowData set of rows for the table
 * @return {Selection} set of selections for the table
 */
function renderTable (mount, className, rowData) {
    const table = makeElement(mount, 'table', ['layout'], `${className}-table`);
    const body = makeElement(table, 'tbody', ['layout'], `${className}-body`);
    const rows = makeElement(body, 'tr', rowData, `${className}-tr`);
    const cells = makeElement(rows, 'td', getCellsForRow, `${className}-td`, {}, key => key.placeholder.id);

    return { table, body, rows, cells };
}

function applyRowBorders (cells, borderStyle, showBorders, color) {
    [TOP, BOTTOM].forEach((borderType) => {
        const style = `${borderStyle} ${showBorders[borderType] ? color : BLANK_BORDERS}`;
        cells.style(`border-${borderType}`, style);
    });
}

function applyColBorders (cells, borderStyle, showBorders, color) {
    [LEFT, RIGHT].forEach((borderType) => {
        const style = `${borderStyle} ${showBorders[borderType] ? color : BLANK_BORDERS}`;
        cells.style(`border-${borderType}`, style);
    });
}

/**
 * Applies borders to the cells in a matrix
 *
 * @param {Selection} cells Set of cells made from the matrix
 * @param {Object} border Border info for layout
 * @param {string} type Type of matrix(top/center/bottom)
 * @param {number} index Column index of matrix in the row
 */
function applyBorders (cells, border, type, index) {
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
}

const spaceAllocationDueToSpan = (span, placeholder, borderWidth) => {
    const height = placeholder.availHeight();
    const width = placeholder.availWidth();

    return {
        [ROW_SPAN] () {
            selectElement(this).style('height', `${height + borderWidth}px`);
            if (span > 1) {
                selectElement(this).style('height', `${height * span + borderWidth * (span)}px`);
                placeholder.setAvailableSpace(width, height * span);
            }
        },
        [COL_SPAN] () {
            if (span > 1) {
                placeholder.setAvailableSpace(width * span + borderWidth * (span - 1), height);
            }
            selectElement(this).style('height', `${height}px`);
        }
    };
};

const spanApplier = (cells, spans, config, type) => {
    const borderWidth = config.dimensions.border.width;

    cells.attr(type, function (cell, colIndex) {
        const span = spans[cell.rowIndex][colIndex];
        const placeholder = cell.placeholder;

        spaceAllocationDueToSpan(span, placeholder, borderWidth)[type].bind(this)();
        return span;
    });
};

const spanApplierMap = {
    [`${TOP}-0`]: null,
    [`${TOP}-1`]: (...params) => spanApplier(...params, COL_SPAN),
    [`${TOP}-2`]: null,
    [`${CENTER}-0`]: (...params) => spanApplier(...params, ROW_SPAN),
    [`${CENTER}-1`]: null,
    [`${CENTER}-2`]: (...params) => spanApplier(...params, ROW_SPAN),
    [`${BOTTOM}-0`]: null,
    [`${BOTTOM}-1`]: (...params) => spanApplier(...params, COL_SPAN),
    [`${BOTTOM}-2`]: null
};

const applySpans = (cells, spans, config, type) => {
    const applier = spanApplierMap[type];
    if (applier) {
        applier(cells, spans, config);
    }
};

const renderPlaceholders = (cells) => {
      // Rendering content within placeholders
    cells.each(function (cell) {
        cell.placeholder.render(this);
    });
};

/**
 * Renders a set of matrices in a row
 *
 * @param {Array} matrices Set of matrices in a row
 * @param {Selection} mountPoint Mount point for the row
 * @param {string} type top/center/bottom
 * @param {Object} dimensions dimensions of the matrix
 */
function renderMatrix (matrices, mountPoint, type, dimensions, classPrefix) {
    matrices.forEach((matrix, index) => {
        // Creating containers for each matrix individually
        const containerForMatrix = makeElement(mountPoint, 'div', [1], `${classPrefix}-grid-${type}-${index + 1}`)
        .classed(`${classPrefix}-grid-${type}`, true)
        .classed(`${classPrefix}-grid`, true);

        const {
            viewMatrix,
            spans
        } = cellSpanMaker(matrix, type, index);

        // Rendering the table components
        const { cells } = renderTable(containerForMatrix, `${classPrefix}-grid`, viewMatrix);

        applySpans(cells, spans, { dimensions }, `${type}-${index}`);
        renderPlaceholders(cells);

        cells.exit().each((cell) => {
            cell.placeholder.remove();
        });

        applyBorders(cells, dimensions.border, type, index);
    });
}

/**
 * Renders all the matrices of the layout
 *
 * @export
 * @param {Array} matrices Set of matrices in the layout
 * @param {Array} mountPoints Mount points for each row of matrix
 * @param {Array} layoutDimensions Dimensions(height/width) of all the matrices
 */
export function renderMatrices (context, matrices, layoutDimensions) {
    const {
        top,
        center,
        bottom
    } = matrices;

    const {
        classPrefix
    } = context.config();
    const {
        width
    } = context.measurement();
    const mount = context.mountPoint();

    const data = [
        { type: TOP, matrix: top },
        { type: CENTER, matrix: center },
        { type: BOTTOM, matrix: bottom }
    ];
    makeElement(mount, 'div', data, `${classPrefix}-grid-layout-row`)
                    .each(function (d, i) {
                        const row = selectElement(this);
                        row.classed(`${classPrefix}-grid-layout-row-${i}`, true);
                        renderMatrix(d.matrix, row, d.type, layoutDimensions, classPrefix);
                    })
                    .style(WIDTH, `${Math.ceil(width)}px`);
}
