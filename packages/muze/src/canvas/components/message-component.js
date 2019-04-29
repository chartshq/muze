import { selectElement, makeElement, applyStyle } from 'muze-utils';
import MuzeComponent from './muze-chart-component';

export default class MessageComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.setParams(params);
    }

    render (container) {
        const parent = selectElement(container);
        const { className } = this.params.config.classPrefix;
        const node = makeElement(parent, 'div', [1], className);
        const { height, width } = this.params.config.dimensions;
        const { message } = this.params.config;
        applyStyle(node, { width: `${width}px`, height: `${height}px` });
        const child = makeElement(node, 'div', [1], `${className}-child`);
        const textElement = makeElement(child, 'text', [1]);
        textElement.html(message);
    }

    draw (container) {
        this.render(container || document.getElementById(this.renderAt()));
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
        const { target, className } = params.config;
        this.target(target);
        this.className(className);
        return this;
    }
}
