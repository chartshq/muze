import Node from '../tree';
import {
    allocateBoundingBox,
    negotiateDimension,
    computePosition
} from '../helper';

export default class LayoutModel {
    constructor (measurements, config) {
        this._measurements = measurements;
        this._config = config;
        this._root = this.createTree(this._config, null);
        this.setBoundBox();
    }

    createTree (config, parent) {
        const node = new Node(config);
        if (parent) {
            node.parentCut(parent.getCutType());
            parent.addChildren([node]);
        } else {
            this._root = node;
        }
        for (const lane of config.lanes()) {
            this.createTree(lane, node);
        }

        return this._root;
    }

    setBoundBox () {
        this._root.boundBox({
            top: 0,
            left: 0,
            width: this._measurements.width,
            height: this._measurements.height
        });
        allocateBoundingBox(this._root);
    }

    setHostPosition (node) {
        node.children().forEach((child) => {
            LayoutModel.setHostSpatialConfig(child);
            this.setHostPosition(child);
        });
    }

    static setHostSpatialConfig (node) {
        const bb = node.boundBox();
        const host = node.model().host();
        if (host && host.setSpatialConfig) {
            const conf = {
                x: bb.left,
                y: bb.top,
                width: bb.width,
                height: bb.height,
                renderAt: node.id()
            };
            host.setSpatialConfig(conf);
        }
    }

    negotiate () {
        negotiateDimension(this._root);
        computePosition(this._root);
        return this;
    }

    broadcast () {
        this.setHostPosition(this._root);
        return this;
    }

    tree () {
        return this._root;
    }
}
