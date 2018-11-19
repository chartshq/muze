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
        this.layoutClassName = conf.className;
        this.width = conf.width || DEFAULT_WIDTH;
        this.height = conf.height || DEFAULT_HEIGHT;
        this.skeletonType = conf.skeletonType || 'html';
        this.layoutDefinition = null;
        this.layoutDef = new LayoutDef();
        if (Utils.isDOMElement(this._renderAt)) {
            this._renderAt._layout = this;
        } else {
            document.getElementById(this._renderAt)._layout = this;
        }
    }

    compute () {
        this.layoutDefinition = this.calLayOutDef();
        this.layoutDef.layoutDefinition = this.layoutDefinition;
        this.layoutDefinition = this.layoutDef.getSanitizedDefinition();
        this._layout = new LayoutModel({
            width: this.width,
            height: this.height
        },
            this.layoutDefinition);
        this.tree = this._layout.negotiate().tree();
        this._layout.broadcast();
        this.manager = new DrawingManager({
            tree: this.tree,
            componentMap: this.layoutDef.getComponentMap(),
            layoutClassName: this.layoutClassName
        }, this.skeletonType, this._renderAt);

    // this will draw all the components by calling their draw method
        this.manager.draw();
    }

  // this will auto generate the layout definition
    calLayOutDef () {
        const defManager = new DefinitionManager(this.layoutDef.getComponentMap(),
                                                  this.prioritySequence, this.height, this.width);
        const genLayoutdef = defManager.generateConfigModel();
        return genLayoutdef;
    }
    addComponent (component) {
        this.layoutDef.addComponent(component);
    }

    addMultipleComponent (componentArray) {
        this.layoutDef.addMultipleComponent(componentArray);
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
        this.layoutDefinition = this.tree.model;
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

    getComponentBoundBox (componentName) {
        return this.layoutDef.getComponentMap().get(componentName).boundBox;
    }
}

export default LayoutManager;
