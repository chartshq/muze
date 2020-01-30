import { FieldType, ReservedFields } from 'muze-utils';
import { spaceOutBoxes } from '../helper';
import { FRAGMENTED_TOOLTIP } from '../../enums/side-effects';
import Tooltip from '../tooltip';

export default class FragmentedTooltip extends Tooltip {
    static formalName () {
        return FRAGMENTED_TOOLTIP;
    }

    createTooltip (dataModel, props) {
        let totalHeight = 0;
        let totalWidth = 0;
        const config = this.config();
        const { strategy } = props;
        const context = this.firebolt.context;
        const drawingInf = this.drawingContext();

        const tooltips = this._tooltips;
        const boundBox = {
            width: drawingInf.width,
            height: drawingInf.height
        };
        const pad = config.padding;
        const dataModels = [];
        const sourceInf = context.getSourceInfo();
        const fields = sourceInf.fields;
        const xFieldDim = fields.x[0] ? fields.x[0].type() === FieldType.DIMENSION : false;
        const showVertically = !!xFieldDim;
        const boxes = [];
        const uids = dataModel.getUids();

        dataModels.push(...uids.map(uid => dataModel.select(fieldsArr =>
            fieldsArr[ReservedFields.ROW_ID].value === uid, {
                saveChild: false
            })));

        const enter = {};
        for (let i = 0, len = dataModels.length; i < len; i++) {
            const dm = dataModels[i];
            const dimensions = dm.getData().schema.filter(d => d.type === FieldType.DIMENSION).map(d => d.name);
            const plotDim = context.getPlotPointsFromIdentifiers(dm.project(dimensions), { getBBox: true });

            super.createTooltip(dm, props, plotDim, i);
            const tooltipInst = this._tooltips[i];
            enter[i] = this._tooltips[i];

            const position = tooltipInst._position;
            const tooltipBoundBox = tooltipInst._tooltipContainer.node().getBoundingClientRect();

            totalHeight += tooltipBoundBox.height + pad;
            totalWidth += tooltipBoundBox.width + pad;

            if (showVertically ? totalHeight > drawingInf.height : totalWidth > drawingInf.width) {
                break;
            }

            position && boxes.push({
                x: position.x,
                y: position.y,
                width: tooltipBoundBox.width,
                height: tooltipBoundBox.height,
                tooltip: tooltipInst
            });
        }

        for (const key in tooltips) {
            if (!enter[key]) {
                const tooltip = tooltips[key];
                tooltip.content(strategy, null);
                if (!tooltip.getContents().length) {
                    tooltip.remove();
                    delete tooltips[key];
                }
            }
        }

        boxes.length && spaceOutBoxes(boxes, boundBox, showVertically);
        boxes.forEach(box => box.tooltip.position(box.x, box.y, {
            repositionArrow: true
        }));

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
