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

    apply (selectionSet, payload, strategyName) {
        const strategy = strategies[strategyName || this._strategy];

        if (selectionSet.isSourceFieldPresent !== false) {
            strategy(selectionSet, this);
        }

        return this;
    }
}
