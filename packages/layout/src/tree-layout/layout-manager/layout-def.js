import { sanitizeConfig } from './helper';

export class LayoutDef {
    constructor () {
        this._componentMap = new Map();
        this._layoutDefinition = null;
    }

    addComponent (component) {
        this._componentMap.set(component.name(), component);
    }

    layoutDefinition (def) {
        if (def) {
            this._layoutDefinition = def;
        }
        return this._layoutDefinition;
    }

    addMultipleComponent (componentArray) {
        componentArray.forEach((comp) => {
            this.addComponent(comp);
        });
    }

    sanitizedDefinition () {
        sanitizeConfig(this, this._layoutDefinition);
        return this.layoutDefinition();
    }

    componentMap () {
        return this._componentMap;
    }
    resetComponentMap () {
        this._componentMap.clear();
    }
}
