import { selectElement, makeElement } from 'muze-utils';
import { cellSpanMaker } from '../../../../layout/src/grid-layout/span-maker';
import {
     TOP, LEFT, RIGHT, BOTTOM, CENTER, HEIGHT, WIDTH, ROW_SPAN, COL_SPAN
} from '../../../../layout/src/enums/constants';
import { BLANK_BORDERS } from '../../../../layout/src/grid-layout/defaults';
import MuzeComponent from './muze-chart-component';

export default class MatrixComponent extends MuzeComponent {

    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.component = params.component;
        this.params = params;
        this.target(params.config.target);
        this.position(TOP);
        this.className(params.config.className);
    }

    renderMatrix (mountPoint) {
        // Creating containers for each matrix individually
        const classPrefix = this.params.config.classPrefix;
        const row = this.params.config.row;
        const column = this.params.config.column;
        // const dimensions = this.params.config.dimensions;
        const border = this.params.config.border;

        const containerForMatrix = makeElement(mountPoint, 'div', [1], `${classPrefix}-grid-${row}-${column + 1}`)
                .classed(`${classPrefix}-grid-${row}`, true)
                .classed(`${classPrefix}-grid`, true);

        const { viewMatrix, spans } = cellSpanMaker(this.component, row, column);
        if (row !== CENTER) {
            containerForMatrix.style(WIDTH, `${this.getLogicalSpace().width}px`);
            containerForMatrix.style(HEIGHT, `${this.getLogicalSpace().height}px`);
        }

        // Rendering the table components
        const { cells } = this.renderTable(containerForMatrix, `${classPrefix}-grid`, viewMatrix);

        if (row === CENTER && spans) {
            cells.attr(ROW_SPAN, function (cell, colIndex) {
                const placeholder = cell.placeholder;
                selectElement(this).style('height', `${placeholder.availHeight() + border.width}px`);
                return spans[cell.rowIndex][colIndex];
            });
        } else if ((row === TOP || row === BOTTOM) && column === 1) {
            cells.attr(COL_SPAN, function (cell, colIndex) {
                const span = spans[cell.rowIndex][colIndex];
                const placeholder = cell.placeholder;
                if (span > 1) {
                    placeholder.setAvailableSpace(0, placeholder.availHeight());
                }
                selectElement(this).style('height', `${placeholder.availHeight()}px`);
                return span;
            });
        }
        // Rendering content within placeholders
        cells.each(function (cell) {
            cell.placeholder && cell.placeholder.render(this);
        }).exit().each((cell) => {
            cell.placeholder && cell.placeholder.remove();
        });
        this.applyBorders(cells, border, row, column);
    }

    applyBorders (cells, border, type, index) {
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
            this.applyRowBorders(cells, borderStyle, showRowBorders, color);
        } else if (index === 1) {
            this.applyColBorders(cells, borderStyle, showColBorders, color);
        }
    }

    renderTable (mount, className, rowData) {
        const table = makeElement(mount, 'table', ['layout'], `${className}-table`);
        const body = makeElement(table, 'tbody', ['layout'], `${className}-body`);
        const rows = makeElement(body, 'tr', rowData, `${className}-tr`);
        const cells = makeElement(rows, 'td', (d, i) => d.filter(e => e !== null).map(e =>
                                  ({ placeholder: e, rowIndex: i })), `${className}-td`, {}, key => key.placeholder.id);

        return { table, body, rows, cells };
    }

    applyRowBorders (cells, borderStyle, showBorders, color) {
        [TOP, BOTTOM].forEach((borderType) => {
            const style = `${borderStyle} ${showBorders[borderType] ? color : BLANK_BORDERS}`;
            cells.style(`border-${borderType}`, style);
        });
    }

    applyColBorders (cells, borderStyle, showBorders, color) {
        [LEFT, RIGHT].forEach((borderType) => {
            const style = `${borderStyle} ${showBorders[borderType] ? color : BLANK_BORDERS}`;
            cells.style(`border-${borderType}`, style);
        });
    }

    draw (container) {
        this.renderMatrix(container || document.getElementById(this.renderAt()));
    }
}
