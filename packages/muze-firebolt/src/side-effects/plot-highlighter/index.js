import SurrogateSideEffect from '../surrogate';
import { strategies } from './strategy';
import { HIGHLIGHTER } from '../../enums/side-effects';
import { getFormattedSet } from './helper';

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

    getExcludeSetIds (excludeSet = []) {
        // Get excludeSetIds if excludeSet is a function
        if (excludeSet instanceof Function) {
            return excludeSet(this.firebolt.getEntryExitSet);
        }
        // Get excludeSetIds if excludeSet is not a function
        return excludeSet.reduce((acc, behaviour) => {
            const selectedPoints = this.firebolt.getEntryExitSet(behaviour) || {};
            const selectedPointsIds = (selectedPoints.mergedEnter || {}).uids;
            if (selectedPointsIds) acc.push(...selectedPointsIds);
            return acc;
        }, []);
    }

    apply (selectionSet, payload, options = {}) {
        const currentStrategy = this._strategies[options.strategy || this._strategy];
        const excludeSetIds = this.getExcludeSetIds(options.excludeSet);

        // Get all sets except the excludeSet points
        const formattedSet = {
            ...selectionSet,
            completeSet: getFormattedSet(selectionSet.completeSet, excludeSetIds),
            entrySet: getFormattedSet(selectionSet.entrySet[1], excludeSetIds),
            exitSet: getFormattedSet(selectionSet.exitSet[1], excludeSetIds),
            mergedEnter: getFormattedSet(selectionSet.mergedEnter, excludeSetIds),
            mergedExit: getFormattedSet(selectionSet.mergedExit, excludeSetIds)
        };

        currentStrategy(formattedSet, this);

        return this;
    }
}
