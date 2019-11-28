import { makeElement } from 'muze-utils';
import { cellSpanMaker, applySpans } from '../../../../layout/src/grid-layout/span-maker';
import { applyBorders } from '../../../../layout/src/grid-layout/border-helper';
import '../../border-applier.scss';
import {
     TOP, CENTER
} from '../../../../layout/src/enums/constants';
import MuzeComponent from './muze-chart-component';
import { WIDTH, HEIGHT, HIDDEN, OVERFLOW, AUTO, VISIBLE } from '../../constants';

const renderPlaceholders = (cells) => {
    // Rendering content within placeholders
    cells.each(function (cell) {
        cell.placeholder.render(this);
    });
};

export default class MatrixComponent extends MuzeComponent {

    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.setParams(params);
        this.className(params.config.className);
    }

    applyScroll (container) {
        const row = this.params.config.row;
        const column = this.params.config.column;
        const { horizontal, vertical } = this.params.config.scrollInfo;
        container.style(OVERFLOW, VISIBLE);
        container.style(WIDTH, AUTO);
        container.style(HEIGHT, AUTO);

        if (horizontal && column === 1) {
            container.style(OVERFLOW, HIDDEN);
            container.style(WIDTH, '100%');
        }

        if (vertical && row === CENTER) {
            container.style(OVERFLOW, HIDDEN);
            container.style(HEIGHT, '100%');
        }
    }

    renderMatrix (mountPoint) {
        const { classPrefix, row, column, dimensions, border, isFacet, showHeaders } = this.params.config;

        // Creating containers for each matrix individually
        const containerForMatrix = makeElement(mountPoint, 'div', [1], `${classPrefix}-grid-${row}-${column + 1}`)
            .classed(`${classPrefix}-grid-${row}`, true)
            .classed(`${classPrefix}-grid`, true);

        this.applyScroll(containerForMatrix);

        const {
            viewMatrix,
            spans
        } = cellSpanMaker(this.component, row, column);

        // Rendering the table components
        const { cells } = this.renderTable(containerForMatrix, `${classPrefix}-grid`, viewMatrix);

        applySpans(cells, spans, { dimensions, border }, `${row}-${column}`);
        renderPlaceholders(cells);

        cells.exit().each((cell) => {
            cell.placeholder.remove();
        });

        applyBorders({ cells, border, row, column, isFacet, showHeaders });
    }

    renderTable (mount, className, rowData) {
        const table = makeElement(mount, 'table', ['layout'], `${className}-table`);
        const body = makeElement(table, 'tbody', ['layout'], `${className}-body`);
        const rows = makeElement(body, 'tr', rowData, `${className}-tr`);
        const cells = makeElement(rows, 'td',
            (d, i) => d.filter(e => e !== null).map(e =>
                ({ placeholder: e, rowIndex: i })), `${className}-td`, {
                    update: (elem, cell) => {
                        const { externalClassname } = cell.placeholder.config();
                        externalClassname && externalClassname.map(d => elem.classed(`${className}-${d}`, true));
                    }
                }, key => key.placeholder.id);

        return { table, body, rows, cells };
    }

    draw (container) {
        this.renderMatrix(container || document.getElementById(this.renderAt()));
    }

    updateWrapper (params) {
        this.name(params.name);
        this.boundBox(params.config.dimensions);
        this.setParams(params);
        return this;
    }

    setParams (params) {
        this.component = params.component;
        this.params = params;
        this.target(params.config.target);
        this.position(TOP);
        this.className(params.config.className);
    }
}
