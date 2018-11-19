import DefinitionModel from './definitionModel';
import DummyComponent from '../../layout-component/dummy-component'
;

export default class DefinitionManager {
    constructor (componentMap, sequence, totalHeight, totalWidth) {
        this.componentMap = componentMap;
        this.prioritySequence = sequence;
        this.totalHeight = totalHeight;
        this.totalWidth = totalWidth;
    }

  // prepares the targetComponent Map for target Mapping ie. where a component should lie
    _prepareTargetComponentMap () {
        this.targetComponentMap = new Map();
        this.componentMap.forEach((value) => {
            if (this.targetComponentMap.has(value.target)) {
                this.targetComponentMap.get(value.target).push(value);
            } else {
                const temp = [];
                temp.push(value);
                this.targetComponentMap.set(value.target, temp);
            }
        });
    }

  // create the config model
    generateConfigModel () {
        this._prepareTargetComponentMap();
        const canvasComponent = this.targetComponentMap.get('canvas');
        const definitionModel = new DefinitionModel();
        let tempDefModel = definitionModel;
        definitionModel._remainingHeight = this.totalHeight;
        definitionModel._remainingWidth = this.totalWidth;

        let componentRef = null;

        this.prioritySequence.forEach((name) => {
            componentRef = this._getComponent(canvasComponent, name);
            if (name !== 'grid') {
                tempDefModel = this._placeComponent(tempDefModel, componentRef).second;
            } else {
                tempDefModel = this._placeGridComponent(tempDefModel, componentRef.component);
            }
        });
        return definitionModel;
    }

    _getComponent (canvasComponent, componentName) {
        const comp = canvasComponent.find(component => component.componentName === componentName);
        return (comp && comp !== -1) ? comp : null;
    }

    _placeGridComponent (definitionModel, gridComponents) {
        const rows = gridComponents.length;
        const column = rows ? gridComponents[0].length : 0;

        const height = gridComponents.reduce((acc, val) => (acc + val[0].getLogicalSpace().height), 0);
        let tempDefModel = definitionModel;
        for (let i = 0; i < column; i++) {
            const iscolumnPreffered = i === column - 1;
            const columnPlaceHolderComponent = this._createPlaceHolderComponent(height,
                                                        gridComponents[0][i].getLogicalSpace().width, 'left');
            const { first, second } = this._placeComponent(tempDefModel, columnPlaceHolderComponent, iscolumnPreffered);
            tempDefModel = first;
            for (let j = 0; j < rows; j++) {
                const rowpreffred = j === (rows - 1);
                tempDefModel = this._placeComponent(tempDefModel, gridComponents[j][i], rowpreffred, true).second;
            }
            tempDefModel = second;
        }
    }

    _createPlaceHolderComponent (height, width, position) {
        const comp = new DummyComponent(0, { height, width });
        comp.name = 'placeHolder';
        comp.position = position;
        return comp;
    }
  /**
   * @TODO : provide %age support
   * @TODO : provide support for nested placement such as logo in a title
   *
   * @param {DefinitionModel} definitionModel
   * @param {LayoutComponent} component
   */
    _placeComponent (definitionModel, component, isPreferred = false, isGridComponent = false) {
        if (!component) {
            return { first: definitionModel, second: definitionModel };
        }
        const componentDimension = component.getLogicalSpace();
        const componentHeight = componentDimension.height;
        const componentWidth = componentDimension.width;
        let cut = '';
        let componentRatioWidth = 1;
        let leftOvercomponentRationWidth = 1;
        let leftHeight = 0;
        let leftWidth = 0;
        if (component.position === 'top' || component.position === 'bottom') {
            cut = 'h';
            componentRatioWidth = componentHeight / definitionModel._remainingHeight;
            leftHeight = definitionModel._remainingHeight - componentHeight;
            leftWidth = definitionModel._remainingWidth;
        } else {
            cut = 'v';
            componentRatioWidth = componentWidth / definitionModel._remainingWidth;
            leftWidth = definitionModel._remainingWidth - componentWidth;
            leftHeight = definitionModel._remainingHeight;
        }
        leftOvercomponentRationWidth = 1 - componentRatioWidth;

    // update parentModel
        definitionModel.cut = cut;

        const firstLane = new DefinitionModel(component.componentName,
                                                null,
                                                componentRatioWidth,
                                                isGridComponent ? false : isPreferred,
                                                []);
        firstLane._remainingHeight = componentHeight;
        firstLane._remainingWidth = componentWidth;
        const secondLane = new DefinitionModel(null,
                                                null,
                                                leftOvercomponentRationWidth,
                                                isGridComponent ? false : !isPreferred,
                                                []);
        secondLane._remainingHeight = leftHeight;
        secondLane._remainingWidth = leftWidth;
        if (isPreferred) {
            definitionModel.lanes = [firstLane];
        } else if (component.position === 'top' || component.position === 'left') {
            definitionModel.lanes = [firstLane, secondLane];
        } else {
            definitionModel.lanes = [secondLane, firstLane];
        }
        return { first: firstLane, second: secondLane };
    }
}
