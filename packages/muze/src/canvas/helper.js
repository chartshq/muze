import { isEqual, STATE_NAMESPACES, selectElement, getValueParser } from 'muze-utils';
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

    return [new reg.VisualGroup(context._registry, Object.assign({
        throwback: context._throwback
    }, context.dependencies()))];
};

export const fixScrollBarConfig = (config) => {
    config.scrollBar.thickness = Math.min(50, Math.max(10, config.scrollBar.thickness));
    return config;
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
    const { invalidValues } = context.config();

    visualGroup.valueParser(getValueParser(invalidValues));
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

export const notifyAnimationEnd = (context) => {
    const centerMatrix = context.layout().viewInfo().viewMatricesInfo.matrices.center[1] || [];
    const promises = [];
    centerMatrix.forEach((cellArr) => {
        cellArr.forEach((cell) => {
            promises.push(cell.valueOf().done());
        });
    });
    const lifeCycleManager = context.lifeCycle();
    if (promises.length) {
        Promise.all(promises).then(() => {
            // Update life cycle
            lifeCycleManager.notify({ client: context, action: 'drawn' });
            const animDonePromises = [];

            centerMatrix.forEach((cellArr) => {
                cellArr.forEach((cell) => {
                    cell.valueOf().layers().forEach((layer) => {
                        animDonePromises.push(layer.animationDone());
                    });
                });
            });

            [context.xAxes(), context.yAxes()].forEach((axisArr) => {
                axisArr = axisArr || [];
                axisArr.forEach((axes) => {
                    axes.forEach((axisInst) => {
                        animDonePromises.push(axisInst.animationDone());
                    });
                });
            });

            Promise.all(animDonePromises).then(() => {
                lifeCycleManager.notify({ client: context, action: 'animationend' });
            });
        });
    } else {
        lifeCycleManager.notify({ client: context, action: 'animationend' });
    }
};

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
        notifyAnimationEnd(context);
    }, true);
};

export const applyInteractionPolicy = (firebolt) => {
    const canvas = firebolt.context;
    const visualGroup = canvas.composition().visualGroup;
    if (visualGroup) {
        const valueMatrix = visualGroup.matrixInstance().value;
        const interactionPolicy = firebolt._interactionPolicy;
        interactionPolicy(valueMatrix, firebolt);
        const crossInteractionPolicy = firebolt._crossInteractionPolicy;
        const behaviours = crossInteractionPolicy.behaviours;
        const sideEffects = crossInteractionPolicy.sideEffects;
        valueMatrix.each((cell) => {
            const unitFireBolt = cell.valueOf().firebolt();
            for (const key in behaviours) {
                unitFireBolt.changeBehaviourStateOnPropagation(key, behaviours[key]);
            }
            for (const key in sideEffects) {
                unitFireBolt.changeSideEffectStateOnPropagation(key, sideEffects[key]);
            }
        });
    }
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
                const rotationVal = xAxes[i][j].renderConfig().labels.rotation;
                if (rotationVal && rotationVal !== 0) {
                    rotation = rotationVal;
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
