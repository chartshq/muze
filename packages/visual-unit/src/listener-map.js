import { DimensionSubtype } from 'muze-utils';
import * as PROPS from './enums/reactive-props';
import {
    transformDataModels,
    getDimensionMeasureMap,
    fetchDependencies,
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
        listener: fetch => fetch(PROPS.LAYERDEFS, (layerDefs) => {
            const layerDefsValue = layerDefs.value;
            if (layerDefsValue) {
                const layers = createLayers(context, layerDefs.value);
                context.layers(layers);
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
        props: [PROPS.LAYERAXISINDEX],
        listener: fetch => fetch(PROPS.FIELDS, PROPS.LAYERSCREATED, (fields, layersCreated) => {
            const fieldsVal = fields.value;
            if (fieldsVal && layersCreated.value) {
                return getLayerAxisIndex(context.layers(), fieldsVal);
            }
            return null;
        })
    },
    {
        type: 'computed',
        props: [PROPS.DATADOMAIN],
        listener: fetch => fetch(PROPS.DATA, PROPS.LAYERSCREATED, PROPS.AXES, PROPS.TRANSFORM, PROPS.LAYERAXISINDEX,
            (dataModel, layersCreated, axes, transform, layerAxisIndex) => {
                const dataModelVal = dataModel.value;
                const layerAxisIndexVal = layerAxisIndex.value;
                const axesVal = axes.value;
                if (dataModelVal && layersCreated.value && axesVal && layerAxisIndexVal) {
                    const layers = context.layers();
                    const {
                        dataModels,
                        queuedTransforms
                    } = transformDataModels(transform.value, dataModelVal);
                    context._transformedDataModels = dataModels;
                    context._queuedTransforms = queuedTransforms;
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
            dataDomain != null && context.updateAxisDomain(dataDomain);
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.MOUNT, ...axisProps],
        listener: () => {
            const queuedTransforms = context._queuedTransforms;
            const transformedDataModels = context._transformedDataModels;
            const { x, y } = context.axes();
            if (y && y[0].domain().length && x && x[0].domain().length) {
                for (const key in queuedTransforms) {
                    if ({}.hasOwnProperty.call(queuedTransforms, key)) {
                        const transformVal = queuedTransforms[key];
                        const dependencies = fetchDependencies(context, transformVal.deps);
                        const data = context.data();
                        transformedDataModels[key] = transformVal.fn(...dependencies, data);
                        attachDataToLayers(context.layers(), data, transformedDataModels);
                    }
                }
            }
        }
    },
    {
        type: 'registerImmediateListener',
        props: [PROPS.MOUNT, PROPS.CONFIG, PROPS.WIDTH, PROPS.HEIGHT, ...axisProps],
        listener: ([, container], [, config], [, width], [, height]) => {
            if (container && width && height && config) {
                context.render(container);
            }
        }
    }
]);
