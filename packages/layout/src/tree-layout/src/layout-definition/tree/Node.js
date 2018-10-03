import { getNodeId } from '../utils';

class Node {
    constructor (data) {
        this.model = data;
        this.parent = null;
        this.children = [];

        this.boundBox = {
            top: null,
            left: null,
            height: null,
            width: null
        };

        this._id = getNodeId();
    }

    addChildren (entries) {
        this.children.push(...entries);
        entries.forEach((e) => { e.parent = this; });
    }

    isRoot () {
        return this.parent === null;
    }

    isLeaf () {
        return !this.children.length;
    }

    getCutType () {
        return this.model.cut;
    }

    isPreferred () {
        return !!this.model.preferred;
    }

  /**
     * function to search a node and update it with the config provided.
     * @param  {Object} nodeconfig
     */
    updateNode (nodeconfig) {
        if (this._id === nodeconfig._id) {
            this.model.cut = nodeconfig.cut;
            this.model.ratioWeight = nodeconfig.ratioWeight;
        } else {
            this.children.forEach((node) => {
                if (node._id === nodeconfig._id) {
                    node.model.cut = nodeconfig.cut;
                    node.model.ratioWeight = nodeconfig.ratioWeight;
                    return;
                }
                this.searchNode(node, nodeconfig);
            });
        }
    }

  // Recursive function to search a node
    searchNode (node, nodeconfig) {
        node.children.forEach((node1) => {
            if (node1._id === nodeconfig._id) {
                node1.model.cut = nodeconfig.cut;
                node1.model.ratioWeight = nodeconfig.ratioWeight;
            } else {
                this.searchNode(node1, nodeconfig);
            }
        });
    }

  /**
     * function to delete a node from tree Structure.
     * @param  {String} nodeId - node Id of the Node
     */
    delete (nodeId) {
        this.children.forEach((node) => {
            if (node._id === nodeId) {
                const index = this.children.indexOf(node);
                this.model.lanes.splice(index, 1);
            }
            this.deleteSearchNode(node, nodeId);
        });
    }

  // Recursive function to search a node
    deleteSearchNode (node, nodeId) {
        node.children.forEach((node1) => {
            if (node1._id === nodeId) {
                const index = node.children.indexOf(node1);
                node.model.lanes.splice(index, 1);
            } else {
                this.deleteSearchNode(node1, nodeId);
            }
        });
    }
}

export default Node;
