import { ERROR_MSG, generateGetterSetters } from 'muze-utils';
import {
    scrollContainerHelper,
    registerListeners
} from './helper';
import { PROPS } from './props';

export class ScrollMaker {

    constructor () {
        this._components = {};
        this._logicalSpace = {};
        this._attachedScrollAction = () => {};
        this._config = {
            thickness: 10,
            speed: 2
        };
        this._unitPositions = null;

        generateGetterSetters(this, PROPS);
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

    scrollTo () {
        throw new ERROR_MSG('Method not implemented');
    }

    scrollDeltaTo () {
        throw new ERROR_MSG('Method not implemented');
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

    detachScrollAction () {
        this._attachedScrollAction = () => {};
        return this;
    }

    getLogicalSpace () {
        return this.logicalSpace();
    }

    registerListeners () {
        registerListeners(this);
        return this;
    }

    remove () {
        this._components.scrollBarContainer.remove();
        return this;
    }
}

