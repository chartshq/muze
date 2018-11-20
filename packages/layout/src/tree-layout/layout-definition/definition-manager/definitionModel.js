export default class DefinitionModel {
    constructor (host, cut, ratioWeight, preferred, lanes) {
        this._host = host || null;
        this._cut = cut || null;
        this._ratioWeight = ratioWeight === 0 ? 0 : ratioWeight || 1;
        this._preferred = preferred || false;
        this._lanes = lanes || [];
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
