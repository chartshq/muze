import { HTMLRenderer } from '../renderers/html-renderer';
import { Utils } from '../utils/utils';

export class DrawingManager {
    constructor (data, renderer, container) {
        this.data = data.tree;
        this.componentMap = data.componentMap;
        this.layoutClassName = data.layoutClassName;
        this.renderer = renderer;
        global.__renderer = renderer; // TODO change global into diff place
        this.mount = Utils.isDOMElement(container) ? container : Utils.getElement(container);
    }

    _drawLayout () {
        switch (this.renderer) {
        case 'html' :
            this.renderHTML();
            break;
        default:
            break;
        }
    }

    _drawComponent (componentData) {
        componentData.children.forEach((node) => {
            if (node.model && node.model.host) {
                node.model.host.draw();
            }
            this._drawComponent(node);
        });
    }

    draw () {
        this._drawLayout();
    // resolve alingment
    /**
     * alignwith :
     * alignment : left | right | hCenter | vCenter |default
     * logic if Alignment is need search the div ,
     * create a child div according to alignment,
     * set the measurements and append it as child,
     * (check if alignment possible)
     * replace node id of parent with child
     */
        this._resolveAligment(this.data);
        this._drawComponent(this.data);
    }

    _resolveAligment (componentData) {
        componentData.children.forEach((component) => {
            if (component.model && component.model.host && component.model.host.alignWith) {
                let childNode;
                const node = this._findNode(component._id);
                const refNode = this._findNode(this.componentMap.get(component.model.host.alignWith).renderAt);
                switch (component.model.host.alignment) {
                case 'left':
                    childNode = this._getChildNode(node.top,
              refNode.left,
              node.height,
              Math.abs(node.width - Math.abs(refNode.left - node.left)),
              node._id);
                    break;
                case 'right':
                    childNode = this._getChildNode(node.top,
              node.left,
              node.height,
              Math.abs(node.width - Math.abs(node.left + node.width - (refNode.left + refNode.width))),
              node._id);
                    break;
                case 'top':
                    childNode = this._getChildNode(refNode.top,
              node.left,
              Math.abs(node.height - Math.abs(refNode.top - node.top)),
              node.width,
              node._id);
                    break;
                case 'bottom':
                    childNode = this._getChildNode(node.top,
              node.left,
              Math.abs(node.top - refNode.top + refNode.height),
              node.width,
              node._id);
                    break;
                case 'h-center':
                    childNode = this._getChildNode(node.top,
              refNode.left,
              node.height,
              refNode.width,
              node._id);
                    break;
                case 'v-center':
                    childNode = this._getChildNode(refNode.top,
              node.left,
              refNode.height,
              node.width,
              node._id);
                    break;
                default:
                    break;
                }
        // check if model in parent component
                this.componentMap.get(component.model.host.componentName).renderAt = `${component._id}-holder`;
                this.componentRenderer.parentDiv.appendChild(childNode);
            }
            this._resolveAligment(component);
        });
    }

    _getChildNode (top, left, height, width, _id) {
        const childNodeDim = {};
        childNodeDim.top = top;
        childNodeDim.left = left;
        childNodeDim.height = height;
        childNodeDim.width = width;
        childNodeDim._id = `${_id}-holder`;
        return this.componentRenderer.createAndPositionDiv(childNodeDim);
    }

    _findNode (nodeID) {
        return this.componentRenderer.coordinates.find(node => node._id === nodeID);
    }

    renderHTML () {
        this.componentRenderer = new HTMLRenderer(this.data);
        this.componentRenderer.createhtml(this.mount, this.layoutClassName);
    }

  // customiseNode (node, borderColor, borderWidth) {
  //   if (Utils.isDOMElement(node)) {
  //     Utils.highLightNode(node, borderColor, borderWidth)
  //   } else {
  //     Utils.highLightNode(document.getElementById(node), borderColor, borderWidth)
  //   }
  // }

  // resetNode (container) {
  //   Utils.unHighLightNode(Utils.isDOMElement(container) ? container
  //     : document.getElementById(container))
  // }
}
