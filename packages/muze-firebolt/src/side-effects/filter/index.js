import SurrogateSideEffect from '../surrogate';

export default class FilterEffect extends SurrogateSideEffect {
    static formalName () {
        return 'filter';
    }

    static target () {
        return 'visual-unit';
    }

    apply (selectionSet, payload) {
        const context = this.firebolt.context;
        const entryModel = selectionSet.mergedEnter.model;
        if (payload.criteria === null) {
            context.clearCaching().resetData();
        }
        else {
            context.enableCaching().data(entryModel);
        }
        return this;
    }
}
