export class ScrollManager {

    constructor () {
        this._scrollBarComponent = {};
        this._attachedComponents = {};
    }

    scrollBarComponent (...sbc) {
        if (sbc.length) {
            this._scrollBarComponent = sbc[0];
            return this;
        }
        return this._scrollBarComponent;
    }

    attachedComponents (...abc) {
        if (abc.length) {
            this._attachedComponents = abc[0];
            return this;
        }
        return this._attachedComponents;
    }

    manageScrollBarAction () {}

    triggerScrollBarAction () {}
}
