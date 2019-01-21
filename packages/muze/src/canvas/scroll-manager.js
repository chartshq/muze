export class ScrollManager {

    constructor () {
        this._scrollBarComponents = {};
        this._attachedComponents = {};
    }

    scrollBarComponents (...sbc) {
        if (sbc.length) {
            this._scrollBarComponents = sbc[0];
            return this;
        }
        return this._scrollBarComponents;
    }

    attachedComponents (...abc) {
        if (abc.length) {
            this._attachedComponents = abc[0];
            return this;
        }
        return this._attachedComponents;
    }

    performAttachedScrollFunction (type, movedViewLength) {
        Object.values(this.attachedComponents()).forEach((e) => {
            e.performScrollAction(type, movedViewLength);
        });
    }

    triggerScrollBarAction (type, delta) {
        this.scrollBarComponents()[type] && this.scrollBarComponents()[type].scrollDeltaTo(delta);
    }
}
