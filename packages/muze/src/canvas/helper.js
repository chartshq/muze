import { isEqual } from 'muze-utils';
import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, MOUNT, DETAIL, DATA, CONFIG } from '../constants';
import { canvasOptions } from './local-options';

/**
 * Instantiate high level components. Canvas knows what all high level component it has.
 * @nice-to-have dynamic high level components.
 *  - Is it even required ?
 *  - Reactive to source (canvas) streaming ?
 * @param {*} context Canvas instance
 * @return {Object.fArray>} Arrays of Title, visualGroup, Legend
 */
export const initCanvas = (context) => {
    const reg = context._registry.components;

    return [new reg.VisualGroup(context._registry, context.dependencies())];
};

/**
 *
 *
 * @memberof Canvas
 */
export const dispatchProps = (context) => {
    const lifeCycleManager = context.dependencies().lifeCycleManager;
    lifeCycleManager.notify({ client: context, action: 'beforeupdate' });
    const visualGroup = context.composition().visualGroup;

    visualGroup.lockModel();
    const allOptions = context._allOptions;
    for (const key in allOptions) {
        const value = context[key]();
        if (value !== null) {
            visualGroup[key] && visualGroup[key](value);
        }
    }
    visualGroup.unlockModel();

    context._cachedProps = {};
    lifeCycleManager.notify({ client: context, action: 'initialized' });
    lifeCycleManager.notify({ client: context, action: 'updated' });
};

/**
 *
 *
 */
export const setupChangeListener = (context) => {
    const store = context._store;

    store.registerImmediateListener(MOUNT, () => {
        const allOptions = Object.keys(context._allOptions);
        const props = [...allOptions, ...Object.keys(canvasOptions)];
        let equalityChecker = () => false;
        store.registerChangeListener(props, (...params) => {
            const updateProps = props.every((option, i) => {
                switch (option) {
                case ROWS:
                case COLUMNS:
                case DETAIL:
                    equalityChecker = isEqual('Array');
                    break;

                case SHAPE:
                case SIZE:
                case COLOR:
                case DATA:
                case CONFIG:
                    equalityChecker = isEqual('Object');
                    break;
                default:
                    equalityChecker = () => true;
                    break;
                }
                const oldVal = params[i][0];
                const newVal = params[i][1];

                return equalityChecker(oldVal, newVal);
            });
            // inform attached board to rerender
            !updateProps && dispatchProps(context);
            context.render();
        }, true);
    });
};

export const applyInteractionPolicy = (policies, firebolt) => {
    const canvas = firebolt.context;
    const visualGroup = canvas.composition().visualGroup;
    const valueMatrix = visualGroup.composition().matrices.value;
    policies.forEach(policy => policy(valueMatrix, firebolt));
};

/**
 * Sets the rotation for all x axes if any axis has the rotation config set in the
 * entire view
 *
 * @param {Array} columns Column cells that contain the axes cells
 */
export const setLabelRotationForAxes = (context) => {
    let rotation = 0;

    const xAxes = context.xAxes() || [];

    (() => {
        for (let i = 0; i < xAxes.length; i++) {
            for (let j = 0; j < xAxes[i].length; j++) {
                if (xAxes[i][j].config().labels.rotation !== 0) {
                    rotation = xAxes[i][j].config().labels.rotation;
                    return;
                }
            }
        }
    })();

    if (rotation) {
        xAxes.forEach((axes) => {
            axes.forEach((axis) => {
                axis.config({ labels: { rotation, smartTicks: false } });
            });
        });
    }
};
