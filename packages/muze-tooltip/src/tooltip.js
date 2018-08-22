import {
    mergeRecursive,
    getQualifiedClassName,
    getUniqueId,
    selectElement,
    setStyles,
    makeElement
} from 'muze-utils';
import { ARROW_BOTTOM, ARROW_LEFT, ARROW_RIGHT, TOOLTIP_LEFT, TOOLTIP_RIGHT, TOOLTIP_BOTTOM,
    INITIAL_STYLE } from './constants';
import { defaultConfig } from './default-config';
import { getArrowPos, placeArrow, reorderContainers } from './helper';
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
        this._container = selectElement(htmlContainer);
        this.config({});
        const tooltipConf = this._config;
        const classPrefix = tooltipConf.classPrefix;
        const contentClass = tooltipConf.content.parentClassName;
        this._tooltipContainer = this._container.append('div').style('position', 'absolute');
        this._contentContainer = this._tooltipContainer.append('div').attr('class', `${classPrefix}-${contentClass}`);
        this._tooltipBackground = this._tooltipContainer.append('div').style('position', 'relative');
        this._tooltipArrow = this._tooltipContainer.append('div');

        if (!svgContainer) {
            connectorContainer = htmlContainer.append('svg').style('pointer-events', 'none');
        }
        this._contents = {};
        this._tooltipConnectorContainer = selectElement(connectorContainer)
            .append('g')
            .attr('class', `${tooltipConf.classPrefix}-${tooltipConf.connectorClassName}`);
        const id = this._id;
        const defClassName = tooltipConf.defClassName;
        const qualifiedClassName = getQualifiedClassName(defClassName, id, tooltipConf.classPrefix);

        setStyles(this._tooltipArrow, INITIAL_STYLE);
        setStyles(this._tooltipBackground, INITIAL_STYLE);
        this.addClass(qualifiedClassName.join(' '));
        this.addClass(tooltipConf.className);
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
        const className = contentConfig.className || `${classPrefix}-${contentClass}-${name}`;
        const content = this._contents[name] = this._contents[name] || new Content();
        const container = makeElement(this._contentContainer, 'div', [contentConfig.order], className);
        container.attr('class', `${classPrefix}-${contentClass} ${className}`);
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
    position (x, y, conf = {}) {
        if (!Object.keys(this._contents).length) {
            this.hide();
            return this;
        }
        this.show();
        const target = this._target;
        const repositionArrow = conf.repositionArrow;

        if (target && repositionArrow) {
            const node = this._tooltipContainer.node();
            const config = this._config;
            const arrowDisabled = config.arrow.disabled;
            const arrowWidth = arrowDisabled ? 0 : config.arrow.size;
            const arrowOrient = this._arrowOrientation;
            const outsidePlot = arrowOrient === ARROW_LEFT || arrowOrient === ARROW_RIGHT ?
                (y + node.offsetHeight - arrowWidth) < target.y || y > (target.y + target.height) :
                (x + node.offsetWidth - arrowWidth) < target.x || x > (target.x + target.width);
            if (outsidePlot) {
                let path;
                this._tooltipArrow.style('display', 'none');
                this._tooltipBackground.style('display', 'none');
                this._tooltipConnectorContainer.style('display', 'block');
                const connector = this._tooltipConnectorContainer.selectAll('path').data([1]);
                const enter = connector.enter().append('path');
                if (arrowOrient === ARROW_LEFT) {
                    path = `M ${x} ${y + node.offsetHeight / 2} L ${target.x + target.width}`
                        + ` ${target.y + target.height / 2}`;
                } else if (arrowOrient === ARROW_RIGHT) {
                    path = `M ${x + node.offsetWidth} ${y + node.offsetHeight / 2}`
                            + ` L ${target.x} ${target.y + target.height / 2}`;
                } else if (arrowOrient === ARROW_BOTTOM) {
                    path = `M ${x + node.offsetWidth / 2} ${y + node.offsetHeight}`
                        + ` L ${target.x + target.width / 2} ${target.y}`;
                }
                enter.merge(connector).attr('d', path).style('display', 'block');
            } else {
                const arrowPos = getArrowPos(arrowOrient, target, {
                    x,
                    y,
                    boxHeight: node.offsetHeight,
                    boxWidth: node.offsetWidth
                }, this._config);

                placeArrow(this, this._arrowOrientation, arrowPos);
                this._tooltipConnectorContainer.style('display', 'none');
            }
        }

        const offset = this._offset || {
            x: 0,
            y: 0
        };

        this._tooltipContainer.style('left', `${offset.x + x}px`).style('top', `${offset.y + y}px`);

        return this;
    }

    /**
     * Positions the tooltip relative to a rectangular box. It takes care of tooltip overflowing the
     * boundaries.
     * @param {Object} dim Dimensions of the plot.
     */
    positionRelativeTo (dim, tooltipConf = {}) {
        let obj;
        let orientation = tooltipConf.orientation;
        this.show();
        if (!dim) {
            dim = this._relativeDim;
        } else {
            this._relativeDim = dim;
        }
        if (!dim) {
            this.hide();
            return this;
        }

        const extent = this._extent;
        const node = this._tooltipContainer.node();
        const offsetWidth = node.offsetWidth;
        const offsetHeight = node.offsetHeight;
        const config = this._config;
        const arrowDisabled = config.arrow.disabled;
        const arrowSize = config.arrow.size;
        const draw = tooltipConf.draw !== undefined ? tooltipConf.draw : true;
        const topSpace = dim.y;
        const positionHorizontal = () => {
            let position;
            let x = dim.x + dim.width;
            let y = dim.y;
            // When there is no space in right
            const rightSpace = extent.width - x;
            const leftSpace = dim.x - extent.x;
            if (rightSpace >= offsetWidth + arrowSize) {
                position = TOOLTIP_LEFT;
                x += arrowSize;
            } else if (leftSpace >= offsetWidth + arrowSize) {
                x = dim.x - offsetWidth;
                position = TOOLTIP_RIGHT;
                x -= arrowSize;
            } else {
                position = 'left';
                x += arrowSize;
            }
            if (dim.height < offsetHeight) {
                y = Math.max(0, dim.y + dim.height / 2 - offsetHeight / 2);
            }

            const arrowPos = getArrowPos(position, dim, {
                x,
                y,
                boxHeight: offsetHeight,
                boxWidth: offsetWidth
            }, this._config);

            return {
                position,
                arrowPos,
                x,
                y
            };
        };
        const positionVertical = () => {
            let position;
            // Position tooltip at the center of plot
            let x = dim.x - offsetWidth / 2 + dim.width / 2;
            const y = dim.y - offsetHeight - arrowSize;
            // Overflows to the right
            if ((extent.width - dim.x) < offsetWidth) {
                x = extent.width - offsetWidth;
            } else if (x < extent.x) { // Overflows to the left
                x = extent.x;
            }

            const arrowPos = getArrowPos(position, dim, {
                x,
                y,
                boxHeight: offsetHeight,
                boxWidth: offsetWidth
            }, this._config);

            position = TOOLTIP_BOTTOM;
            return {
                position,
                arrowPos,
                x,
                y
            };
        };

        this._target = dim;
        if (!orientation) {
            orientation = topSpace > (offsetHeight + arrowSize) ? 'vertical' : 'horizontal';
        }

        if (orientation === 'horizontal') {
            obj = positionHorizontal();
        } else if (orientation === 'vertical') {
            obj = positionVertical();
        }

        this._position = {
            x: obj.x,
            y: obj.y
        };

        this._arrowPos = obj.arrowPos;
        if (!arrowDisabled) {
            placeArrow(this, obj.position, obj.arrowPos);
        }
        this._arrowOrientation = obj.position;
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
        this._tooltipBackground.remove();
        this._tooltipConnectorContainer.remove();
        return this;
    }
}
