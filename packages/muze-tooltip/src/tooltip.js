import {
    mergeRecursive,
    getQualifiedClassName,
    getUniqueId,
    selectElement,
    makeElement,
    getMaxPoint
} from 'muze-utils';
import { ARROW_BOTTOM, ARROW_LEFT, ARROW_RIGHT, TOOLTIP_LEFT, TOOLTIP_RIGHT, TOOLTIP_BOTTOM,
    TOOLTIP_TOP } from './constants';
import { defaultConfig } from './default-config';
import { reorderContainers } from './helper';
import './styles.scss';
import Content from './content';

/**
 * This component is responsible for creating a tooltip element. It appends the tooltip
 * in the body element.
 * @class Tooltip
 */
export default class Tooltip {
    /**
     * Initializes the tooltip with the container element and configuration
     * @param {HTMLElement} container container where the tooltip will be mounted.
     * @param {string} className Class name of the tooltip.
     */
    constructor (htmlContainer, svgContainer) {
        let connectorContainer = svgContainer;
        this._id = getUniqueId();
        this._config = {};
        this.config({});
        const tooltipConf = this._config;
        const classPrefix = tooltipConf.classPrefix;
        const contentClass = tooltipConf.content.parentClassName;
        const container = makeElement(htmlContainer, 'div', [1], `${classPrefix}-tooltip-container`);
        this._container = container;
        this._tooltipContainer = container.append('div').style('position', 'absolute');
        this._contentContainer = this._tooltipContainer.append('div').attr('class',
            `${classPrefix}-${tooltipConf.defClassName} ${classPrefix}-${contentClass}
            ${tooltipConf.className}`);

        if (!svgContainer) {
            connectorContainer = htmlContainer.append('svg').style('pointer-events', 'none');
        }

        this._contents = {};
        this._tooltipConnectorContainer = selectElement(connectorContainer)
            .append('g')
            .attr('class', `${tooltipConf.classPrefix}-${tooltipConf.connectorClassName}`);
        const id = this._id;
        const defClassName = tooltipConf.parentClassName;
        const qualifiedClassName = getQualifiedClassName(defClassName, id, tooltipConf.classPrefix);

        this.addClass(qualifiedClassName.join(' '));
        this.hide();
    }

    /**
     * Sets the configuration of tooltip.
     * @param {Object} config Configuration of tooltip
     * @return {Tooltip} Instance of tooltip
     */
    config (...config) {
        if (config.length > 0) {
            const defConf = mergeRecursive({}, this.constructor.defaultConfig());
            this._config = mergeRecursive(defConf, config[0]);
            return this;
        }
        return this._config;
    }

    /**
     * Returns the default configuration of tooltip
     * @return {Object} Configuration of tooltip.
     */
    static defaultConfig () {
        return defaultConfig;
    }
    /**
     * Sets the class name of tooltip
     * @param {string} className tooltip class name
     * @return {Tooltip} Instance of tooltip.
     */
    addClass (className) {
        this._tooltipContainer.classed(className, true);
        return this;
    }

    context (...ctx) {
        if (ctx.length) {
            this._context = ctx[0];
            return this;
        }
        return this._context;
    }

    content (name, data, contentConfig = {}) {
        const config = this.config();
        const { classPrefix } = config;
        const contentClass = config.content.className;
        const formatter = config.formatter;
        const className = `${classPrefix}-${contentClass}-${name}`;
        const specificClass = `${classPrefix}-${contentConfig.className}`;
        const content = this._contents[name] = this._contents[name] || new Content();
        const container = makeElement(this._contentContainer, 'div', [contentConfig.order], className);
        container.attr('class', `${classPrefix}-${contentClass} ${className} ${specificClass}`);
        reorderContainers(this._contentContainer, `.${classPrefix}-${contentClass}`);
        const contentConf = config.content;
        contentConfig.classPrefix = this._config.classPrefix;
        content.config(contentConf);

        if (data === null) {
            content.clear();
            container.remove();
            delete this._contents[name];
        } else {
            content.update({
                model: data,
                formatter: contentConfig.formatter || formatter
            });
            content.context(this._context);
            content.render(container);
        }

        if (!Object.keys(this._contents).length) {
            this.hide();
        }
        return this;
    }

    getContents () {
        return Object.values(this._contents);
    }

    /**
     * Positions the tooltip at the given x and y position.
     * @param {number} x x position
     * @param {number} y y position
     * @return {Tooltip} Instance of tooltip.
     */
    position (x, y) {
        if (!Object.keys(this._contents).length) {
            this.hide();
            return this;
        }
        this.show();
        const target = this._target;

        if (target) {
            const node = this._tooltipContainer.node();
            const tooltipPos = this._orientation;
            const outsidePlot = tooltipPos === TOOLTIP_LEFT || tooltipPos === TOOLTIP_RIGHT ?
                (y + node.offsetHeight) < target.y || y > (target.y + target.height) :
                (x + node.offsetWidth) < target.x || x > (target.x + target.width);

            if (outsidePlot) {
                let path;
                this._tooltipConnectorContainer.style('display', 'block');
                const connector = this._tooltipConnectorContainer.selectAll('path').data([1]);
                const enter = connector.enter().append('path');
                if (tooltipPos === ARROW_LEFT) {
                    path = `M ${x} ${y + node.offsetHeight / 2} L ${target.x + target.width}`
                        + ` ${target.y + target.height / 2}`;
                } else if (tooltipPos === ARROW_RIGHT) {
                    path = `M ${x + node.offsetWidth} ${y + node.offsetHeight / 2}`
                            + ` L ${target.x} ${target.y + target.height / 2}`;
                } else if (tooltipPos === ARROW_BOTTOM) {
                    path = `M ${x + node.offsetWidth / 2} ${y + node.offsetHeight}`
                        + ` L ${target.x + target.width / 2} ${target.y}`;
                }
                enter.merge(connector).attr('d', path).style('display', 'block');
            } else {
                this._tooltipConnectorContainer.style('display', 'none');
            }
        }

        const offset = this._offset || {
            x: 0,
            y: 0
        };
        this._tooltipContainer.style('left', `${offset.x + x}px`).style('top',
            `${offset.y + y}px`);

        return this;
    }

