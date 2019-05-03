import {
  LayoutModel
} from '../layout-definition';

import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT
} from '../constants/defaults';

import {
   GRID
} from '../../enums/constants';

import { DrawingManager } from '../drawing-manager';
import { removeElement } from '../drawing-manager/helper';
import { Utils } from '../utils';
import { LayoutDef } from './layout-def';
import { calLayOutDef } from './helper';

export default class LayoutManager {
    constructor (conf) {
        this._renderAt = conf.renderAt;
        this._layoutClassName = conf.className;
        this._dimension = {
            width: conf.width || DEFAULT_WIDTH,
            height: conf.height || DEFAULT_HEIGHT
        };

        this._skeletonType = conf.skeletonType || 'html';
        this._layoutDefinition = null;
        this._layoutDef = new LayoutDef();
        this._drawingManager = null;
        this._prioritySequence = [];
        this.tree = null;
        this._rootNodeID = null;
    }

    layoutDef (param) {
        if (param) {
            this._layoutDef = param;
        }
        return this._layoutDef;
    }

    prioritySequence (param) {
        if (param) {
            this._prioritySequence = param;
        }
        return this._prioritySequence;
    }

    dimension (param) {
        if (param) {
            Object.assign(this._dimension, param);
        }
        return this._dimension;
    }

    addComponent (component) {
        this._layoutDef.addComponent(component);
    }

    addMultipleComponent (componentArray) {
        this._layoutDef.addMultipleComponent(componentArray);
    }

    resetNode (node) {
        if (this.con) {
            this.con.resetNode(node);
        }
    }

  /**
   * function to update the node and rerender the layout.
   * @param  {} config - node configuration to change.
   */
    updateNode (config) {
        this.tree.updateNode(config);
        this._layoutDefinition = this.tree.model;
        this.compute();
    }

    compute () {
        //----
        if (Utils.isDOMElement(this._renderAt)) {
            this._renderAt._layout = this;
        } else {
            document.getElementById(this._renderAt)._layout = this;
        }
        //-----
        this._layoutDefinition = calLayOutDef(this);
        this._layoutDef.layoutDefinition(this._layoutDefinition);
        this._layoutDefinition = this._layoutDef.sanitizedDefinition();
        this._layout = new LayoutModel({
            width: this._dimension.width,
            height: this._dimension.height
        },
            this._layoutDefinition);
        this.tree = this._layout.negotiate().tree();
        this._layout.broadcast();
        this._drawingManager = new DrawingManager({
            tree: this.tree,
            componentMap: this._layoutDef.componentMap(),
            layoutClassName: this._layoutClassName
        }, this._skeletonType, this._renderAt);

        if (this._rootNodeID) {
            this.tree.id(this._rootNodeID);
        } else {
            this._rootNodeID = this.tree.id();
        }
    // this will draw all the components by calling their draw method
        this._drawingManager.draw();
    }

    getRootNodeId () {
        return this._rootNodeID;
    }

  /**
  * This function takes the LayoutComponents and Register them in component store
  * @param {Array<LayoutComponent>} layoutComponents
  */
    registerComponents (layoutComponents) {
        this._prioritySequence.length = 0;
        this._layoutDef.resetComponentMap();
        layoutComponents.forEach((container) => {
            if (container) {
                this._prioritySequence.push(container.name());
                this.addComponent(container);
                if (container.name() === 'grid') {
                    container.component.forEach((componentArr) => {
                        componentArr.forEach((compo) => {
                            this.addComponent(compo);
                        });
                    });
                }
            }
        });
        return this;
    }

    getComponent (componentName) {
        return this._layoutDef.componentMap().get(componentName);
    }

    deleteElement (component, elementName) {
        this._layoutDef.componentMap().delete(elementName);
        const deleteElementId = component.renderAt();
        return removeElement(deleteElementId);
    }

    removeComponent (name) {
        const component = this.getComponent(name);
        if (component) {
            if (name === GRID) {
                return component.component.map(comp => comp.map(
                    co => this.deleteElement(co, co.name())
                ));
            }
            return this.deleteElement(component, name);
        }
        return this;
    }

    renderAt (mount) {
        if (mount) {
            this._renderAt = mount;
        }
        return this._renderAt;
    }
}
