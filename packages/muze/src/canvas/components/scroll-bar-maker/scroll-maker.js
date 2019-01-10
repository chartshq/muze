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

    createScroll (mountPoint, config) {
        return {
            scrollBarContainer: scrollContainerHelper(mountPoint, config, this.logicalSpace(), this.constructor.type())
        };
    }
    getLogicalSpace () {
        return this.logicalSpace();
    }

    registerListeners () {
        registerListeners(this);
    }
}

