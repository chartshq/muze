import Node from '../tree';
import {
  xExtraSpace,
  yExtraSpace,
  determineBoundBox
} from '../utils';

class LayoutModel {
    constructor (measurements, config) {
        this.measurements = measurements;
        this.config = config;
        this.root = this.createTree(this.config, null);
        this.setBoundBox();
    }

    createTree (config, parent) {
        const node = new Node(config);
        if (parent) {
            node._parentCut = parent.getCutType();
            parent.addChildren([node]);
        } else {
            this.root = node;
        }
        for (const lane of config.lanes) {
            this.createTree(lane, node);
        }

        return this.root;
    }

    allocateBoundingBox (node) {
        const totalWeight = node.children
      .map(child => child.model.ratioWeight)
      .reduce((carry, val) => carry + val, 0);

        node.children.forEach((child, i, children) => {
            const lastSibling = children[i - 1];
            const ratio = child.model.ratioWeight / totalWeight;

            if (child._parentCut === 'h') {
                child.boundBox.width = child.parent.boundBox.width;
                child.boundBox.height = child.parent.boundBox.height * ratio;
                child.boundBox.left = child.parent.boundBox.left;
                child.boundBox.top = i ? lastSibling.boundBox.top + lastSibling.boundBox.height : 0;
            } else {
                child.boundBox.width = child.parent.boundBox.width * ratio;
                child.boundBox.height = child.parent.boundBox.height;
                child.boundBox.top = child.parent.boundBox.top;
                child.boundBox.left = i ? lastSibling.boundBox.left + lastSibling.boundBox.width : 0;
            }
            this.allocateBoundingBox(child);
        });
    }

    setBoundBox () {
        this.root.boundBox = {
            top: 0,
            left: 0,
            width: this.measurements.width,
            height: this.measurements.height
        };
        this.allocateBoundingBox(this.root);
    }

    negotiateDimension (node) {
        let preferred;
        let cumultiveExtraSpaceAmt = 0;
        let alteredDim;
        let nonAlteredDim;
        const childrenLength = node.children.length;

        for (let index = 0; index < childrenLength; index++) {
            let fn;
            let extraSpaceAmt;
            const child = node.children[index];

            if (child._parentCut === 'h') {
                fn = yExtraSpace;
                alteredDim = 'height';
                nonAlteredDim = 'width';
            } else {
                fn = xExtraSpace;
                alteredDim = 'width';
                nonAlteredDim = 'height';
            }
      // if vertical then get extra height from other node and push it to the preferred node.
      // for horizontal cut the same thing is to be done with width
            if (child.isPreferred()) {
        // push extra space in sink. Execute it when all non preferred space are computed.
                preferred = child;

                continue; // eslint-disable-line no-continue
            }
      // reduce own height and save it in a var
            cumultiveExtraSpaceAmt += (extraSpaceAmt = fn(child));
            child.boundBox[alteredDim] -= extraSpaceAmt;
      // update nonaltered dim from parent for any change which happened during negotiation
            child.boundBox[nonAlteredDim] = child.parent.boundBox[nonAlteredDim];

            this.negotiateDimension(child);
        }

        if (preferred) {
            preferred.boundBox[alteredDim] += cumultiveExtraSpaceAmt;
            preferred.boundBox[nonAlteredDim] = preferred.parent.boundBox[nonAlteredDim];
            this.negotiateDimension(preferred);
        }
    }

    computePosition (node) {
        node.children.forEach((child, i, children) => {
            const boundBox = determineBoundBox(child.boundBox, i, children, child);
            child.boundBox = boundBox;
            this.computePosition(child);
        });
    }

    setHostPosition (node) {
        node.children.forEach((child) => {
            LayoutModel.setHostSpatialConfig(child);
            this.setHostPosition(child);
        });
    }

    static setHostSpatialConfig (node) {
        const bb = node.boundBox;
        if (node.model.host && node.model.host.setSpatialConfig) {
            const conf = {
                x: bb.left,
                y: bb.top,
                width: bb.width,
                height: bb.height,
                renderAt: node._id
            };

            node.model.host.setSpatialConfig(conf);
        }
    }

    negotiate () {
        this.negotiateDimension(this.root);
        this.computePosition(this.root);
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

export default LayoutModel;
