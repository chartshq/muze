import GenericSideEffect from './generic';

export default class SurrogateSideEffect extends GenericSideEffect {
    fadeOutSelection (set) {
        const context = this.firebolt.context;
        context.fadeOutSelection(set);
    }

    unfadeSelection (set) {
        const context = this.firebolt.context;
        context.unfadeSelection(set);
    }

    highlightPoint (set) {
        const context = this.firebolt.context;
        context.highlightPoint(set);
    }

    dehighlightPoint (set) {
        const context = this.firebolt.context;
        context.dehighlightPoint(set);
    }

    focusSelection (set) {
        const context = this.firebolt.context;
        context.focusSelection(set);
    }

    focusOutSelection (set) {
        const context = this.firebolt.context;
        context.focusOutSelection(set);
    }

    resetPoint (set) {
        const context = this.firebolt.context;
        context.resetPoint(set);
    }
}
