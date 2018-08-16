import * as COMPONENTS from './enums/components';

class ActionModel {
    constructor () {
        this._registrableComponents = [];
        this._targetComponent = COMPONENTS.ALL;
    }

    /**
     *
     *
     * @param {*} action
     * @returns
     * @memberof ActionModel
     */
    registerPhysicalActions (action) {
        const canvases = this._registrableComponents;

        canvases.forEach((canvas) => {
            canvas.once('canvas.updated').then((args) => {
                const matrix = args.client.getMatrixInstance('value');
                matrix.each(cell => cell.valueOf().firebolt().registerPhysicalActions(action));
            });
        });
        return this;
    }

    /**
     *
     *
     * @param {*} actions
     * @returns
     * @memberof ActionModel
     */
    registerBehaviouralActions (...actions) {
        const canvases = this._registrableComponents;

        canvases.forEach((canvas) => {
            canvas.once('canvas.updated').then(() => {
                const matrix = canvas.getMatrixInstance('value');
                matrix.each(cell => cell.valueOf().firebolt().registerBehaviouralActions(...actions));
            });
        });
        return this;
    }

    /**
     *
     *
     * @param {*} map
     * @returns
     * @memberof ActionModel
     */
    registerPhysicalBehaviouralMap (map) {
        const canvases = this._registrableComponents;

        canvases.forEach((canvas) => {
            canvas.once('canvas.updated').then((args) => {
                const matrix = args.client.getMatrixInstance('value');
                matrix.each(cell => cell.valueOf().firebolt().registerPhysicalBehaviouralMap(map));
            });
        });
        return this;
    }

    /**
     *
     *
     * @param {*} map
     * @returns
     * @memberof ActionModel
     */
    mapSideEffects (map) {
        const canvases = this._registrableComponents;
        const targetComponent = this._targetComponent;

        canvases.forEach((canvas) => {
            if (targetComponent === COMPONENTS.GROUP || targetComponent === COMPONENTS.ALL) {
                canvas.firebolt().mapSideEffects(map);
            }
            canvas.once('canvas.updated').then(() => {
                if (targetComponent === COMPONENTS.UNIT || targetComponent === COMPONENTS.ALL) {
                    const matrix = canvas.getMatrixInstance('value');
                    matrix.each(cell => cell.valueOf().firebolt().mapSideEffects(map));
                }
            });
        });
        return this;
    }

    /**
     *
     *
     * @param {*} componentName
     * @returns
     * @memberof ActionModel
     */
    for (...components) {
        this._registrableComponents = components;
        return this;
    }

    target (componentName) {
        this._targetComponent = componentName;
        return this;
    }

    /**
     *
     *
     * @param {*} sideEffects
     * @returns
     * @memberof ActionModel
     */
    registerSideEffects (...sideEffects) {
        const registrableComponents = this._registrableComponents;
        const targetComponent = this._targetComponent;

        registrableComponents.forEach((canvas) => {
            if (targetComponent === COMPONENTS.GROUP || targetComponent === COMPONENTS.ALL) {
                canvas.firebolt().registerSideEffects(sideEffects);
            }
            if (targetComponent === COMPONENTS.UNIT || targetComponent === COMPONENTS.ALL) {
                canvas.once('canvas.updated').then((args) => {
                    const matrix = args.client.getMatrixInstance('value');
                    matrix.each(cell => cell.valueOf().firebolt().registerSideEffects(sideEffects));
                });
            }
        });

        return this;
    }
}

export const actionModel = (() => new ActionModel())();
