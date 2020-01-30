import {
    STATE_NAMESPACES,
    temporalFields,
    getObjProp,
    defaultValue,
    isSimpleObject
} from 'muze-utils';
import { FRAGMENTED } from '@chartshq/muze-firebolt/src/enums/constants';
import { TOOLTIP, FRAGMENTED_TOOLTIP } from '@chartshq/muze-firebolt/src/enums/side-effects';
import * as PROPS from './enums/reactive-props';
import {
    transformDataModels,
    getDimensionMeasureMap,
    attachDataToLayers,
    attachAxisToLayers
} from './helper';

import { createGridLineLayer } from './helper/grid-lines';
import { prepareSelectionSetData } from './firebolt/helper';

const removeExitLayers = (layerDefs, context) => {
    const layersMap = context._layersMap;
    const markSet = {};
    layerDefs.forEach((layerDef, i) => {
        const id = defaultValue(layerDef.name, `${layerDef.mark}-${i}`);
        markSet[id] = true;
    });

    for (const key in layersMap) {
        if (!(key in markSet)) {
            layersMap[key].forEach(layer => layer.remove());
            delete layersMap[key];
        }
    }
};

export const listenerMap = [
    {
        type: 'registerImmediateListener',
        props: [PROPS.LAYERDEFS],
        listener: (context, [, layerDefs]) => {
            const fieldsVal = context.fields();

            if (layerDefs && fieldsVal) {
                removeExitLayers(layerDefs, context);
                const queuedLayerDefs = context._queuedLayerDefs;
                let layerDefArr = layerDefs;
                queuedLayerDefs.forEach((defFn) => {
                    layerDefArr = [...layerDefArr, ...defFn(layerDefs)];
                });
                context.addLayer(layerDefArr);

                const adjustRange = context.layers().some(inst => inst.hasPlotSpan());
                ['x', 'y'].forEach((type) => {
                    const axisArr = defaultValue(getObjProp(context.axes(), type), []);
                    axisArr.forEach((axis) => {
                        axis.config({
                            adjustRange
                        });
                    });
                });
                context._lifeCycleManager.notify({
                    client: context.layers(),
                    action: 'initialized',
                    formalName: 'layer'
                });
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.DATA],
        listener: (context, [, dataModel]) => {
            if (dataModel) {
                const axesObj = context.axes();
                const timeDiffs = {};
                const timeDiffsByField = {};

                Object.entries(temporalFields(dataModel)).forEach(([fieldName, fieldObj]) => {
                    timeDiffsByField[fieldName] = fieldObj.minimumConsecutiveDifference();
                });

                Object.entries(context.fields()).forEach(([type, [field]]) => {
                    if (field) {
                        const timeDiff = timeDiffsByField[`${field}`];
                        if (timeDiff) {
                            timeDiffs[type] = timeDiff;
                            axesObj[type].forEach(axis => axis.minDiff(timeDiff));
                        }
                    }
                });

                context._timeDiffsByField = timeDiffsByField;
                context._timeDiffs = timeDiffs;
                const firebolt = context.firebolt();
                const originalData = context.cachedData()[0];
                const { keys, dimensionsMap, dimensions } = prepareSelectionSetData(context.data(), context);
                firebolt._metaData = {
                    dimensionsMap,
                    dimensions

                };
                firebolt.createSelectionSet({ keys, fields: dimensions.map(d => d.def.name) });
                firebolt.attachPropagationListener(originalData);
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.CONFIG],
        listener: (context, [, config]) => {
            if (config) {
                const firebolt = context.firebolt();
                const { interaction } = config;
                firebolt.config(interaction);
                const { mode } = interaction.tooltip;
                if (mode === FRAGMENTED) {
                    const map = firebolt._behaviourEffectMap;
                    for (const key in map) {
                        const sideEffects = map[key];

                        map[key] = sideEffects.map((val) => {
                            let name = val;
                            if (isSimpleObject(val)) {
                                name = val.name;
                            }
                            if (name === TOOLTIP) {
                                return FRAGMENTED_TOOLTIP;
                            }
                            return val;
                        });
                    }
                }
                createGridLineLayer(context);
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.DATA, PROPS.TRANSFORM],
        listener: (context, [, dataModel], [, transform]) => {
            if (dataModel) {
                const dataModels = transformDataModels(transform, dataModel);
                const metaInf = context.metaInf();
                context.store().commit(`${STATE_NAMESPACES.UNIT_LOCAL_NAMESPACE}.${PROPS.TRANSFORMEDDATA}`,
                    dataModels, metaInf.namespace);
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.TRANSFORMEDDATA, PROPS.LAYERS],
        listener: (context, [, transformedData], [, layers]) => {
            const layerAxisIndexVal = context._layerAxisIndex;
            const axesVal = context.axes();
            const dataModel = context.data();
            if (transformedData && layers && axesVal && layerAxisIndexVal) {
                context._lifeCycleManager.notify({ client: layers, action: 'beforeupdate', formalName: 'layer' });
                attachDataToLayers(layers, dataModel, transformedData);
                context._dimensionMeasureMap = getDimensionMeasureMap(layers,
                    dataModel.getFieldsConfig(), context.retinalFields());
                attachAxisToLayers(axesVal, layers, layerAxisIndexVal);
                context._lifeCycleManager.notify({ client: layers, action: 'updated', formalName: 'layer' });
            }
        }
    }
];
