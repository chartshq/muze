import { mergeRecursive } from 'muze-utils';
import {
    scrollContainerHelper,
    registerListeners
} from './helper';

export class ScrollMaker {

    constructor () {
        this._components = {};
        this._logicalSpace = {};
        this._attachedScrollAction = () => {};
        this._config = {
            thickness: 20,
            speed: 2
        };
    }

    config (...c) {
        if (c.length) {
            this._config = mergeRecursive(this._config, c[0]);
            return this;
        }
        return this._config;
    }

    logicalSpace (...l) {
        if (l.length) {
            this._logicalSpace = l[0];
            return this;
        }
        return this._logicalSpace;
    }

    createScroll (mountPoint) {
        const config = this.config();
        return {
            scrollBarContainer: scrollContainerHelper(mountPoint, config, this.logicalSpace(), this.constructor.type())
        };
    }

    attachScrollAction (externalScrollAction) {
        this._attachedScrollAction = externalScrollAction;
        return this;
    }

    getLogicalSpace () {
        return this.logicalSpace();
    }

    registerListeners () {
        registerListeners(this);
    }

    remove () {
        this._components.scrollBarContainer.remove();
    }
}

