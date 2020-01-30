import SurrogateSideEffect from '../surrogate';
import { AXIS_LABEL_HIGHLIGHTER } from '../../enums/side-effects';
import './styles.scss';
import { shouldApplySideEffect } from '../helper';

export default class AxisLabelHighLighter extends SurrogateSideEffect {
    static formalName () {
        return AXIS_LABEL_HIGHLIGHTER;
    }

    static target () {
        return 'visual-unit';
    }

    apply (selectionSet) {
        const context = this.firebolt.context;
        const dataModel = selectionSet && selectionSet.mergedEnter.model;
        if (!shouldApplySideEffect(dataModel, this)) {
            return this;
        }
        const selectedData = dataModel && dataModel.getData().data;
        const selectedDataValues = selectedData && selectedData.length ? selectedData[0] : [];
        const { x = [], y = [] } = context.axes();
        [...x, ...y].forEach((axis) => {
            const fieldMeta = dataModel ? dataModel.getFieldsConfig()[axis.config().field] : undefined;
            const selData = selectedDataValues[fieldMeta && fieldMeta.index !== undefined
                                                    ? fieldMeta.index : undefined];
            const { selectionSet: selectedElements, rejectionSet } = axis.getTicksBasedOnData(selData);
            selectedElements && selectedElements.selectAll('text').classed('muze-axis-ticks-highlight', true);
            rejectionSet.selectAll('text').classed('muze-axis-ticks-highlight', false);
        });

        return this;
    }
}
