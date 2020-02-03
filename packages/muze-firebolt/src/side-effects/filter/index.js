import SurrogateSideEffect from '../surrogate';

export default class FilterEffect extends SurrogateSideEffect {
    static formalName () {
        return 'filter';
    }

    static target () {
        return 'all';
    }

    static mutates () {
        return true;
    }

    apply (selectionSet, payload) {
        const firebolt = this.firebolt;
        const entryModel = selectionSet.mergedEnter.model;

        if (payload.criteria === null) {
            firebolt.resetData();
        } else {
            firebolt.data(entryModel);
        }
        return this;
    }
}
