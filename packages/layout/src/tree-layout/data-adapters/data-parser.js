import { getnodePoints } from './helper';

export class DataParser {
    constructor (data) {
        this._data = data;
    }

    defaultDataPointLogic () {
        const nodepoints = [];
        getnodePoints(this._data, nodepoints);
        return nodepoints;
    }

}
