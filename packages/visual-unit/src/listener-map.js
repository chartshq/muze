import { DimensionSubtype, STATE_NAMESPACES } from 'muze-utils';
import * as PROPS from './enums/reactive-props';
import {
    transformDataModels,
    getDimensionMeasureMap,
    attachDataToLayers,
    attachAxisToLayers,
    unionDomainFromLayers
} from './helper';

import { createGridLineLayer } from './helper/grid-lines';

const removeExitLayers = (layerDefs, context) => {
    const layersMap = context._layersMap;
    const markSet = {};
    layerDefs.forEach((layerDef, i) => {
        const id = `${layerDef.mark}-${i}`;
        markSet[id] = true;
    });

    for (const key in layersMap) {
        if (!(key in markSet)) {
            layersMap[key].forEach(layer => layer.remove());
            delete layersMap[key];
        }
    }
};

export const calculateDomainListener = (context, namespace) => () => {
    const domain = unionDomainFromLayers(context.layers(), context.fields(), context._layerAxisIndex,
        context.data().getFieldsConfig());
    context.store().commit(`${STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE}.${PROPS.DOMAIN}.${namespace}`, domain);
};

export const listenerMap = (context, namespace, metaInf) => ([
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.CONFIG}.${metaInf.subNamespace}`],
        listener: ([, config]) => {
            config && context.firebolt().config(config.interaction);
        }
    },
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.LAYERDEFS}.${metaInf.subNamespace}`],
        listener: ([, layerDefs]) => {
            const fieldsVal = context.fields();
            if (layerDefs && fieldsVal) {
                removeExitLayers(layerDefs, context);
                context.addLayer(layerDefs);
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
        props: [`${namespace.local}.${PROPS.DATA}.${metaInf.subNamespace}`],
        listener: ([, dataModel]) => {
            const axisFields = context.fields();
            const axesObj = context.axes();
            if (dataModel && axisFields && axesObj) {
                const timeDiffs = {};
                const timeDiffsByField = {};
                ['x', 'y'].forEach((type) => {
                    const field = axisFields[type][0];
                    if (field && field.subtype() === DimensionSubtype.TEMPORAL) {
                        timeDiffs[type] = field.getMinDiff();
                        timeDiffsByField[field] = timeDiffs[type];
                        axesObj[type].forEach(axis => axis.minDiff(timeDiffs[type]));
                    }
                });
                context._timeDiffsByField = timeDiffsByField;
                context._timeDiffs = timeDiffs;
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.DATA}.${metaInf.subNamespace}`,
            `${namespace.local}.${PROPS.LAYERS}.${metaInf.subNamespace}`,
            `${namespace.local}.${PROPS.TRANSFORM}.${metaInf.subNamespace}`],
        listener: ([, dataModel], [, layers], [, transform]) => {
            const layerAxisIndexVal = context._layerAxisIndex;
            const axesVal = context.axes();
            if (dataModel && layers && axesVal && layerAxisIndexVal) {
                const dataModels = transformDataModels(transform, dataModel);
                context._transformedDataModels = dataModels;
                context._lifeCycleManager.notify({ client: layers, action: 'beforeupdate', formalName: 'layer' });
                attachDataToLayers(layers, dataModel, context._transformedDataModels);
                context._dimensionMeasureMap = getDimensionMeasureMap(layers,
                    dataModel.getFieldsConfig(), context.retinalFields());
                attachAxisToLayers(axesVal, layers, layerAxisIndexVal);
                createGridLineLayer(context);
                context._lifeCycleManager.notify({ client: layers, action: 'updated', formalName: 'layer' });
            }
        }
    }
    // {
    //     type: 'registerImmediateListener',
    //     props: [`${STATE_NAMESPACES.UNIT_LOCAL_NAMESPACE}.${PROPS.WIDTH}.${metaInf.subNamespace}`,
    //         `${STATE_NAMESPACES.UNIT_LOCAL_NAMESPACE}.${PROPS.HEIGHT}.${metaInf.subNamespace}`],
    //     listener: () => {
    //         const container = context.mount();
    //         if (container) {
    //             context.render(container);
    //         }
    //     }
    // }
]);
