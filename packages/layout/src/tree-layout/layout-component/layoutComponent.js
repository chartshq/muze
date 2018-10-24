export default class LayoutComponent {
    constructor (name, dimensions, seed) {
        this.seed = seed;
        this.boundBox = {};
        this.boundBox.height = dimensions.height;
        this.boundBox.width = dimensions.width;
        this.boundBox.top = null;
        this.boundBox.left = null;
        this.renderAt = null;
        this.alignWith = null;
        this.alignment = null;
        this.target = null;
        this.position = null;
        this.componentName = name;
    }

    getLogicalSpace () {
        throw new Error('getLogicalSpace is not defined');
    }

    setSpatialConfig (conf) {
        throw new Error('setSpatialSpace is not defined');
    }

    name (param) {
        if (param) {
            this.componentName = param;
        } else {
            return this.componentName;
        }
        return undefined;
    }

    draw () {
        throw new Error('draw is not defined');
    }
  }
