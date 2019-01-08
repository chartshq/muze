export default class DefinitionModel {
    constructor (config) {
        this._host = config.host || null;
        this._cut = config.cut || null;
        this._ratioWeight = config.ratioWeight === 0 ? 0 : config.ratioWeight || 1;
        this._preferred = config.preferred || false;
        this._lanes = config.lanes || [];
        this._remainingHeight = 0;
        this._remainingWidth = 0;
    }

    host (host) {
        if (host) {
            this._host = host;
        }
        return this._host;
    }

    preferred (preferred) {
        if (preferred) {
            this._preferred = preferred;
        }
        return this._preferred;
    }

    cut (cut) {
        if (cut) {
            this._cut = cut;
        }
        return this._cut;
    }

    ratioWeight (ratioWeight) {
        if (ratioWeight) {
            this._ratioWeight = ratioWeight;
        }
        return this._ratioWeight;
    }

    lanes (lanes) {
        if (lanes) {
            this._lanes = lanes;
        }
        return this._lanes;
    }

    remainingHeight (remainingHeight) {
        if (remainingHeight) {
            this._remainingHeight = remainingHeight;
        }
        return this._remainingHeight;
    }

    remainingWidth (remainingWidth) {
        if (remainingWidth) {
            this._remainingWidth = remainingWidth;
        }
        return this._remainingWidth;
    }
}
