import { STATE_NAMESPACES, temporalFields, getObjProp, defaultValue } from 'muze-utils';
import * as PROPS from './enums/reactive-props';
import {
    transformDataModels,
    getDimensionMeasureMap,
    attachDataToLayers,
    attachAxisToLayers,
    unionDomainFromLayers
} from './helper';

import { createGridLineLayer } from './helper/grid-lines';

export const calculateDomainListener = (context, namespace) => () => {
    const domain = unionDomainFromLayers(context.layers(), context.fields(), context._layerAxisIndex,
        context.data().getFieldsConfig());
    context.store().commit(`${STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE}.${PROPS.DOMAIN}`, domain, namespace);
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
    {
        type: 'registerImmediateListener',
        props: [`${namespace.local}.${PROPS.DATA}`],
        listener: ([, dataModel]) => {
            // console.log('UNITS-DATA', context.metaInf().namespace);
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
                // console.log('UNITS-TRANSFROM-AND-DATA', context.metaInf().namespace);
                context.store().commit(`${namespace.local}.${PROPS.TRANSFORMEDDATA}`, dataModels, metaInf.namespace);
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
                // const model = context.store().model;
                // layers.forEach(lyr => lyr.disableUpdate());
                attachDataToLayers(layers, dataModel, transformedData);
                // model.lock();
                // layers.forEach((lyr) => {
                //     lyr..domain(lyr._domain);
                // });
                // model.unlock();
                context._dimensionMeasureMap = getDimensionMeasureMap(layers,
                    dataModel.getFieldsConfig(), context.retinalFields());
                attachAxisToLayers(axesVal, layers, layerAxisIndexVal);
                context._lifeCycleManager.notify({ client: layers, action: 'updated', formalName: 'layer' });
            }
        }
    }
]);
