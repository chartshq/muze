import {
    scrollContainerHelper,
    registerListeners
} from './helper';

export class ScrollMaker {

    constructor () {
        this._components = {};
    }

    createScroll (mountPoint, config, dimensions) {
        return { scrollBarContainer: scrollContainerHelper(mountPoint, config, dimensions, this.constructor.type()) };
    }

    registerListeners () {
        registerListeners(this);
    }
}

