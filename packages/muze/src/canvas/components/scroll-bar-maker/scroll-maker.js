import { mergeRecursive, ERROR_MSG } from 'muze-utils';
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

    static type () {
        throw new ERROR_MSG('Method not implemented');
    }

    emptyScrollAreaClick () {
        throw new ERROR_MSG('Method not implemented');
    }

    changeMoverPosition () {
        throw new ERROR_MSG('Method not implemented');
    }

    config (...c) {
        if (c.length) {
            this._config = mergeRecursive(this._config, c[0]);
            return this;
        }
        return this._config;
    }

    scrollBarManager (...manager) {
        if (manager.length) {
            this._scrollBarManager = manager[0];
            return this;
        }
        return this._scrollBarManager;
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

