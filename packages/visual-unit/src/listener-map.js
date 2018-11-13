import { DimensionSubtype } from 'muze-utils';
import * as PROPS from './enums/reactive-props';
import {
    transformDataModels,
    getDimensionMeasureMap,
    createLayers,
    attachDataToLayers,
    attachAxisToLayers,
    unionDomainFromLayers,
    getLayerAxisIndex
} from './helper';

import { createGridLineLayer } from './helper/grid-lines';

const calculateDomainListener = (context, namespace, metaInf) => () => {
    const domain = unionDomainFromLayers(context.layers(), context.fields(),
    context._layerAxisIndex, context.data().getFieldsConfig());
    context.updateAxisDomain(domain);
    context.store().commit(`${namespace.global}.${PROPS.DOMAIN}.${metaInf.subNamespace}`, domain);
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
                const layers = createLayers(context, layerDefs);
                context._layerAxisIndex = getLayerAxisIndex(layers, fieldsVal);
                context._lifeCycleManager.notify({ client: layers, action: 'initialized', formalName: 'layer' });
                const props = new Array(layers.length).fill().map((d, i) =>
                    `app.layers.domain.${metaInf.subNamespace}${i}`);
                context._store.unsubscribe({
                    key: 'calculateDomainListener',
                    namespace: `${namespace.local}.${metaInf.subNamespace}`
                });
                context.store().registerImmediateListener(props, calculateDomainListener(context, namespace, metaInf),
                    false, {
                        key: 'calculateDomainListener',
                        namespace: `${namespace.local}.${metaInf.subNamespace}`
                    });
                context.layers(layers);
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
                const dataModels = transformDataModels(transform.value, dataModel);
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
    },
    {
        type: 'registerChangeListener',
        props: [`app.group.${PROPS.DOMAIN}.x.0${metaInf.colIndex}0`,
            `app.group.${PROPS.DOMAIN}.y.${metaInf.rowIndex}00`, 'app.group.domain.radius'],
        listener: () => {
            const container = context.mount();
            console.log('unitRender');
            if (container) {
                context.render(container);
            }
        }
    }
]);
