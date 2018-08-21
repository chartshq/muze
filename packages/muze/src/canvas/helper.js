import { makeElement, selectElement, isEqual } from 'muze-utils';
import { SideEffectContainer } from '../enums/class-names';
import { ROWS, COLUMNS, COLOR, SHAPE, SIZE, MOUNT, DETAIL } from '../constants';
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
 * @param {*} sideEffects
 * @param {*} fn
 * @param {*} toEnable
 */
export const changeSideEffectAvailability = (sideEffects, fn, toEnable) => {
    for (const key in sideEffects) {
        if ({}.hasOwnProperty.call(sideEffects, key)) {
            for (const facetKey in sideEffects[key]) {
                const sideEffect = sideEffects[key][facetKey];
                let change = true;
                if (fn && fn(sideEffect, key) === false) {
                    change = false;
                }
                if (change) {
                    toEnable ? sideEffect.enable() : sideEffect.disable();
                }
            }
        }
    }
};

export const getDrawingContext = (context, facetKey) => () => {
    const classPrefix = context.config().classPrefix;
    const className = `${classPrefix}-${SideEffectContainer}`;
    const layout = context.layout();
    const layoutDimensions = layout.getViewInformation().layoutDimensions;
    const mountPoint = layout.mountPoint();
    const svgContainer = mountPoint.select(`.${className} svg`).node();
    const htmlContainer = mountPoint.select(`.${className}`).node();
    const width = layoutDimensions.viewWidth[1];
    const height = layoutDimensions.viewHeight[1];
    const visualGroup = context.composition().visualGroup;
    const cells = visualGroup.getCellsByFacetKey(facetKey);

    if (!cells[0]) {
        return {};
    }

    const sourceContainer = cells[0].valueOf().getDrawingContext().svgContainer;
    const sourceDim = sourceContainer.getBoundingClientRect();
    const thisCont = svgContainer.getBoundingClientRect();
    const xOffset = sourceDim.left - thisCont.left;
    const yOffset = sourceDim.top - thisCont.top;

    return {
        svgContainer,
        htmlContainer,
        width,
        height,
        boundWidth: sourceDim.width,
        boundHeight: sourceDim.height,
        xOffset,
        yOffset,
        sideEffectGroup: makeElement(selectElement(svgContainer), 'g', [1],
            `${classPrefix}-side-effect-group-${facetKey.replace(/,|\s*/g, '')}`).node()
    };
};

export const getSourceInfo = (context, facetKey) => () => {
    let xAxes = [];
    let yAxes = [];
    const dimensionMeasureMap = {};
    const group = context.composition().visualGroup;
    const retinalAxes = group.getAxes('retinal');
    const fieldsMeasuresMap = group.getDimensionMeasureMap(facetKey);

    for (const key in fieldsMeasuresMap) {
        if ({}.hasOwnProperty.call(fieldsMeasuresMap, key)) {
            !dimensionMeasureMap[key] && (dimensionMeasureMap[key] = []);
            dimensionMeasureMap[key] =
                [...new Set([...dimensionMeasureMap[key], ...fieldsMeasuresMap[key]])];
        }
    }
    xAxes = [...xAxes, ...group.getAxesByFacetKey('x', facetKey)];
    yAxes = [...yAxes, ...group.getAxesByFacetKey('y', facetKey)];

    return {
        dimensionMeasureMap,
        axes: {
            x: xAxes,
            y: yAxes,
            color: retinalAxes.color,
            size: retinalAxes.size,
            shape: retinalAxes.shape
        },
        fields: {
            x: group.getFieldsFromChannel('x'),
            y: group.getFieldsFromChannel('y')
        }
    };
};

export const getMarksFromIdentifiers = (context, facetKey) => (identifiers) => {
    const visualGroup = context.composition().visualGroup;
    const geomCells = visualGroup.getCellsByFacetKey(facetKey);

    if (geomCells && geomCells[0]) {
        return geomCells[0].valueOf().getPlotPointsFromIdentifiers(identifiers);
    }

    return null;
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
        store.registerChangeListener(props, (...params) => {
            const updateProps = allOptions.every((option, i) => {
                let equalityChecker = () => false;
                switch (option) {
                case ROWS:
                case COLUMNS:
                    equalityChecker = isEqual('Array');
                    break;

                case SHAPE:
                case SIZE:
                case COLOR:
                case DETAIL:
                    equalityChecker = isEqual('Object');
                    break;

                default:
                    break;
                }
                const oldVal = params[i][0];
                const newVal = params[i][1];
                return !equalityChecker(oldVal, newVal);
            });

            // inform attached board to rerender
            !updateProps && dispatchProps(context);
            context.render();
        }, true);
    });
};

