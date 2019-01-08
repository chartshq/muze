import { isEqual, STATE_NAMESPACES, selectElement } from 'muze-utils';
import { VisualGroup } from '@chartshq/visual-group';
import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, DETAIL, DATA, CONFIG }
    from '../constants';
import { canvasOptions } from './local-options';
import { LayoutManager } from '../../../layout/src/tree-layout';

/**
 * Instantiate high level components. Canvas knows what all high level component it has.
 * @nice-to-have dynamic high level components.
 *  - Is it even required ?
 *  - Reactive to source (canvas) streaming ?
 * @param {*} context Canvas instance
 * @return {Object.<Array>} Arrays of Title, visualGroup, Legend
 */
export const initCanvas = (context) => {
    const reg = context._registry.components;

    return [new reg.VisualGroup(context._registry, context.dependencies())];
};

export const setLayoutInfForUnits = (context) => {
    const layoutManager = context._layoutManager;
    const boundBox = layoutManager.getComponent('grid').getBoundBox();
    const valueMatrix = context.composition().visualGroup.matrixInstance().value;
    const parentContainer = selectElement(`#${layoutManager.getRootNodeId()}`).node();
    valueMatrix.each((cell) => {
        cell.valueOf().parentContainerInf({
            el: parentContainer,
            dimensions: boundBox
        });
    });
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

    const allOptions = context._allOptions;
    for (const key in allOptions) {
        const value = context[key]();
        if (value !== null) {
            visualGroup[key] && visualGroup[key](value);
        }
    }
    visualGroup.createMatrices();
    context._cachedProps = {};
    lifeCycleManager.notify({ client: context, action: 'initialized' });
    lifeCycleManager.notify({ client: context, action: 'updated' });
};

const equalityChecker = (props, params) => {
    let checker = () => false;
    return !props.every((option, i) => {
        switch (option) {
        case ROWS:
        case COLUMNS:
        case DETAIL:
            checker = isEqual('Array');
            break;

        case SHAPE:
        case SIZE:
        case COLOR:
        case DATA:
        case CONFIG:
            checker = isEqual('Object');
            break;
        default:
            checker = () => true;
            break;
        }
        const oldVal = params[i][0];
        const newVal = params[i][1];

        return checker(oldVal, newVal);
    });
};

const updateChecker = (props, params) => props.every((option, i) => {
    const val = params[i][1];
    switch (option) {
    case ROWS:
    case COLUMNS:
        return val !== null;

    case DATA:
        return val && !val.isEmpty();

    default:
        return true;

    }
});

export const setupChangeListener = (context) => {
    const store = context._store;

    const allOptions = Object.keys(context._allOptions);
    const props = [...allOptions, ...Object.keys(canvasOptions)];
    const nameSpaceProps = [...allOptions, ...Object.keys(canvasOptions)].map(prop =>
        `${STATE_NAMESPACES.CANVAS_LOCAL_NAMESPACE}.${prop}`);
    store.registerChangeListener(nameSpaceProps, (...params) => {
        let updateProps = equalityChecker(props, params);
        updateProps = updateChecker(props, params);

        // inform attached board to rerender
        if (updateProps && context.mount()) {
            dispatchProps(context);
            context.render();
        }
    }, true);
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
                if (xAxes[i][j].renderConfig().labels.rotation !== 0) {
                    rotation = xAxes[i][j].renderConfig().labels.rotation;
                    return;
                }
            }
        }
    })();

    if (rotation) {
        xAxes.forEach((axes) => {
            axes.forEach((axis) => {
                axis.renderConfig({ labels: { rotation } });
                axis.smartTicks(axis.setTickConfig());
            });
        });
    }
};

export const createGroupState = (context) => {
    const [globalState, localState] = VisualGroup.getState();
    const store = context._store;
    store.append('app.group', globalState);
    store.append('local.group', localState);
};

export const removeChild = (mount) => {
    while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
    }
};

export const createLayoutManager = () => {
    const layoutManager = new LayoutManager({
        className: 'muze-group-container'
    });
    return layoutManager;
};
