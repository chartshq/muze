import { isEqual, STATE_NAMESPACES, selectElement, getValueParser, FieldType } from 'muze-utils';
import { VisualGroup } from '@chartshq/visual-group';
import { BEHAVIOURS } from '@chartshq/muze-firebolt';
import { payloadGenerator } from '@chartshq/visual-unit';
import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, DETAIL, DATA, CONFIG, GRID, LEGEND }
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

export const fixFacetConfig = (config) => {
    if (config) {
        const isGridLinePresent = {};
        const { border, gridLines } = config;
        if (gridLines) {
            isGridLinePresent.x = !!gridLines.x;
            isGridLinePresent.y = !!gridLines.y;
        }
        const facetsUserConfig = {
            isBorderPresent: border || {},
            isGridLinePresent
        };
        return {
            facetsUserConfig,
            isFacet: false
        };
    }
    return {};
};

export const fixScrollBarConfig = (config) => {
    config.scrollBar.thickness = Math.min(50, Math.max(10, config.scrollBar.thickness));
    return config;
};

export const excludeKeys = (config, keys) => {
    const emptyValueKeyObject = {};
    keys.forEach((key) => {
        if (config && config[key] && Object.keys(config[key]).length) {
            emptyValueKeyObject[key] = {};
        }
    });
    return emptyValueKeyObject;
};

export const setLayoutInfForUnits = (context) => {
    const layoutManager = context._layoutManager;
    const gridLayout = layoutManager.getComponent(GRID);
    const legend = layoutManager.getComponent(LEGEND);
    const boundBox = gridLayout && gridLayout.getBoundBox();
    const valueMatrix = context.composition().visualGroup.matrixInstance().value;
    const parentContainer = selectElement(`#${layoutManager.getRootNodeId()}`).node();
    if (legend) {
        legend.setComponentInfo({ rootNode: parentContainer });
    }
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

    const sanitizedData = visualGroup.getMandatoryFields();
    if (sanitizedData.shouldRender) {
        visualGroup.createMatrices(sanitizedData);
    } else {
        visualGroup.remove();
    }
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

export const notifyAnimationEnd = (context) => {
    const viewInfo = context.layout().viewInfo();
    const centerMatrix = viewInfo && viewInfo.viewMatricesInfo.matrices.center[1] || [];
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
        const equalityProps = equalityChecker(props, params);
        // inform attached board to rerender
        if (equalityProps && context.mount()) {
            dispatchProps(context);
            context.render();
        }
        notifyAnimationEnd(context);
    }, true);
};

const applyPropagationPolicy = (firebolt, { behaviours, sideEffects }) => {
    for (const key in behaviours) {
        firebolt.changeBehaviourStateOnPropagation(key, behaviours[key]);
    }
    for (const key in sideEffects) {
        firebolt.changeSideEffectStateOnPropagation(key, sideEffects[key]);
    }
};

const isMeasure = fields => fields.every(field => field.type() === FieldType.MEASURE);

const isSplom = (fields) => {
    const { rowProjections, colProjections } = fields;
    const colProj = colProjections.flat();
    const rowProj = rowProjections.flat();

    if (isMeasure(colProj) && isMeasure(rowProj)) {
        return true;
    }
    return false;
};

export const applyInteractionPolicy = (firebolt) => {
    const canvas = firebolt.context;
    const visualGroup = canvas.composition().visualGroup;
    if (visualGroup) {
        const splom = isSplom(visualGroup.resolver().getAllFields());
        const valueMatrix = visualGroup.matrixInstance().value;
        const interactionPolicy = firebolt._interactionPolicy;
        interactionPolicy(valueMatrix, firebolt);
        const crossInteractionPolicy = firebolt._crossInteractionPolicy;
        const behaviours = crossInteractionPolicy.behaviours;
        const sideEffects = crossInteractionPolicy.sideEffects;
        valueMatrix.each((cell) => {
            const unitFireBolt = cell.valueOf().firebolt();
            applyPropagationPolicy(unitFireBolt, { behaviours, sideEffects });
            if (splom) {
                unitFireBolt.payloadGenerators({
                    [BEHAVIOURS.BRUSH]: (inst, dm, propConfig, facetFields) => payloadGenerator.brush(inst, dm,
                        { ...propConfig, ...{ includeMeasures: false } }, facetFields)
                });
                unitFireBolt.sideEffects().selectionBox.config({
                    persistent: true
                });
            } else {
                unitFireBolt.payloadGenerators({
                    [BEHAVIOURS.BRUSH]: payloadGenerator.brush
                });
                unitFireBolt.sideEffects().selectionBox.config({
                    persistent: false
                });
            }
        });
        applyPropagationPolicy(firebolt, { behaviours, sideEffects });
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
