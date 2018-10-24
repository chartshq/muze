export default class DefinitionModel {
    constructor (host, cut, ratioWeight, preferred, lanes) {
        this.host = host || null;
        this.cut = cut || null;
        this.ratioWeight = ratioWeight === 0 ? 0 : ratioWeight || 1;
        this.preferred = preferred || false;
        this.lanes = lanes || [];
        this._remainingHeight = 0;
        this._remainingWidth = 0;
    }
}
