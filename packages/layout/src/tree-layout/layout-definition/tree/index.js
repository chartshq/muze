import { getNodeId } from '../helper';
import { LayoutComponent } from '../../layout-component';

class Node {
    constructor (data) {
        this._model = data;
        this._parent = null;
        this._children = [];
        this._parentCut = null;
        this._boundBox = {
            top: null,
            left: null,
            height: null,
            width: null
        };

        this._id = this._model.host() instanceof LayoutComponent && this._model.host().renderAt() ?
                    this._model.host().renderAt() :
                    getNodeId();
    }

    addChildren (entries) {
        this._children.push(...entries);
        entries.forEach((e) => { e.parent(this); });
    }

    isRoot () {
        return this._parent === null;
    }

    isLeaf () {
        return !this._children.length;
    }

    getCutType () {
        return this._model.cut();
    }

    isPreferred () {
        return !!this._model.preferred();
    }

    children (children) {
        if (children) {
            this._children = children;
        }
        return this._children;
    }

    parent (parent) {
        if (parent) {
            this._parent = parent;
        }
        return this._parent;
    }

    parentCut (parentCut) {
        if (parentCut) {
            this._parentCut = parentCut;
        }
        return this._parentCut;
    }

    id (id) {
        if (id) {
            this._id = id;
        }
        return this._id;
    }

    model (model) {
        if (model) {
            this._model = model;
        }
        return this._model;
    }

    boundBox (bound) {
        if (bound) {
            this._boundBox = {
                top: bound.top,
                left: bound.left,
                height: bound.height,
                width: bound.width
            };
        }
        return this._boundBox;
    }
  /**
     * function to search a node and update it with the config provided.
     * @param  {Object} nodeconfig
     */
    updateNode (nodeconfig) {
        if (this._id === nodeconfig._id) {
            this._model.cut(nodeconfig.cut);
            this._model.ratioWeight(nodeconfig.ratioWeight);
        } else {
            this._children.forEach((node) => {
                if (node._id === nodeconfig._id) {
                    node.model.cut(nodeconfig.cut);
                    node.model.ratioWeight(nodeconfig.ratioWeight);
                    return;
                }
                this.searchNode(node, nodeconfig);
            });
        }
    }

  // Recursive function to search a node
    searchNode (node, nodeconfig) {
        node.children().forEach((childNode) => {
            if (childNode.id() === nodeconfig._id) {
                childNode.model().cut(nodeconfig.cut);
                childNode.model().ratioWeight(nodeconfig.ratioWeight);
            } else {
                this.searchNode(childNode, nodeconfig);
            }
        });
    }

  /**
     * function to delete a node from tree Structure.
     * @param  {String} nodeId - node Id of the Node
     */
    delete (nodeId) {
        this._children.forEach((node) => {
            if (node.id() === nodeId) {
                const index = this._children.indexOf(node);
                this._model.lanes().splice(index, 1);
            }
            this.deleteSearchNode(node, nodeId);
        });
    }

  // Recursive function to search a node
    deleteSearchNode (node, nodeId) {
        node.children().forEach((childNode) => {
            if (childNode.id() === nodeId) {
                const index = node.children().indexOf(childNode);
                node.model().lanes().splice(index, 1);
            } else {
                this.deleteSearchNode(childNode, nodeId);
            }
        });
    }
}

export default Node;
