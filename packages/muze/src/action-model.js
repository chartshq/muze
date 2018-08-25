class ActionModel {
    constructor () {
        this._registrableComponents = [];
    }

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

    for (...components) {
        this._registrableComponents = components;
        return this;
    }

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

    dissociateBehaviour (...maps) {
        const registrableComponents = this._registrableComponents;

        registrableComponents.forEach((canvas) => {
            canvas.once('canvas.updated').then((args) => {
                const matrix = args.client.composition().visualGroup.matrixInstance().value;
                matrix.each((cell) => {
                    maps.forEach(val => cell.valueOf().firebolt().dissociateBehaviour(val[0], val[1]));
                });
            });
        });

        return this;
    }

    dissociateSideEffect (...maps) {
        const registrableComponents = this._registrableComponents;

        registrableComponents.forEach((canvas) => {
            canvas.once('canvas.updated').then((args) => {
                const matrix = args.client.composition().visualGroup.matrixInstance().value;
                matrix.each((cell) => {
                    maps.forEach(val => cell.valueOf().firebolt().dissociateBehaviour(val[0], val[1]));
                });
            });
        });

        return this;
    }
}

export const actionModel = (() => new ActionModel())();
