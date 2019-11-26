import SurrogateSideEffect from '../surrogate';
import { AXIS_LABEL_HIGHLIGHTER } from '../../enums/side-effects';

export default class AxisLabelHighLighter extends SurrogateSideEffect {
    constructor (...params) {
        super(...params);
    }

    static formalName () {
        return AXIS_LABEL_HIGHLIGHTER;
    }

    static target () {
        return 'visual-unit';
    }

    apply (selectionSet, payload, options = {}) {
        debugger;
        return this;
    }
}
