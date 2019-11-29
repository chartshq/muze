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
        const context = this.firebolt.context;
        const dataModel = selectionSet && selectionSet.mergedEnter.model;
        const selectedData = dataModel && dataModel.getData().data;
        const selectedDataValues = selectedData && selectedData.length ? selectedData[0] : [];
        const { x = [], y = [] } = context.axes();

        if (dataModel) {
            [...x, ...y].forEach((axis) => {
                const fieldMeta = dataModel.getFieldsConfig()[axis.config().field];
                const selData = selectedDataValues[fieldMeta && fieldMeta.index ? fieldMeta.index : undefined];
                const { selectionSet: selectedElements, rejectionSet } = axis.getTicksBasedOnData(selData);
                selectedElements && selectedElements.selectAll('text').classed('muze-axis-ticks-highlight', true);
                rejectionSet.selectAll('text').classed('muze-axis-ticks-highlight', false);
            });
        }
    }
}
