import Node from '../tree';
import {
    allocateBoundingBox,
    negotiateDimension,
    computePosition
} from '../helper';

export default class LayoutModel {
    constructor (measurements, config) {
        this.measurements = measurements;
        this.config = config;
        this.root = this.createTree(this.config, null);
        this.setBoundBox();
    }

    createTree (config, parent) {
        const node = new Node(config);
        if (parent) {
            node.parentCut(parent.getCutType());
            parent.addChildren([node]);
        } else {
            this.root = node;
        }
        for (const lane of config.lanes()) {
            this.createTree(lane, node);
        }

        return this.root;
    }

    setBoundBox () {
        this.root.boundBox({
            top: 0,
            left: 0,
            width: this.measurements.width,
            height: this.measurements.height
        });
        allocateBoundingBox(this.root);
    }

    setHostPosition (node) {
        node.children().forEach((child) => {
            LayoutModel.setHostSpatialConfig(child);
            this.setHostPosition(child);
        });
    }

    static setHostSpatialConfig (node) {
        const bb = node.boundBox();
        if (node.model().host() && node.model().host().setSpatialConfig) {
            const conf = {
                x: bb.left,
                y: bb.top,
                width: bb.width,
                height: bb.height,
                renderAt: node.id()
            };

            node.model().host().setSpatialConfig(conf);
        }
    }

    negotiate () {
        negotiateDimension(this.root);
        computePosition(this.root);
        return this;
    }

    broadcast () {
        this.setHostPosition(this.root);
        return this;
    }

    tree () {
        return this.root;
    }
}
