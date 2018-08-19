import {
    selectElement,
    mergeRecursive,
    makeElement,
    setAttrs,
    setStyles,
    getSymbol
} from 'muze-utils';
import { DEFAULT_STRATEGY, strategy } from './strategy';
import { defaultConfig } from './default-config';

/**
 * This class is used to manage the content of tooltip.
 */
export default class Content {
    /**
     * Creates an instance of content.
     */
    constructor () {
        this._model = null;
        this._strategy = DEFAULT_STRATEGY;
        this._formatter = null;
        this._config = this.constructor.defaultConfig();
    }
   /**
     * Returns the default configuration of tooltip
     * @return {Object} Configuration of tooltip.
     */
    static defaultConfig () {
        const config = defaultConfig.content;
        config.classPrefix = defaultConfig.classPrefix;
        return config;
    }

    config (...c) {
        if (c.length > 0) {
            this._config = mergeRecursive(this._config, c);
            return this;
        }
        return this._config;
    }

    /**
     * Update model. The format contains presentation strategy which determines how to show the content.
     * If no strategy is mentioned then default is to show key value pair
    */
    update (item) {
        this._model = item.model;
        this._strategy = item.strategy !== undefined ? item.strategy : DEFAULT_STRATEGY;
        this._formatter = item.formatter;
        return this;
    }

    context (ctx) {
        this._context = ctx;
        return this;
    }

    render (mount) {
        let data;
        const config = this._config;
        const iconContainerSize = config.iconContainerSize;
        const formatter = this._formatter;
        const rowMargin = config.rowMargin;
        const model = this._model;

        this._mount = mount;
        if (model instanceof Array) {
            data = model;
        } else {
            data = formatter instanceof Function ? formatter(this._model, this._context) :
                strategy[this._strategy](this._model, this.config(), this._context);
        }

        if (data instanceof Function) {
            mount.html(data());
        } else {
            const rows = makeElement(mount, 'p', data, `${config.classPrefix}-tooltip-row`);
            const cells = makeElement(rows, 'span', d => d, `${config.classPrefix}-tooltip-content`);
            cells.attr('class', `${config.classPrefix}-tooltip-content`);
            setStyles(rows, {
                margin: rowMargin
            });
            setStyles(cells, {
                display: 'inline-block',
                'margin-right': `${config.spacing}px`
            });
            cells.each(function (d) {
                const el = selectElement(this);
                el.html('');
                if (d instanceof Object) {
                    if (d.type === 'icon') {
                        const svg = makeElement(el, 'svg', [1]);
                        const path = makeElement(svg, 'path', [1]);
                        const shape = d.shape instanceof Function ? d.shape : getSymbol(d.shape);

                        setAttrs(svg, {
                            x: 0,
                            y: 0,
                            width: iconContainerSize,
                            height: iconContainerSize
                        });
                        setAttrs(path, {
                            d: shape.size(d.size)(),
                            transform: `translate(${iconContainerSize / 2}, ${iconContainerSize / 2})`
                        });
                        setStyles(path, {
                            fill: d.color
                        });
                    } else {
                        el.html(d.value);
                        d.className && el.classed(d.className, true);
                        setStyles(el, d.style);
                    }
                } else {
                    el.html(d);
                }
            });
        }
        return this;
    }

    clear () {
        this._model = null;
        this._mount.remove();
        return this;
    }
}
