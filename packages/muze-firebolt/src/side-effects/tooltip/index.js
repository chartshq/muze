import { Tooltip as TooltipRenderer } from '@chartshq/muze-tooltip';
import { FieldType } from 'muze-utils';
import { spaceOutBoxes } from '../helper';
import { strategies } from './strategies';
import { FRAGMENTED } from '../../enums/constants';
import SpawnableSideEffect from '../spawnable';

import './styles.scss';

export default class Tooltip extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        this._tooltips = {};
        this._strategies = strategies;
        this._strategy = 'default';
    }

    static defaultConfig () {
        return {
            padding: 5,
            offset: {
                x: 0,
                y: 0
            }
        };
    }

    static formalName () {
        return 'tooltip';
    }

    apply (selectionSet, payload, options = {}) {
        let totalHeight = 0;
        let totalWidth = 0;
        const dataModel = selectionSet.mergedEnter.model;
        const context = this.firebolt.context;
        const drawingInf = this.drawingContext();
        if ((dataModel.isEmpty() || payload.criteria === null) || selectionSet.isSourceFieldPresent === false) {
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

        // Show tooltip for each datamodel
        for (let i = 0; i < dataModels.length; i++) {
            let plotDim = plotDimensions[i];
            if (fragmented) {
                const dimensions = dataModels[i].getData().schema.filter(d => d.type === FieldType.DIMENSION)
                    .map(d => d.name);
                plotDim = context.getPlotPointsFromIdentifiers(dataModels[i].project(dimensions), { getBBox: true });
                plotDim = plotDim && plotDim[0];
            }

            let dt = dataModels[i];
            if (config.fields) {
                dt = dt.project(config.fields, {
                    saveChild: false
                });
            }
            if (config.dataTransform) {
                dt = config.dataTransform(dt, i);
            }

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
            tooltipInst.context(sourceInf);
            const strategy = strategies[options.strategy];
            tooltipInst.content(options.strategy || this._strategy, dt, {
                formatter: strategy,
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
