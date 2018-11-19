import {
  LayoutModel
} from '../layout-definition';

import DefinitionManager from '../layout-definition/definition-manager';

import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT
} from '../constants/defaults';

import { DrawingManager } from '../drawing-manager/drawingManager';
import { Utils } from '../utils';
import { LayoutDef } from './layout-def';

class LayoutManager {
    constructor (conf) {
        this._renderAt = conf.renderAt;
        this._layoutClassName = conf.className;
        this._width = conf.width || DEFAULT_WIDTH;
        this._height = conf.height || DEFAULT_HEIGHT;
        this._skeletonType = conf.skeletonType || 'html';
        this._layoutDefinition = null;
        this._layoutDef = new LayoutDef();
        if (Utils.isDOMElement(this._renderAt)) {
            this._renderAt._layout = this;
        } else {
            document.getElementById(this._renderAt)._layout = this;
        }
    }

    compute () {
        this._layoutDefinition = this._calLayOutDef();
        this._layoutDef.layoutDefinition(this._layoutDefinition);
        this._layoutDefinition = this._layoutDef.sanitizedDefinition();
        this._layout = new LayoutModel({
            width: this._width,
            height: this._height
        },
            this._layoutDefinition);
        this.tree = this._layout.negotiate().tree();
        this._layout.broadcast();
        this.manager = new DrawingManager({
            tree: this.tree,
            componentMap: this._layoutDef.componentMap(),
            layoutClassName: this._layoutClassName
        }, this._skeletonType, this._renderAt);

    // this will draw all the components by calling their draw method
        this.manager.draw();
    }

  // this will auto generate the layout definition
    _calLayOutDef () {
        const defManager = new DefinitionManager(this._layoutDef.componentMap(),
                                                  this.prioritySequence, this._height, this._width);
        const genLayoutdef = defManager.generateConfigModel();
        return genLayoutdef;
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

  /**
  * This function takes the LayoutComponents and Register them in component store
  * @param {Array<LayoutComponent>} layoutComponents
  */
    registerComponents (layoutComponents) {
        this.prioritySequence = [];

        layoutComponents.forEach((component) => {
            if (component) {
                this.prioritySequence.push(component.name());
                this.addComponent(component);
                if (component.name() === 'grid') {
                    component.component.forEach((componentArr) => {
                        componentArr.forEach((compo) => {
                            this.addComponent(compo);
                        });
                    });
                }
            }
        });
        return this;
    }
}

export default LayoutManager;
