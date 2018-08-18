import { FieldType, getDependencyOrder, getObjProp,
    defaultValue, objectIterator, unionDomain, makeElement,
    DimensionSubtype, getClosestIndexOf, toArray } from 'muze-utils';
import { layerFactory } from '@chartshq/visual-layer';
import { TIMEDIFFS } from '../enums/reactive-props';

export const getDimensionMeasureMap = (layers, fieldsConfig) => {
    const retinalEncodingsAndMeasures = {};

    layers.forEach((layer) => {
        const {
            colorField,
            sizeField,
            shapeField,
            xField,
            yField
        } = layer.encodingFieldsInf();
        const measures = [xField, yField].filter(field => fieldsConfig[field] && fieldsConfig[field].def.type ===
            FieldType.MEASURE);
        [colorField, sizeField, shapeField].forEach((field) => {
            if (fieldsConfig[field] && fieldsConfig[field].def.type === FieldType.DIMENSION) {
                !retinalEncodingsAndMeasures[field] && (retinalEncodingsAndMeasures[field] = []);
                retinalEncodingsAndMeasures[field].push(...measures);
            }
        });
    });

    for (const key in retinalEncodingsAndMeasures) {
        if ({}.hasOwnProperty.call(retinalEncodingsAndMeasures, key)) {
            retinalEncodingsAndMeasures[key] = [...new Set(retinalEncodingsAndMeasures[key])];
        }
    }
    return retinalEncodingsAndMeasures;
};

export const fetchDependencies = (context, depNames) => depNames.map(dep => context.axes()[`${dep}`]);

export const transformDataModels = (transform, dataModel) => {
    let transformDeps = [];
    const dataModels = {};
    const transforms = {};

    for (const key in transform) {
        if ({}.hasOwnProperty.call(transform, key)) {
            const transformVal = transform[key];
            if (transformVal instanceof Array) {
                const deps = transformVal.slice(0, transformVal.length - 1);
                const fn = transformVal[transformVal.length - 1];
                if (transformVal.length > 1) {
                    transformDeps = [...transformDeps, ...deps];
                    transforms[key] = {
                        fn,
                        deps
                    };
                } else {
                    dataModels[key] = fn(dataModel);
                }
            } else {
                dataModels[key] = transformVal(dataModel);
            }
        }
    }

    return {
        dataModels,
        queuedTransforms: transforms
    };
};

export const linkDependencies = (context, layers, layerDeps, layerStore) => {
    layers.forEach((layer) => {
        const alias = layer.alias();
        const deps = layerDeps[alias];
        const store = {
            unit: context
        };
        if (deps.length) {
            store.layers = {};
            deps.forEach((dep) => {
                store.layers[dep] = layerStore[dep];
            });
            store.layers[alias] = layer;
        }
        layer.linkLayerStore(store);
    });
};

export const getLayerFromDef = (context, definition, existingLayer) => {
    let instances = existingLayer;
    const dependencies = context._layerDeps;
    if (!existingLayer) {
        instances = layerFactory.getLayerInstance(definition);
    }
    const layerStore = {};
    const instanceArr = toArray(instances);
    definition = toArray(definition);
    const layerDeps = definition.reduce((acc, def, idx) => {
        const instance = instanceArr[idx];
        instance.config(def);
        instance.dependencies(dependencies);
        if (def.name) {
            instance.alias(def.name);
        }
        acc[instance.alias()] = def.source || [];
        layerStore[instance.alias()] = instance;
        return acc;
    }, {});

    const order = getDependencyOrder(layerDeps);
    linkDependencies(context, instanceArr, layerDeps, layerStore);
    return order.map(name => layerStore[name]);
};

export const createLayers = (context, layerDefinitions) => {
    const layersMap = context._layersMap;
    const markSet = {};
    const layers = layerDefinitions.reduce((layersArr, layerDef, i) => {
        const mark = layerDef.mark;
        const definition = layerDef.def;
        const markId = `${mark}-${i}`;
        const instances = getLayerFromDef(context, definition, layersMap[markId]);
        layersArr = layersArr.concat(...instances);
        layersMap[markId] = instances;
        markSet[markId] = markId;
        return layersArr;
    }, []);

    for (const key in layersMap) {
        if (!(key in markSet)) {
            layersMap[key].forEach(layer => layer.remove());
            delete layersMap[key];
        }
    }
    return layers;
};

export const attachDataToLayers = (layers, dm, transformedDataModels) => {
    layers.forEach((layer) => {
        const dataSource = layer.config().dataSource;
        const dataModel = dataSource instanceof Function ? dataSource(dm) : (transformedDataModels[dataSource] || dm);
        layer.data(dataModel);
    });
};

export const attachAxisToLayers = (axes, layers, layerAxisIndex) => {
    layers.forEach((layer) => {
        const layerId = layer.id();
        const axesObj = {};

        objectIterator(axes, (key) => {
            const axisInf = layerAxisIndex[layerId];
            if (axisInf) {
                axes[key] && (axesObj[key] = axes[key][axisInf[key] || 0]);
            }
        });
        Object.keys(axesObj).length && layer.axes(axesObj);
    });
};

