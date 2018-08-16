import { Tooltip as TooltipRenderer } from 'muze-tooltip';
import { FieldType } from 'muze-utils';
import { spaceOutBoxes } from '../helper';

import { FRAGMENTED } from '../../enums/constants';
import SpawnableSideEffect from '../spawnable';

export default class Tooltip extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        this._tooltips = {};
    }

    static defaultConfig () {
        return {
            padding: 5
        };
    }

    static formalName () {
        return 'tooltip';
    }

    apply (selectionSet, payload) {
        let totalHeight = 0;
        let totalWidth = 0;
        const dataModel = selectionSet.mergedEnter.model;
        const drawingInf = this.drawingContext()();
        if (payload.criteria && dataModel && dataModel.isEmpty()) {
            return this;
        }
        if (payload.criteria === null || !dataModel) {
            this.hide(drawingInf);
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
        const plotDimensions = this.marksFromIdentifiers()(payload.criteria);
        const sourceInf = this.sourceInf()();
        const fields = sourceInf.fields;
        const xField = `${fields.x[0]}`;
        const fieldsConfig = dataModel.getFieldsConfig();
        const xFieldDim = fieldsConfig[xField] && fieldsConfig[xField].def.type === FieldType.DIMENSION;
        const showVertically = !!xFieldDim;
        const tooltipPos = payload.position;
        const boxes = [];
        const fragmented = config.mode === FRAGMENTED;
        const enter = {};

        if (fragmented) {
            const uids = dataModel.getData().uids;
            dataModels.push(...uids.map(d => dataModel.select((fieldsArr, i) => i === d, {
                saveChild: false
            })));
        }
        else {
            dataModels.push(dataModel);
        }
        // Show tooltip for each datamodel
        for (let i = 0; i < dataModels.length; i++) {
            const dt = dataModels[i];
            enter[i] = true;
            const tooltipInst = tooltips[i] = tooltips[i] || new TooltipRenderer(drawingInf.htmlContainer,
                    drawingInf.svgContainer);
            tooltipInst.context(sourceInf);
            const plotDim = plotDimensions[i];
            tooltipInst.data(dt)
                            .config(this.config())
                            .extent({
                                x: 0,
                                y: 0,
                                width: drawingInf.width,
                                height: drawingInf.height
                            });

            if (showInPosition) {
                tooltipInst.position(tooltipPos.x + pad, tooltipPos.y + pad);
            } else if (plotDim) {
                tooltipInst.positionRelativeTo({
                    x: plotDim.x + drawingInf.xOffset,
                    y: plotDim.y + drawingInf.yOffset,
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
            if (!(key in enter)) {
                tooltips[key].remove();
                delete tooltips[key];
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

    hide () {
        const tooltips = this._tooltips;
        for (const key in tooltips) {
            if ({}.hasOwnProperty.call(tooltips, key)) {
                tooltips[key].hide();
            }
        }
    }
}
