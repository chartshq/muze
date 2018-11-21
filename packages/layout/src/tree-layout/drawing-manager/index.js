import { HTMLRenderer } from '../renderers/html-renderer';
import { Utils } from '../utils';
import { DEFAULT_CLASS_NAME } from '../constants/defaults';

export class DrawingManager {
    constructor (data, renderer, container) {
        this._data = data.tree;
        this._componentMap = data.componentMap;
        this._layoutClassName = data.layoutClassName;
        this._renderer = renderer;
        this._mount = Utils.isDOMElement(container) ? container : Utils.getElement(container);
    }

    _drawLayout () {
        switch (this._renderer) {
        case 'html' :
            this._renderHTML();
            break;
        default:
            this._renderHTML();
        }
    }

    _drawComponent (componentData) {
        componentData.children().forEach((node) => {
            if (node.model() && node.model().host()) {
                node.model().host().draw();
            }
            this._drawComponent(node);
        });
    }

    draw () {
        this._drawLayout();
    // resolve alingment
    /**
     * alignwith :
     * alignment : left | right | h-center | v-center |default
     * logic if Alignment is need search the div ,
     * create a child div according to alignment,
     * set the measurements and append it as child,
     * (check if alignment possible)
     * replace node id of parent with child
     */
        this._resolveAligment(this._data);
        this._drawComponent(this._data);
    }

    _resolveAligment (componentData) {
        componentData.children().forEach((component) => {
            if (component.model() && component.model().host() && component.model().host().alignWith) {
                let childNode;
                const point = this._findNode(component.id()).node();
                const node = point.boundBox();
                const nodeId = point.id();
                const refNode = this._findNode(this._componentMap.get(component.model().host().alignWith).renderAt)
                                    .node()
                                    .boundBox();
                switch (component.model().host().alignment) {
                case 'left':
                    childNode = this._getChildNode(node.top,
                    refNode.left,
                    node.height,
                    Math.abs(node.width - Math.abs(refNode.left - node.left)),
                    nodeId);
                    break;
                case 'right':
                    childNode = this._getChildNode(node.top,
                    node.left,
                    node.height,
                    Math.abs(node.width - Math.abs(node.left + node.width - (refNode.left + refNode.width))),
                    nodeId);
                    break;
                case 'top':
                    childNode = this._getChildNode(refNode.top,
                    node.left,
                    Math.abs(node.height - Math.abs(refNode.top - node.top)),
                    node.width,
                    nodeId);
                    break;
                case 'bottom':
                    childNode = this._getChildNode(node.top,
                    node.left,
                    Math.abs(node.top - refNode.top + refNode.height),
                    node.width,
                    nodeId);
                    break;
                case 'h-center':
                    childNode = this._getChildNode(node.top,
                    refNode.left,
                    node.height,
                    refNode.width,
                    nodeId);
                    break;
                case 'v-center':
                    childNode = this._getChildNode(refNode.top,
                    node.left,
                    refNode.height,
                    node.width,
                    nodeId);
                    break;
                default:
                    break;
                }
        // check if model in parent component
                this._componentMap.get(component.model().host().componentName).renderAt = `${component._id}-holder`;
                this.componentRenderer.parentDiv.appendChild(childNode);
            }
            this._resolveAligment(component);
        });
    }

    _getChildNode (top, left, height, width, _id) {
        return this.componentRenderer.createAndPositionDiv({
            top,
            left,
            height,
            width,
            id: `${_id}-holder`,
            className: DEFAULT_CLASS_NAME
        });
    }

    _findNode (nodeID) {
        return this.componentRenderer.coordinates().find(point => point.node().id() === nodeID);
    }

    _renderHTML () {
        this.componentRenderer = new HTMLRenderer(this._data);
        this.componentRenderer.createhtml(this._mount, this._layoutClassName);
    }
}
