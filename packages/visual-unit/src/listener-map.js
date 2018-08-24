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

const axisMap = {
    0: 'primary',
    1: 'secondary'
};
const axisProps = [PROPS.primaryXAxisUpdated, PROPS.secondaryXAxisUpdated, PROPS.primaryYAxisUpdated,
    PROPS.secondaryYAxisUpdated];

export const listenerMap = context => ([
    {
        type: 'registerImmediateListener',
        props: [PROPS.AXES],
        listener: ([, axes]) => {
            ['x', 'y'].forEach((type) => {
                const axesArr = axes[type] || [];
                axesArr.forEach((axis, i) => {
                    axis.on('update', () => {
                        context.store().commit(PROPS[`${axisMap[i]}${axis.isReverse() ? 'Y' : 'X'}AxisUpdated`], true);
                    });
                });
            });
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.CONFIG],
        listener: ([, config]) => {
            config && context.firebolt().config(config.interaction);
        }
    },
    {
        type: 'computed',
        props: [PROPS.LAYERSCREATED],
        listener: fetch => fetch(PROPS.LAYERDEFS, PROPS.FIELDS, (layerDefs, fields) => {
            const layerDefsValue = layerDefs.value;
            const fieldsVal = fields.value;
            if (layerDefsValue && fieldsVal) {
                const layers = createLayers(context, layerDefs.value);
                context.layers(layers);
                context._layerAxisIndex = getLayerAxisIndex(context.layers(), fieldsVal);
                context._lifeCycleManager.notify({ client: layers, action: 'initialized', formalName: 'layer' });
                return true;
            }
            return null;
        })
    },
    {
        type: 'computed',
        props: [PROPS.TIMEDIFFS],
        listener: fetch => fetch(PROPS.DATA, PROPS.FIELDS, PROPS.AXES, (data, fields, axes) => {
            const dataModel = data.value;
            const axisFields = fields.value;
            const axesObj = axes.value;
            if (dataModel && axisFields && axesObj) {
                const timeDiffs = {};
                ['x', 'y'].forEach((type) => {
                    const field = axisFields[type][0];
                    if (field && field.subtype() === DimensionSubtype.TEMPORAL) {
                        timeDiffs[type] = field.getMinDiff();
                        axesObj[type][0].minDiff(timeDiffs[type]);
                    }
                });
                return timeDiffs;
            }
            return null;
        })
    },
    {
        type: 'computed',
        props: [PROPS.DATADOMAIN],
        listener: fetch => fetch(PROPS.DATA, PROPS.LAYERSCREATED, PROPS.AXES, PROPS.TRANSFORM,
            (dataModel, layersCreated, axes, transform) => {
                const dataModelVal = dataModel.value;
                const layerAxisIndexVal = context._layerAxisIndex;
                const axesVal = axes.value;
                if (dataModelVal && layersCreated.value && axesVal && layerAxisIndexVal) {
                    const layers = context.layers();
                    const dataModels = transformDataModels(transform.value, dataModelVal);
                    context._transformedDataModels = dataModels;
                    context._lifeCycleManager.notify({ client: layers, action: 'beforeupdate', formalName: 'layer' });
                    attachDataToLayers(layers, dataModelVal, context._transformedDataModels);
                    context._dimensionMeasureMap = getDimensionMeasureMap(layers,
                        dataModelVal.getFieldsConfig(), context.retinalFields());
                    attachAxisToLayers(axesVal, layers, layerAxisIndexVal);
                    context._lifeCycleManager.notify({ client: layers, action: 'updated', formalName: 'layer' });
                    return unionDomainFromLayers(layers, context.fields(),
                        layerAxisIndexVal, dataModelVal.getFieldsConfig());
                }
                return null;
            })
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.DATADOMAIN],
        listener: ([, dataDomain]) => {
            dataDomain !== null && context.updateAxisDomain(dataDomain);
        }
    },
    {
        type: 'registerChangeListener',
        props: [PROPS.MOUNT, PROPS.DATA, ...axisProps],
        listener: (mount, data) => {
            const container = mount[1];
            if (container && data[1]) {
                context.render(container);
            }
        }
    }
]);
