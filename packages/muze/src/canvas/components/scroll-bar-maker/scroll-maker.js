import {
    scrollContainerHelper,
    registerListeners
} from './helper';

export class ScrollMaker {

    constructor () {
        this._components = {};
        this._logicalSpace = {};
    }

    logicalSpace (...l) {
        if (l.length) {
            this._logicalSpace = l[0];
        }
        return this._logicalSpace;
    }

    createScroll (mountPoint, config, dimensions) {
        return { scrollBarContainer: scrollContainerHelper(mountPoint, config, dimensions, this.constructor.type()) };
    }
    getLogicalSpace () {
        return this.logicalSpace();
    }

    registerListeners () {
        registerListeners(this);
    }
}