    /**
     * Positions the tooltip relative to a rectangular box. It takes care of tooltip overflowing the
     * boundaries.
     * @param {Object} dim Dimensions of the plot.
     */
    positionRelativeTo (dim, tooltipConf = {}) {
        let obj;
        const orientation = tooltipConf.orientation;
        this.show();
        if (!dim) {
            this.hide();
            return this;
        }

        const extent = this._extent;
        const contentContainer = this._contentContainer.node();
        this._tooltipContainer.style('top', '0px')
                        .style('left', '0px')
                        .style('width', '2000px')
                        .style('height', '2000px');

        const offsetWidth = contentContainer.offsetWidth + 4;
        const offsetHeight = contentContainer.offsetHeight + 4;
        const config = this._config;
        const offset = this._offset;
        const spacing = config.spacing;
        const draw = tooltipConf.draw !== undefined ? tooltipConf.draw : true;
        const topSpace = dim.y;
        // When there is no space in right
        const dimX = dim.x + dim.width + offset.x;
        const rightSpace = extent.width - dimX;
        const leftSpace = dim.x + offset.x - extent.x;
        const bottomSpace = extent.height - (dim.y + dim.height + offset.y);
        const arrowSize = spacing;
        const tooltipHeight = offsetHeight + arrowSize;
        const tooltipWidth = offsetWidth + arrowSize;

        const spaces = [{
            position: 'top',
            value: topSpace - tooltipHeight
        }, {
            position: 'right',
            value: rightSpace - tooltipWidth
        }, {
            position: 'left',
            value: leftSpace - tooltipWidth
        }, {
            position: 'bottom',
            value: bottomSpace - tooltipHeight
        }];

        const positionHorizontal = (positionVal) => {
            let position;
            let x = dim.x + dim.width;
            let y = dim.y;

            if (positionVal === 'right') {
                position = TOOLTIP_LEFT;
                x += arrowSize;
            } else if (positionVal === 'left') {
                x = dim.x - offsetWidth;
                position = TOOLTIP_RIGHT;
                x -= arrowSize;
            }

            if (dim.height < offsetHeight) {
                y = Math.max(0, dim.y + dim.height / 2 - offsetHeight / 2);
            }

            return {
                position,
                x,
                y
            };
        };

        const positionVertical = (positionVal) => {
            let position;
            let y;
            // Position tooltip at the center of plot
            let x = dim.x - offsetWidth / 2 + dim.width / 2;

            // Overflows to the right
            if ((extent.width - (dim.x + offset.x)) < offsetWidth) {
                x = extent.width - offsetWidth - offset.x;
            } else if ((x + offset.x) < extent.x) { // Overflows to the left
                x = extent.x;
            }

            if (positionVal === 'top') {
                y = dim.y - offsetHeight - arrowSize;
                position = TOOLTIP_BOTTOM;
            } else {
                y = dim.y + dim.height + arrowSize;
                position = TOOLTIP_TOP;
            }

            return {
                position,
                x,
                y
            };
        };

        this._target = dim;

        const hMax = getMaxPoint(spaces.filter(d => d.position === 'left' || d.position === 'right'),
            'value');
        const vMax = getMaxPoint(spaces.filter(d => d.position === 'top' || d.position === 'bottom'),
                'value');
        if (!orientation) {
            if (hMax.value > 0) {
                const position = hMax.position;
                obj = positionHorizontal(position);
            } else {
                const position = vMax.position;
                obj = positionVertical(position);
            }
        } else if (orientation === 'horizontal') {
            const position = hMax.position;
            obj = positionHorizontal(position);
        } else {
            const position = vMax.position;
            obj = positionVertical(position);
        }

        this._position = {
            x: obj.x,
            y: obj.y
        };

        this._tooltipContainer.style('height', `${offsetHeight}px`)
            .style('width', `${offsetWidth}px`);
        this._orientation = obj.position;
        draw && this.position(obj.x, obj.y);
        return this;
    }

    /**
     * Hides the tooltip element.
     * @return {Tooltip} Instance of tooltip.
     */
    hide () {
        this._tooltipContainer.style('display', 'none');
        this._tooltipConnectorContainer.style('display', 'none');
        return this;
    }

    /**
     * Shows the tooltip element.
     * @return {Tooltip} Instance of tooltip.
     */
    show () {
        this._tooltipContainer.style('display', 'block');
        return this;
    }

    extent (extent) {
        this._extent = extent;
        return this;
    }

    offset (offset) {
        this._offset = offset;
        return this;
    }

    remove () {
        this._tooltipContainer.remove();
        this._tooltipConnectorContainer.remove();
        return this;
    }
}