export const getLayerAxisIndex = (layers, fields) => {
    const layerAxisIndex = {};
    layers.forEach((layer) => {
        const { axis, encoding } = layer.config();
        const id = layer.id();
        ['x', 'y'].forEach((type) => {
            let index;
            const field = defaultValue(getObjProp(axis, type), encoding[type] && encoding[type].field);
            if (fields[type]) {
                index = fields[type].findIndex(fieldInst => fieldInst.getMembers().indexOf(field) !== -1);
            } else {
                index = 0;
            }
            !layerAxisIndex[id] && (layerAxisIndex[id] = {});
            layerAxisIndex[id][type] = index;
        });
    });
    return layerAxisIndex;
};

export const unionDomainFromLayers = (layers, axisFields, layerAxisIndex, fieldsConfig) => {
    let domains = {};
    layers = layers.filter(layer => layer.getDataDomain() !== null);
    layers.forEach((layer) => {
        let domainValues = {};
        const config = layer.config();
        const encoding = config.encoding;
        const layerDomain = layer.getDataDomain();
        const layerId = layer.id();

        if (layerDomain !== null && config.calculateDomain !== false) {
            domainValues = Object.entries(layerDomain);
            if (layerDomain.x || layerDomain.y) {
                domains = domainValues.reduce((fieldDomain, domain) => {
                    const encodingType = domain[0];
                    const field = encoding[encodingType].field;
                    const axisIndex = layerAxisIndex[layerId][encodingType];
                    const fieldStr = `${axisFields[encodingType][axisIndex]}`;
                    fieldDomain[fieldStr] = fieldDomain[fieldStr] || [];
                    fieldDomain[fieldStr] = unionDomain(([fieldDomain[fieldStr], domain[1]]),
                        fieldsConfig[field].def.subtype ? fieldsConfig[field].def.subtype :
                                fieldsConfig[field].def.type);

                    return fieldDomain;
                }, domains);
            } else { domains = domainValues; }
        }
    });
    return domains;
};

export const renderLayers = (context, container, layers, measurement) => {
    context._lifeCycleManager.notify({ client: layers, action: 'beforedraw', formalName: 'layer' });
    const config = context.config();
    const classPrefix = config.classPrefix;
    const orderedLayers = context.layers().sort((a, b) => a.config().order - b.config().order);
    const layerParentGroup = makeElement(container, 'g', [1], `${classPrefix}-layer-group`);
    makeElement(layerParentGroup, 'g', orderedLayers, null, {
        update: (group, layer) => {
            layer.measurement(measurement);
            layer.dataProps({
                timeDiffs: context.store().get(TIMEDIFFS)
            });
            layer.mount(group.node());
        }
    });
    return this;
};

export const getNearestDimensionalValue = (context, position) => {
    const fields = context.fields();
    if (!fields.x.length || !fields.y.length) {
        return null;
    }
    const data = context.data();
    const axes = context.axes();
    const fieldsConfig = data.getFieldsConfig();
    const xField = getObjProp(fields, 'x', 0).getMembers()[0];
    const yField = getObjProp(fields, 'y', 0).getMembers()[0];
    const xFieldType = fieldsConfig[xField] && (fieldsConfig[xField].def.subtype ? fieldsConfig[xField].def.subtype :
        fieldsConfig[xField].def.type);
    const yFieldType = fieldsConfig[yField] && (fieldsConfig[yField].def.subtype ? fieldsConfig[yField].def.subtype :
                fieldsConfig[yField].def.type);

    const entryVal = [['x', xFieldType, xField], ['y', yFieldType, yField]].find(entry =>
        entry[1] === DimensionSubtype.CATEGORICAL || entry[1] === DimensionSubtype.TEMPORAL);

    if (!entryVal || (xFieldType !== FieldType.MEASURE && yFieldType !== FieldType.MEASURE)) {
        return null;
    }
    const field = entryVal[2];
    const index = fieldsConfig[field].index;
    let key = axes[entryVal[0]][0].invert(position[entryVal[0]]);
    if (entryVal[1] === DimensionSubtype.TEMPORAL) {
        const filterData = [...new Set(data.getData().data.map(d => d[index]))];
        key = filterData[getClosestIndexOf(filterData, key)];
    }

    return key !== undefined ? [[field], [key]] : null;
};

export const getLayersBy = (layers, searchBy, value) => layers.filter((layer) => {
    const name = searchBy === 'type' ? layer.constructor.formalName() : layer.alias();
    return name === value;
});

export const removeLayersBy = (layers, searchBy, value) => {
    layers.filter((inst) => {
        const name = searchBy === 'type' ? inst.config().mark : inst.alias();
        if (name === value) {
            inst.remove();
            return false;
        }
        return true;
    });
};

export const createSideEffectGroup = (container, className) => makeElement(container, 'g', [1], className).node();
