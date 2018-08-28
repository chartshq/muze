import * as d3 from 'd3';
import config from './config';

/**
 * Get ClassName For Cell Function
  * @param  {Object} cell Each Cell and its properties
  * @param  {Object} cellIndex Index of Cell
 * @return {string} The Class Name of the DataTable Body Cell
 */
function getClassNameForCell(cell, cellIndex) {
    const {
        highlightedRows,
        highlightedColumns,
        alternateShading,
        baseClass,
    } = this.config;
    if (highlightedRows[cell.rowIndex] === true || highlightedColumns[cellIndex] === true) {
        return `${baseClass}-td highlight`;
    }
    if (alternateShading === true && cell.rowIndex % 2 === 0) {
        return `${baseClass}-td alternate`;
    }
    return `${baseClass}-td`;
}

/**
 * The Make Element Function
  * @param  {Object} el Element to which the element is to be appended
  * @param  {Object} attrs Attributes for the new element
 */
const makeElement = (parent, attrs) => {
    const element = parent
        .selectAll(`.${attrs.className}`)
        .data(attrs.data);

    const enterSel = element.enter()
        .append(attrs.type);

    const mergeSel = enterSel.merge(element)

        .attr('class', attrs.setClassName ? attrs.setClassName : attrs.className);

    if (attrs.className.substring(attrs.className.length - 2, attrs.className.length) === 'td'
        || attrs.className.substring(attrs.className.length - 2, attrs.className.length) === 'th') {
        mergeSel.text(d => (attrs.text ? d[attrs.text] : ''));
    }

    element.exit().remove();
    return mergeSel;
};
/**
 * The Map Row Function
  * @param  {Object} view Element to which the element is to be appended
  * @param  {string} row row for the new element
  * @param  {number} rowId rowId for the new element
  * @return {Element} The Visual Perception of the DataTable
 */
function mapRow(row, rowId) {
    return this.state.getState().source.schema.map((column, cellId) => (
        {
            rowIndex: (this.pagination.currentPageNumber - 1) * this.pagination.pageSize + rowId,
            number: rowId,
            value: row[cellId],
        }
    ));
}

/**
* The Make Body Function
* @param  {Object} body Element to which the element is to be appended
* @param  {string} classes Classs for the  element
* @param  {string} view Current View
*/
const makeBody = (body, classes, view) => {
    const {
        showPagination,
        pageSize,
        currentPageNumber,
    } = view.pagination;
    const {
        width,
    } = view.config;
    const {
        data,
    } = view.state.getState().source;

    // Adding Body
    const bodyRowAttrs = {
        className: `${classes.tr}`,
        type: 'div',
    };
    const bodyCellAttrs = {
        className: `${classes.td}`,
        setClassName: (d, i) => getClassNameForCell.call(view, d, i),
        type: 'div',
        data: (row, rowId) => mapRow.call(view, row, rowId),
        text: 'value',
    };
    if (showPagination === true) {
        const displayData = data.slice((+currentPageNumber - 1) * pageSize,
            (+currentPageNumber * pageSize));
        bodyRowAttrs.data = displayData;
    } else {
        bodyRowAttrs.data = data;
    }


    const bodyRow = makeElement(body, bodyRowAttrs);
    const bodyCell = makeElement(bodyRow, bodyCellAttrs);

    bodyCell
        .style('width', `${width}px`);
};

/**
 * The Render Table Function
  * @param  {Array} view Current View
  * @return {DataTableGrid} The Visual Perception of the DataTable
 */
const renderTable = (view) => {
    const {
        width,
        height,
    } = view.config;
    const {
        data,
        schema,
    } = view.state.getState().source;
    const baseClass = 'fusionboard';
    const classes = {
        table: `${baseClass}-table`,
        thead: `${baseClass}-thead`,
        tbody: `${baseClass}-tbody`,
        tr: `${baseClass}-tr`,
        th: `${baseClass}-th`,
        td: `${baseClass}-td`,
        page: `${baseClass}-page`,
    };
    const tableAttrs = {
        data: [1],
        className: `${classes.table}`,
        type: 'div',
    };
    const headerAttrs = {
        data: [1],
        className: `${classes.thead}`,
        type: 'div',
    };
    const headerRowAttrs = {
        data: [1],
        className: `${classes.tr}`,
        type: 'div',
    };
    const headerCellAttrs = {
        className: `${classes.th}`,
        type: 'div',
        data: schema,
        text: 'name',
    };
    const bodyAttrs = {
        data: [1],
        className: `${classes.tbody}`,
        type: 'div',
    };

    // Adding Table
    const table = makeElement(d3.select('body'), tableAttrs)
        .style('height', `${height * (data.length + 2)}px`)
        .style('width', `${width * schema.length}px`);

    const header = makeElement(table, headerAttrs);
    const body = makeElement(table, bodyAttrs);
    const headerRow = makeElement(header, headerRowAttrs);
    const headerCell = makeElement(headerRow, headerCellAttrs);
    makeBody(body, classes, view);
    config.makeConfig(view, table);
    headerCell.style('width', `${width}px`);

    return { data, schema };
};

export { renderTable as default };
