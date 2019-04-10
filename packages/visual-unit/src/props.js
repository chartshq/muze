import { mergeRecursive, getObjProp, defaultValue, temporalFields } from 'muze-utils';
import { CONFIG, LAYERDEFS, TRANSFORM, DATA, LAYERS, TRANSFORMEDDATA } from './enums/reactive-props';
import { FACET_BY_FIELDS, RETINAL_FIELDS, PARENT_ALIAS, CACHED_DATA } from './enums/constants';
import { defaultConfig } from './default-config';
import { sanitizeLayerDef, getValuesMap, transformDataModels } from './helper';
import { createGridLineLayer } from './helper/grid-lines';

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

export const PROPS = {
    [FACET_BY_FIELDS]: {},
    [RETINAL_FIELDS]: {},
    [PARENT_ALIAS]: {},
    [LAYERS]: {},
    [CACHED_DATA]: {},
    detailFields: {},
    [CONFIG]: {
        value: null,
        sanitization: (context, config, oldConfig) => (
            mergeRecursive(oldConfig || mergeRecursive({}, defaultConfig), config)
        ),
        onset: (context, config) => {
            if (config) {
                config && context.firebolt().config(config.interaction);
                createGridLineLayer(context);
            }
        }
    },
    [LAYERDEFS]: {
        value: null,
        preset: (context, layerDef) => sanitizeLayerDef(layerDef),
        onset: (context, layerDefs) => {
            const fieldsVal = context.fields();
            // console.log('UNITS-LDF', context.metaInf().namespace);
            if (layerDefs && fieldsVal) {
                removeExitLayers(layerDefs, context);
                context.addLayer(layerDefs);
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
    [TRANSFORM]: {
        value: null
    },
    [LAYERS]: {
        value: null
    },
    [DATA]: {
        value: null,
        preset: (context, data) => {
            context._cachedValuesMap = ((model) => {
                let valuesMap = null;
                return () => {
                    if (valuesMap) {
                        return valuesMap;
                    }
                    valuesMap = getValuesMap(model, context);
                    return valuesMap;
                };
            })(data);
            if (context._cache) {
                const cachedData = context.cachedData();
                context.cachedData([...cachedData, data]);
            } else {
                const oldData = context.cachedData()[0];
                oldData && oldData.unsubscribe('propagation');
                context.cachedData([data]);
            }
            const axesObj = context.axes();
            const timeDiffs = {};
            const timeDiffsByField = {};

            Object.entries(temporalFields(data)).forEach(([fieldName, fieldObj]) => {
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
            const dataModel = context.data();
            context.transformedData(transformDataModels(context.transform(), dataModel));
        }
    },
    [TRANSFORMEDDATA]: {
        value: null
    },
    axes: {
        defaultValue: {
            x: [],
            y: []
        }
    },
    fields: {
        defaultValue: {
            x: [],
            y: []
        },
        sanitization: (context, value) => mergeRecursive({
            x: [],
            y: []
        }, value)
    },
    metaInf: {},
    registry: {},
    width: {},
    height: {},
    parentContainerInf: {},
    valueParser: {
        defaultValue: val => val
    },
    coord: {}
};
