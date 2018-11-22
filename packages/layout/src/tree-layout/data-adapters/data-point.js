import { DEFAULT_CLASS_NAME } from '../constants/defaults';
import { LayoutComponent } from '../layout-component';

export default class DataPoint {
    constructor (node) {
        this._node = node;
        this._className = node.model().host() instanceof LayoutComponent ?
                            node.model().host().className() : DEFAULT_CLASS_NAME;
    }

    node () {
        return this._node;
    }

    hasHost () {
        return this._node.model().host() instanceof LayoutComponent;
    }

    className () {
        return this._className || DEFAULT_CLASS_NAME;
    }
}
