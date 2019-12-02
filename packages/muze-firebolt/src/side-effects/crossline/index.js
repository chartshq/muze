import { selectElement, FieldType } from 'muze-utils';

import './styles.scss';
import { CLASSPREFIX } from '../../enums/constants';
import { CROSSLINE } from '../../enums/side-effects';
import SpawnableSideEffect from '../spawnable';

export default class Crossline extends SpawnableSideEffect {
    static defaultConfig () {
        return {
            className: `${CLASSPREFIX}-crossline-group`,
            bandClass: `${CLASSPREFIX}-crossband`,
            lineClass: `${CLASSPREFIX}-crossline`
        };
    }

    static formalName () {
        return CROSSLINE;
    }

    apply (selectionSet, payload) {
        let height;
        let bandWidth;
        let px;
        let width;
        const {
            className,
            bandClass,
            lineClass
        } = this.config();
        const dataModel = selectionSet.mergedEnter.model;
        const drawingInf = this.drawingContext();
        const isEmptyDataModel = dataModel && dataModel.isEmpty();
        if (payload.criteria && isEmptyDataModel) {
            this.hide();
            return this;
        }
        if (payload.criteria === null || !dataModel) {
            this.hide();
            return this;
        }

        const dataObj = dataModel.getData();
        const sourceInf = this.firebolt.context.getSourceInfo();
        const axes = sourceInf.axes;
        const axisFields = sourceInf.fields;
        const fields = selectionSet.fields;
        const data = dataObj.data;
        const fieldsConfig = dataModel.getFieldsConfig();
        const svgContainer = drawingInf.sideEffectGroup;

        const elemData = [];
        fields.forEach((field) => {
            const fieldIndex = fieldsConfig[field] && fieldsConfig[field].index;
            const dataArr = data.map(d => d[fieldIndex]);
            const axisIndex = [['x', 0], ['x', 1], ['y', 0], ['y', 1]].find((arr) => {
                const fieldInst = axisFields[arr[0]][arr[1]];
                return fieldInst && fieldInst.type() === FieldType.DIMENSION &&
                    fieldInst.getMembers().indexOf(field) !== -1;
            });
            if (axisIndex !== undefined && data.length) {
                const type = axisIndex[0];
                const axis = axes[type][axisIndex[1]];
                const value = dataArr[0];
                bandWidth = axis.getUnitWidth() || 0;
                px = axis.getScaleValue(value) + bandWidth / 2 + drawingInf.xOffset;

                let layers = this.firebolt.context.layers();
                layers = layers.filter(layer => !!layer.config().crossline);

                if (layers.length) {
                    const plotWidth = Math.max(...layers.map(layer => layer.getPlotSpan()[type]));
                    const pad = Math.max(...layers.map(layer => layer.getPlotPadding()[type]));
                    height = drawingInf.height;
                    width = drawingInf.width;
                    const startPx = px - plotWidth / 2 - pad / 2;
                    const endPx = px + plotWidth / 2 + pad / 2;
                    const dataPoint = {};
                    if (type === 'y') {
                        dataPoint.d = `M 0 ${startPx} L 0 ${endPx} L ${width} ${endPx} L ${width} ${startPx} Z`;
                    } else {
                        dataPoint.d = `M ${startPx} 0 L ${endPx} 0 L ${endPx} ${height} L ${startPx} ${height} Z`;
                    }
                    dataPoint.className = plotWidth ? bandClass : lineClass;
                    !isNaN(px) && elemData.push(dataPoint);
                }
            }
        });
        if (elemData.length) {
            const parentGroup = this.createElement(svgContainer, 'g', [1], className);
            const elem = this.createElement(parentGroup, 'path', elemData);
            elem.attr('d', d => d.d).style('pointer-events', 'none')
                            .attr('class', d => d.className);
        }
        return this;
    }

    hide () {
        const className = this.config().className;
        const drawingInf = this.drawingContext();
        selectElement(drawingInf.sideEffectGroup).selectAll(`.${className}`).remove();
    }

    static target () {
        return 'visual-unit';
    }
}
