export default class LayoutComponent {
    constructor (name, dimensions, seed) {
        this._seed = seed;
        this._boundBox = {
            height: dimensions.height,
            width: dimensions.width,
            top: null,
            left: null
        };
        this._renderAt = null;
        this._alignWith = null;
        this._alignment = null;
        this._target = null;
        this._position = null;
        this._componentName = name;
        this._className = null;
    }

    getLogicalSpace () {
        throw new Error('getLogicalSpace is not defined');
    }

    setSpatialConfig () {
        throw new Error('setSpatialSpace is not defined');
    }

    name (param) {
        if (param) {
            this._componentName = param;
        }
        return this._componentName;
    }

    target (param) {
        if (param) {
            this._target = param;
        }
        return this._target;
    }

    position (param) {
        if (param) {
            this._position = param;
        }
        return this._position;
    }

    alignment (param) {
        if (param) {
            this._alignment = param;
        }
        return this._alignment;
    }

    alignWith (param) {
        if (param) {
            this._alignWith = param;
        }
        return this._alignWith;
    }

    renderAt (param) {
        if (param) {
            this._renderAt = param;
        }
        return this._renderAt;
    }

    boundBox (param) {
        if (param) {
            Object.assign(this._boundBox, param);
        }
        return this._boundBox;
    }

    className (param) {
        if (param) {
            this._className = param;
        }
        return this._className;
    }

    draw () {
        throw new Error('draw is not defined');
    }

    attachListener () {
        return this;
    }
  }

