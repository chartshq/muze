import { mergeRecursive, DataModel } from 'muze-utils';
import { defaultConfig } from './default-config';
import { CONFIG, LAYERDEFS, TRANSFORM, DATA, LAYERS, TRANSFORMEDDATA } from './enums/reactive-props';
import { sanitizeLayerDef, getValuesMap } from './helper';

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

export default {
    [CONFIG]: {
        value: null,
        meta: {
            sanitization: (config, oldConfig) => (
                mergeRecursive(oldConfig || mergeRecursive({}, defaultConfig), config)
            )
        }
    },
    [LAYERDEFS]: {
        value: null,
        meta: {
            preset: layerDef => sanitizeLayerDef(layerDef)
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
        meta: {
            typeCheck: d => d instanceof DataModel,
            preset: (data, context) => {
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
            }
        }
    },
    [TRANSFORMEDDATA]: {
        value: null
    }
};
