import LayoutComponent from './layoutComponent';

class DummyComponent extends LayoutComponent {
    constructor (seed, dimensions) {
        super(seed, dimensions);
        this.seed = seed;
    }

    getLogicalSpace () {
        return {
            width: this.boundBox.width - (2 * this.seed),
            height: this.boundBox.height - (2 * this.seed)
        };
    }

    setSpatialConfig (conf) {
        this.boundBox.top = conf.y;
        this.boundBox.left = conf.x;

        this.boundBox.newDimensions = {
            width: conf.width,
            height: conf.height
        };
        this.renderAt = conf.renderAt;
    }

    set componentName (name) {
        this._componentName = name;
    }

    get componentName () {
        return this._componentName;
    }

    set chartComponent (componentObj) {
        this._component = componentObj;
    }

    get chartComponent () {
        return this._chartComponent;
    }

    draw () {
        if (!this.component) {
            throw new Error(`Component not set for ${this.componentName}`);
        }
        this.component.mount(document.getElementById(this.renderAt)); // Change the draw method to component draw
    }
}

export default DummyComponent;
