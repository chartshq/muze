import SurrogateSideEffect from '../surrogate';
import { strategies } from './strategy';

export default class PlotHighlighter extends SurrogateSideEffect {
    constructor (...params) {
        super(...params);
        this._strategy = 'highlight';
    }

    static formalName () {
        return 'highlighter';
    }

    static target () {
        return 'visual-unit';
    }

    setStrategy (strategy) {
        this._strategy = strategy;
        return this;
    }

    apply (selectionSet, payload, options = {}) {
        const strategy = strategies[options.strategy || this._strategy];

        if (selectionSet.isSourceFieldPresent !== false) {
            strategy(selectionSet, this, options.strategy || this._strategy);
        }

        return this;
    }
}
