import SurrogateSideEffect from '../surrogate';
import { AXIS_LABEL_HIGHLIGHTER } from '../../enums/side-effects';
import './styles.scss';

export default class AxisLabelHighLighter extends SurrogateSideEffect {
    static formalName () {
        return AXIS_LABEL_HIGHLIGHTER;
    }

    static target () {
        return 'visual-unit';
    }

    apply (selectionSet) {
        const firebolt = this.firebolt;
        const context = firebolt.context;
        const selectedData = selectionSet.mergedEnter.model.getData().data;
        const selectedDataValues = selectedData.length ? selectedData[0] : [];
        const { x = [], y = [] } = context.axes();
        [...x, ...y].forEach((axis) => {
            const fieldMeta = selectionSet.mergedEnter.model.getFieldsConfig()[axis.config().field];
            const { selectionSet: selectedElements,
                        rejectionSet } = axis.getTicksBasedOnData(
                            selectedDataValues[fieldMeta && fieldMeta.index ? fieldMeta.index : undefined]);
            selectedElements && selectedElements.selectAll('text').classed('muze-axis-ticks-highlight', true);
            rejectionSet.selectAll('text').classed('muze-axis-ticks-highlight', false);
        });
    }
}
