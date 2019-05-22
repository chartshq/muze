import SurrogateSideEffect from '../surrogate';
import { strategies } from './strategy';
import { HIGHLIGHTER } from '../../enums/side-effects';

export default class PlotHighlighter extends SurrogateSideEffect {
    constructor (...params) {
        super(...params);
        this._strategy = 'highlight';
        this._strategies = strategies;
    }

    static formalName () {
        return HIGHLIGHTER;
    }

    static target () {
        return 'visual-unit';
    }

    apply (selectionSet, payload, options = {}) {
        const strategy = this._strategies[options.strategy || this._strategy];

        strategy(selectionSet, this, options.strategy || this._strategy);

        return this;
    }
}
