import { DEFAULT_CLASS_NAME } from '../constants/defaults'
;

export default class DataPoint {
    constructor (node) {
        this._node = node;
        this._className = node.model().host() && node.model().host().className ?
                            node.model().host().className : DEFAULT_CLASS_NAME;
    }

    node () {
        return this._node;
    }

    hasHost () {
        return this._node.model().host() !== null;
    }

    className () {
        return this._className;
    }
}
