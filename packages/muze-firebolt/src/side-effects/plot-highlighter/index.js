import SurrogateSideEffect from '../surrogate';
import { strategies } from './strategy';

export default class PlotHighlighter extends SurrogateSideEffect {
    constructor (...params) {
        super(...params);
        this._strategy = 'highlight';
        this._strategies = strategies;
    }

    static formalName () {
        return 'highlighter';
    }

    static target () {
        return 'visual-unit';
    }

    apply (selectionSet, payload, options = {}) {
        const strategy = this._strategies[options.strategy || this._strategy];

        if (selectionSet.isSourceFieldPresent !== false) {
            strategy(selectionSet, this, options.strategy || this._strategy);
        }

        return this;
    }
}
