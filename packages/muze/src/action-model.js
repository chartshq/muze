class ActionModel {
    constructor () {
        this._registrableComponents = [];
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
                const matrix = args.client.composition().visualGroup.matrixInstance().value;
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
                const matrix = canvas.composition().visualGroup.matrixInstance().value;
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
                const matrix = args.client.composition().visualGroup.matrixInstance().value;
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

        canvases.forEach((canvas) => {
            canvas.once('canvas.updated').then(() => {
                const matrix = canvas.composition().visualGroup.matrixInstance().value;
                matrix.each(cell => cell.valueOf().firebolt().mapSideEffects(map));
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

    /**
     *
     *
     * @param {*} sideEffects
     * @returns
     * @memberof ActionModel
     */
    registerSideEffects (...sideEffects) {
        const registrableComponents = this._registrableComponents;

        registrableComponents.forEach((canvas) => {
            canvas.once('canvas.updated').then((args) => {
                const matrix = args.client.composition().visualGroup.matrixInstance().value;
                matrix.each(cell => cell.valueOf().firebolt().registerSideEffects(sideEffects));
            });
        });

        return this;
    }
}

export const actionModel = (() => new ActionModel())();
