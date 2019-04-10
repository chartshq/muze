import { selectElement, makeElement, applyStyle } from 'muze-utils';
import MuzeComponent from './muze-chart-component';

export default class NoDataComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.setParams(params);
    }

    renderNoData (container) {
        const parent = selectElement(container);
        const node = makeElement(parent, 'div', [1])
                        .style('background-color', 'rgb(241,241,241)');
        const { height, width } = this.params.config.dimensions;
        applyStyle(node, {
            width: `${width}px`,
            height: `${height}px`,
            display: 'table',
            backgroundColor: 'rgb(241,241,241)',
            border: '1px solid #c3c9d0'
        });

        const child = makeElement(node, 'div', [1])
                          .style('vertical-align', 'middle')
                          .style('text-align', 'center')
                          .style('font-size', '18px');

        applyStyle(child, {
            color: 'rgb(140, 141, 142)',
            display: 'table-cell'
        });

        const textElement = makeElement(child, 'text', [1]);
        textElement.html('No data to display');
    }

    draw (container) {
        this.renderNoData(container || document.getElementById(this.renderAt()));
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
        this.className(params.config.className);
        return this;
    }
}
