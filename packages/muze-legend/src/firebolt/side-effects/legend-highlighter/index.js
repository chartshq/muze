import { GenericSideEffect } from '@chartshq/muze-firebolt';
import { strategies } from './strategies';
import { Highlighter } from '../../../enums/side-effects';

export default class LegendHighlighter extends GenericSideEffect {
    constructor (...params) {
        super(...params);
        this._strategies = strategies(this.firebolt);
        this._strategy = 'brighten';
    }

    static formalName () {
        return Highlighter;
    }

    apply (selectionSet, payload, options = {}) {
        const strategy = this._strategies[options.strategy || this._strategy];

        strategy(selectionSet, this);
    }
}
