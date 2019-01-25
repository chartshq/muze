import { STATE_NAMESPACES, temporalFields } from 'muze-utils';
import * as PROPS from './enums/reactive-props';
import {
    transformDataModels,
    getDimensionMeasureMap,
    attachDataToLayers,
    attachAxisToLayers,
    unionDomainFromLayers
} from './helper';

import { createGridLineLayer, attachDataToGridLineLayers } from './helper/grid-lines';

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
        props: [`${namespace.local}.${PROPS.CONFIG}`],
        listener: ([, config]) => {
            config && context.firebolt().config(config.interaction);
        }
    },
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.LAYERDEFS}`],
        listener: ([, layerDefs]) => {
            const fieldsVal = context.fields();
            if (layerDefs && fieldsVal) {
                removeExitLayers(layerDefs, context);
                const axes = context.axes();
                if (axes.x || axes.y) {
                    const props = [`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.y.${metaInf.rowIndex}0`,
                        `${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.x.${metaInf.colIndex}0`];
                    const store = context.store();
                    const listenerInf = {
                        namespace: namespace.local,
                        key: 'gridLineListener'
                    };
                    store.unsubscribe(listenerInf);
                    store.registerChangeListener(props, () => {
                        attachDataToGridLineLayers(context);
                    }, false, listenerInf);
                }

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
        props: [`${namespace.local}.${PROPS.DATA}`],
        listener: ([, dataModel]) => {
            const axesObj = context.axes();
            const timeDiffs = {};
            const timeDiffsByField = {};

            Object.entries(temporalFields(dataModel)).forEach(([fieldName, fieldObj]) => {
                timeDiffsByField[fieldName] = fieldObj.minimumConsecutiveDifference();
            });

            Object.entries(context.fields()).forEach(([type, [field]]) => {
                if (field) {
                    const timeDiff = timeDiffsByField[field.oneVar()];
                    if (timeDiff) {
                        timeDiffs[type] = timeDiff;
                        axesObj[type].forEach(axis => axis.minDiff(timeDiff));
                    }
                }
            });

            context._timeDiffsByField = timeDiffsByField;
            context._timeDiffs = timeDiffs;
        }
    },
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.CONFIG}`],
        listener: () => {
            createGridLineLayer(context);
        }
    },
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.DATA}`,
            `${namespace.local}.${PROPS.TRANSFORM}`],
        listener: ([, dataModel], [, transform]) => {
            if (dataModel) {
                const dataModels = transformDataModels(transform, dataModel);
                context.store().commit(`${namespace.local}.${PROPS.TRANSFORMEDDATA}`, dataModels);
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.TRANSFORMEDDATA}`,
            `${namespace.local}.${PROPS.LAYERS}`],
        listener: ([, transformedData], [, layers]) => {
            const layerAxisIndexVal = context._layerAxisIndex;
            const axesVal = context.axes();
            const dataModel = context.data();
            if (transformedData && layers && axesVal && layerAxisIndexVal) {
                context._lifeCycleManager.notify({ client: layers, action: 'beforeupdate', formalName: 'layer' });
                const model = context.store().model;
                layers.forEach(lyr => lyr.disableUpdate());
                attachDataToLayers(layers, dataModel, transformedData);
                model.lock();
                layers.forEach((lyr) => {
                    lyr.enableUpdate().domain(lyr._domain);
                });
                model.unlock();
                context._dimensionMeasureMap = getDimensionMeasureMap(layers,
                    dataModel.getFieldsConfig(), context.retinalFields());
                attachAxisToLayers(axesVal, layers, layerAxisIndexVal);
                context._lifeCycleManager.notify({ client: layers, action: 'updated', formalName: 'layer' });
            }
        }
    }
]);
