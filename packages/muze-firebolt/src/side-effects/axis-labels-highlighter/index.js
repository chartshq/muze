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

    apply (selectionSet, payload) {
        const firebolt = this.firebolt;
        const context = firebolt.context;
        const newstyles = {
            highlight: {

            },
            unHighlight: {

            }
        };

        const selectedData = selectionSet.mergedEnter.model.getData().data[0];

        const { x, y } = context.axes();

        [...x, ...y].forEach((axis) => {
            if (axis.constructor.type() === 'band') {
                const { selectionSet: selectedElements,
                        rejectionSet } = axis.getTicksBasedOnData(selectedData, newstyles);
                selectedElements.selectAll('text').classed('muze-axis-ticks-highlight', true);
                rejectionSet.selectAll('text').classed('muze-axis-ticks-highlight', false);
            }
        });
    }
}
