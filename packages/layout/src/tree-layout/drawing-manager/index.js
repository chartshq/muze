import { Utils } from '../utils';
import { drawLayout, resolveAligment, drawComponent } from './helper';

export class DrawingManager {
    constructor (data, renderer, container) {
        this._data = data.tree;
        this._componentMap = data.componentMap;
        this._layoutClassName = data.layoutClassName;
        this._renderer = renderer;
        this._mount = Utils.isDOMElement(container) ? container : Utils.getElement(container);
    }

    draw () {
        drawLayout(this);
        resolveAligment(this, this._data);
        drawComponent(this._data);
        return this;
    }

    data (data) {
        if (data) {
            this._data = data;
        }
        return this._data;
    }

    componentMap (param) {
        if (param) {
            this._componentMap = param;
        }
        return this._componentMap;
    }

    className (param) {
        if (param) {
            this._layoutClassName = param;
        }
        return this._layoutClassName;
    }

    renderer (param) {
        if (param) {
            this._renderer = param;
        }
        return this._renderer;
    }

    mount (param) {
        if (param) {
            this._mount = param;
        }
        return this._mount;
    }
}
