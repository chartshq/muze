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
        this._sanitizeConfig(this._layoutDefinition);
        return this.layoutDefinition();
    }

    _sanitizeConfig (hostObj) {
        if (hostObj.lanes() && hostObj.lanes().length) {
            hostObj.lanes().forEach(childHost => this._sanitizeConfig(childHost));
        }
        if (hostObj.host() != null && typeof (hostObj.host()) === 'string') {
            if (this._componentMap.get(hostObj.host()) !== undefined) {
                hostObj.host(this._componentMap.get(hostObj.host()));
            }
        }
    }

    componentMap () {
        return this._componentMap;
    }
}
