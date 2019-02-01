import DefinitionModel from './definitionModel';
import { prepareTargetComponentMap, getComponent, placeComponent, placeGridComponent } from '../helper';

export default class DefinitionManager {
    constructor (componentMap, sequence, totalHeight, totalWidth) {
        this._componentMap = componentMap;
        this._prioritySequence = sequence;
        this._totalHeight = totalHeight;
        this._totalWidth = totalWidth;
        this._targetComponentMap = null;
    }

    // create the config model
    generateConfigModel () {
        prepareTargetComponentMap(this);
        const canvasComponent = this._targetComponentMap.get('canvas');
        const definitionModel = new DefinitionModel({});
        let tempDefModel = definitionModel;
        definitionModel.remainingHeight(this._totalHeight);
        definitionModel.remainingWidth(this._totalWidth);

        let componentRef = null;

        this._prioritySequence.forEach((name) => {
            componentRef = getComponent(canvasComponent, name);
            if (name !== 'grid') {
                tempDefModel = placeComponent(tempDefModel, componentRef).second;
            } else {
                tempDefModel = placeGridComponent(tempDefModel, componentRef.component);
            }
        });
        return definitionModel;
    }

    componentMap (param) {
        if (param) {
            this._componentMap = param;
        }
        return this._componentMap;
    }

    targetComponentMap (param) {
        if (param) {
            this._targetComponentMap = param;
        }
        return this._targetComponentMap;
    }
}
