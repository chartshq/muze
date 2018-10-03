import { DataPoint } from './data-point';

export class DataParser {
    constructor (data) {
        this.data = data;
    }

    defaultDataPointLogic () {
        const nodepoints = [];
        this.getnodePoints(this.data, nodepoints);
        return nodepoints;
    }

    getnodePoints (node, nodepoints) {
        const datapoint = new DataPoint(node);
        nodepoints.push(datapoint);
        node.children.forEach((child) => {
            this.getnodePoints(child, nodepoints);
        });
    }
}
