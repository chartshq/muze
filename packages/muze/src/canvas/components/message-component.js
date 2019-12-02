import { selectElement, makeElement, applyStyle } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import { incorrectMessageIcon } from './message-icon';
import { MESSAGE_CONFIG } from '../defaults';

const formatFontSize = (width, height) => {
    const { baseFontLimit, upperFontLimit, baseSizeLimit, upperSizeLimit } = MESSAGE_CONFIG;
    const fractionFont = (upperSizeLimit - baseSizeLimit) / (upperFontLimit - baseFontLimit);
    let fontSize = upperFontLimit;
    const dim = width < height && width !== 0 ? width : height;

    if (dim === 0) {
        fontSize = 0;
    } else if (dim <= baseSizeLimit) {
        fontSize = baseFontLimit;
    } else if (dim > baseSizeLimit && dim < upperSizeLimit) {
        fontSize = baseFontLimit + (upperSizeLimit - dim) / fractionFont;
    }
    return fontSize;
};

export default class MessageComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.setParams(params);
    }

    render (container) {
        const parent = selectElement(container);

        const { config } = this.params;
        const { className } = config.classPrefix;

        const node = makeElement(parent, 'div', [1], className);
        const { height, width } = config.dimensions;
        const childHeight = height > MESSAGE_CONFIG.baseSizeLimit ? MESSAGE_CONFIG.fractionChild * height : 0;
        const { message } = config;

        applyStyle(node, { width: `${width}px`, height: `${height}px` });

        const childNode = makeElement(node, 'div', [1], `${className}-child`);
        const imageNode = makeElement(childNode, 'div', [1], `${className}-child-img`);
        const messageNode = makeElement(childNode, 'div', [1], `${className}-child-message`);

        applyStyle(childNode, { width, height: `${childHeight}px` });
        applyStyle(imageNode, { width, height: `${childHeight * MESSAGE_CONFIG.fractionImage}px` });

        imageNode.html(incorrectMessageIcon);

        const textElement = makeElement(messageNode, 'text', [1]);
        applyStyle(messageNode, { 'font-size': `${formatFontSize(width, height)}px` });

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
        const { target, className } = params.config;
        this.component = params.component;
        this.params = params;
        this.target(target);
        this.className(className);
        this.position(params.config.position);
        return this;
    }
}
