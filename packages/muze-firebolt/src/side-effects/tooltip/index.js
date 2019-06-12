import { Tooltip as TooltipRenderer } from '@chartshq/muze-tooltip';
import { FieldType, mergeRecursive, defaultValue } from 'muze-utils';
import { spaceOutBoxes } from '../helper';
import { strategies } from './strategies';
import { FRAGMENTED } from '../../enums/constants';
import { TOOLTIP } from '../../enums/side-effects';
import SpawnableSideEffect from '../spawnable';

import './styles.scss';
import { HIGHLIGHT_SUMMARY } from '../../enums/tooltip-strategies';

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
                dataTransform: (dt, fields) => (fields ? dt.project(fields, { saveChild: false }) : dt
                )
            },
            selectionSummary: {
                dataTransform: (dt, fields) => {
                    const fieldspace = dt.getFieldspace();
                    const dimensions = Object.keys(fieldspace.getDimension());
                    const measures = Object.keys(fieldspace.getMeasure());
                    const projectedFields = defaultValue(fields, measures.length ? [measures[0]] : []);
                    return dt.project([...dimensions, ...projectedFields], {
                        saveChild: false
                    });
                }
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
        let totalHeight = 0;
        let totalWidth = 0;
        const dataModel = selectionSet.mergedEnter.model;
        const context = this.firebolt.context;
        const drawingInf = this.drawingContext();
        if ((dataModel.isEmpty() || payload.criteria === null)) {
            this.hide(options, null);
            return this;
        }

        const tooltips = this._tooltips;
        const config = this.config();
        const boundBox = {
            width: drawingInf.width,
            height: drawingInf.height
        };
        const showInPosition = payload.showInPosition;
        const pad = config.padding;
        const dataModels = [];
        const fragmented = config.mode === FRAGMENTED;
        const sourceInf = context.getSourceInfo();
        const fields = sourceInf.fields;
        const xFieldDim = fields.x[0] ? fields.x[0].type() === FieldType.DIMENSION : false;
        const showVertically = !!xFieldDim;
        const tooltipPos = payload.position;
        const boxes = [];
        const enter = {};
        const uids = dataModel.getData().uids;
        if (fragmented) {
            dataModels.push(...uids.map(d => dataModel.select((fieldsArr, i) => i === d, {
                saveChild: false
            })));
        } else {
            dataModels.push(dataModel);
        }

        let target = payload.target;
        let targetFields = [];
        if (target) {
            targetFields = target[0] || [];
            const sourceFields = payload.sourceFields;
            const indices = [];
            for (let i = 0, len = targetFields.length; i < len; i++) {
                if (sourceFields.indexOf(targetFields[i]) !== -1) {
                    indices.push(i);
                }
            }
            target = target.map(d => d.filter((v, i) => indices.indexOf(i) !== -1));
        }

        const plotDimensions = context.getPlotPointsFromIdentifiers(target || payload.criteria, {
            getBBox: true
        });

        const strategy = defaultValue(options.strategy, this._strategy);
        const strategyConf = config[strategy];
        const { dataTransform, fields: projectFields } = strategyConf;
        const strategyObj = this._strategies;
        // Show tooltip for each datamodel
        for (let i = 0; i < dataModels.length; i++) {
            let plotDim = plotDimensions[i];
            if (fragmented) {
                const dimensions = dataModels[i].getData().schema.filter(d => d.type === FieldType.DIMENSION)
                    .map(d => d.name);
                plotDim = context.getPlotPointsFromIdentifiers(dataModels[i].project(dimensions), { getBBox: true });
                plotDim = plotDim && plotDim[0];
            }

            const dt = dataTransform(dataModels[i], projectFields, this);

            enter[i] = true;
            const { parentContainer: layoutContainer, parentContainerDimensions } = drawingInf;
            const layoutBoundBox = layoutContainer.getBoundingClientRect();
            const unitBoundBox = drawingInf.htmlContainer.getBoundingClientRect();

            const offsetLeft = unitBoundBox.left - layoutBoundBox.left;
            const offsetTop = unitBoundBox.top - layoutBoundBox.top;
            const tooltipInst = tooltips[i] = tooltips[i] || new TooltipRenderer(layoutContainer,
                    drawingInf.svgContainer);

            sourceInf.payload = payload;
            sourceInf.firebolt = this.firebolt;
            sourceInf.detailFields = context.detailFields();
            sourceInf.timeDiffs = context.timeDiffsByField();
            sourceInf.valueParser = context.valueParser();
            sourceInf.selectionSet = selectionSet;
            tooltipInst.context(sourceInf);
            const strategyFn = strategyObj[strategy];
            tooltipInst.content(strategy, dt, {
                formatter: strategyFn,
                order: options.order
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
                    orientation: fragmented ?
                        (showVertically ? 'horizontal' : 'vertical') : undefined
                });
            } else {
                tooltipInst.hide();
                break;
            }

            if (fragmented) {
                const position = tooltipInst._position;
                const tooltipBoundBox = tooltipInst._tooltipContainer.node().getBoundingClientRect();

                totalHeight += tooltipBoundBox.height + pad;
                totalWidth += tooltipBoundBox.width + pad;
                if (showVertically ? totalHeight > drawingInf.height : totalWidth > drawingInf.width) {
                    break;
                }
                boxes.push({
                    x: position.x,
                    y: position.y,
                    width: tooltipBoundBox.width,
                    height: tooltipBoundBox.height,
                    tooltip: tooltipInst
                });
            }
        }

        for (const key in tooltips) {
            if (!enter[key]) {
                const tooltip = tooltips[key];
                tooltip.content(payload.action, null);
                if (!tooltip.getContents().length) {
                    tooltip.remove();
                    delete tooltips[key];
                }
            }
        }
        if (fragmented) {
            spaceOutBoxes(boxes, boundBox, showVertically);
            boxes.forEach(box => box.tooltip.position(box.x, box.y, {
                repositionArrow: true
            }));
        }
        return this;
    }

    hide (options) {
        const tooltips = this._tooltips;
        for (const key in tooltips) {
            if ({}.hasOwnProperty.call(tooltips, key)) {
                const strategy = options.strategy || this._strategy;
                tooltips[key].content(strategy, null);
                tooltips[key].hide();
            }
        }
    }
}
