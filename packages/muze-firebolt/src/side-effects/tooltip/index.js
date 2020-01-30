import { Tooltip as TooltipRenderer } from '@chartshq/muze-tooltip';
import { mergeRecursive, defaultValue } from 'muze-utils';
import { strategies } from './strategies';
import { TOOLTIP } from '../../enums/side-effects';
import SpawnableSideEffect from '../spawnable';

import './styles.scss';
import { HIGHLIGHT_SUMMARY } from '../../enums/tooltip-strategies';
import { shouldApplySideEffect } from '../helper';

const configResolvers = {
    [HIGHLIGHT_SUMMARY]: (specificConf, config) => defaultValue(specificConf, config),
    default: specificConf => defaultValue(specificConf, {})
};

const sanitizeConfig = (config, context) => {
    const strategyObj = context._strategies;
    const sanitizedConf = Object.assign({}, config);
    for (const key in strategyObj) {
        sanitizedConf[key] = defaultValue(configResolvers[key], configResolvers.default)(config[key], config);
    }
    return sanitizedConf;
};

export default class Tooltip extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        this._tooltips = {};
        this._strategies = mergeRecursive({}, strategies);
        this._strategy = HIGHLIGHT_SUMMARY;
    }

    static defaultConfig () {
        return {
            padding: 5,
            offset: {
                x: 0,
                y: 0
            },
            highlightSummary: {
                order: 1,
                dataTransform: (dm, fields) => (fields ? dm.project(fields, { saveChild: false }) : dm)
            },
            selectionSummary: {
                order: 0,
                dataTransform: dm => dm
            }
        };
    }

    static formalName () {
        return TOOLTIP;
    }

    config (...params) {
        if (params.length) {
            const config = this._config = mergeRecursive(this._config, sanitizeConfig(params[0], this));
            const strategyObj = this._strategies;
            for (const key in strategyObj) {
                const formatter = config[key].formatter;
                this.setStrategy(key, formatter);
            }
            return this;
        }
        return this._config;
    }

    apply (selectionSet, payload, options = {}) {
        const dataModel = selectionSet && selectionSet.mergedEnter.model;
        if (!shouldApplySideEffect(dataModel, this)) {
            return this;
        }
        if ((payload.criteria === null || (dataModel && dataModel.isEmpty())) || selectionSet === null) {
            this.hide(options, null);
            return this;
        }

        const strategy = defaultValue(options.strategy, this._strategy);

        this.createTooltip(dataModel, Object.assign({}, {
            payload,
            selectionSet,
            strategy,
            options
        }), null, 0);

        return this;
    }

    static target () {
        return 'all';
    }

    hide (options) {
        const tooltips = this._tooltips;
        const { orientation } = this.config();

        for (const key in tooltips) {
            if ({}.hasOwnProperty.call(tooltips, key)) {
                const tooltip = tooltips[key];
                const strategy = options.strategy || this._strategy;
                tooltip.content(strategy, null);
                if (!Object.keys(tooltip._contents).length) {
                    tooltip.hide();
                } else {
                    tooltip.positionRelativeTo(tooltip._target, {
                        orientation
                    });
                }
            }
        }
    }

    getPlotPointsFromIdentifiers (payload) {
        const target = payload.target;
        // if (target) {
        //     targetFields = target[0] || [];
        //     const sourceFields = payload.sourceFields;
        //     const indices = [];
        //     for (let i = 0, len = targetFields.length; i < len; i++) {
        //         if (sourceFields.indexOf(targetFields[i]) !== -1) {
        //             indices.push(i);
        //         }
        //     }
        //     target = target.map(d => d.filter((v, i) => indices.indexOf(i) !== -1));
        // }

        return super.plotPointsFromIdentifiers(target || payload.criteria, {
            getBBox: true
        });
    }

    createTooltip (dataModel, props = {}, plotDim, key) {
        const drawingInf = this.drawingContext();
        const sourceInf = this.sourceInfo();
        const config = this.config();
        const {
            strategy,
            payload,
            selectionSet
        } = props;
        plotDim = defaultValue(plotDim, this.getPlotPointsFromIdentifiers(payload));
        plotDim = plotDim && plotDim[0];
        const pad = config.padding;
        const { showInPosition, position: tooltipPos } = payload;
        const { fields: projectFields, dataTransform } = config[strategy];

        const strategyFn = this._strategies[strategy];
        const dt = dataTransform(dataModel, projectFields, this);
        const { parentContainer: layoutContainer, parentContainerDimensions } = drawingInf;
        const layoutBoundBox = layoutContainer.getBoundingClientRect();
        const unitBoundBox = drawingInf.htmlContainer.getBoundingClientRect();

        const offsetLeft = unitBoundBox.left - layoutBoundBox.left;
        const offsetTop = unitBoundBox.top - layoutBoundBox.top;
        const tooltipInst = this._tooltips[key] = this._tooltips[key] || new TooltipRenderer(layoutContainer,
            drawingInf.svgContainer);

        Object.assign(sourceInf, {
            payload,
            firebolt: this.firebolt,
            detailFields: [],
            timeDiffs: sourceInf.timeDiffs,
            valueParser: this.valueParser(),
            selectionSet,
            config: config[strategy]
        });

        tooltipInst.context(sourceInf);
        tooltipInst.content(strategy, dt, {
            formatter: strategyFn,
            order: config[strategy].order,
            className: config[strategy].className
        })
                        .config(this.config())
                        .extent({
                            x: 0,
                            y: 0,
                            width: parentContainerDimensions.width,
                            height: parentContainerDimensions.height
                        })
                        .offset({
                            x: offsetLeft + (config.offset.x || 0),
                            y: offsetTop + (config.offset.y || 0)
                        });

        if (showInPosition) {
            tooltipInst.position(tooltipPos.x + pad, tooltipPos.y + pad);
        } else if (plotDim) {
            tooltipInst.positionRelativeTo({
                x: plotDim.x,
                y: plotDim.y,
                width: plotDim.width || 0,
                height: plotDim.height || 0
            }, {
                orientation: config.orientation
            }
            );
        } else {
            tooltipInst.hide();
        }
    }
}
