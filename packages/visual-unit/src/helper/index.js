import {
    FieldType,
    getDependencyOrder,
    getObjProp,
    defaultValue,
    objectIterator,
    unionDomain,
    makeElement,
    DimensionSubtype,
    getClosestIndexOf,
    toArray,
    MeasureSubtype
} from 'muze-utils';
import { layerFactory } from '@chartshq/visual-layer';

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

export const transformDataModels = (transform, dataModel) => {
    const dataModels = {};
    for (const key in transform) {
        if ({}.hasOwnProperty.call(transform, key)) {
            const transformVal = transform[key];
            dataModels[key] = transformVal(dataModel);
        }
    }

    return dataModels;
};

export const getLayerFromDef = (context, definition, existingLayer, namespaces) => {
    let instances = existingLayer;
    const dependencies = context._layerDeps;
    const metaInf = context.metaInf();
    if (!existingLayer) {
        instances = layerFactory.getLayerInstance(definition);
        toArray(instances).forEach((inst, i) => {
            inst.metaInf({
                unitRowIndex: metaInf.rowIndex,
                unitColIndex: metaInf.colIndex,
                namespace: namespaces[i]
            });
            inst.store(context.store());
        });
    }
    const layers = {};
    const instanceArr = toArray(instances);
    definition = toArray(definition);
    definition.reduce((acc, def, idx) => {
        const instance = instanceArr[idx];
        instance.config(def);
        instance.dependencies(dependencies);
        instance.dataProps({
            timeDiffs: context._timeDiffs
        });
        if (def.name) {
            instance.alias(def.name);
        }
        layers[instance.alias()] = instance;
        return acc;
    }, {});
    return layers;
};

export const resolveEncodingTransform = (layerInst, store) => {
    const encodingTransform = layerInst.config().encodingTransform || {};
    const resolvable = encodingTransform.resolvable;
    let depArr = [];
    if (resolvable) {
        const resolved = resolvable(store);
        depArr = resolved.depArr;
        layerInst.encodingTransform(resolved.fn);
    } else if (encodingTransform instanceof Function) {
        layerInst.encodingTransform(encodingTransform);
    }
    return depArr;
};

export const createLayers = (context, layerDefinitions) => {
    const layersMap = context._layersMap;
    const markSet = {};
    const store = {
        layers: {},
        components: {
            unit: context
        }
    };
    let layerIndex = 0;
    let layers = layerDefinitions.sort((a, b) => a.order - b.order).reduce((layersArr, layerDef, i) => {
        const mark = layerDef.mark;
        const definition = layerDef.def;
        const markId = `${mark}-${i}`;
        const defArr = toArray(definition);
        defArr.forEach((def) => {
            def.order = layerDef.order + layerIndex;
        });
        layerIndex += defArr.length;
        const instances = getLayerFromDef(context, definition, layersMap[markId], i);
        store.layers = Object.assign(store.layers, instances);
        const instanceValues = Object.values(instances);
        layersArr = layersArr.concat(...instanceValues);
        layersMap[markId] = instanceValues;
        markSet[markId] = markId;
        return layersArr;
    }, []);
    store.unit = context;
    const layerdeps = {};
    layers.forEach((layer) => {
        const depArr = resolveEncodingTransform(layer, store);
        layerdeps[layer.alias()] = depArr;
    });

    const order = getDependencyOrder(layerdeps);
    layers = order.map(name => store.layers[name]);
    for (const key in layersMap) {
        if (!(key in markSet)) {
            layersMap[key].forEach(layer => layer.remove());
            delete layersMap[key];
        }
    }
    return layers;
};

export const sanitizeLayerDef = (layerDefs) => {
    const sanitizedDefs = [];
    layerDefs.forEach((layerDef, i) => {
        const def = layerDef.def;
        const mark = layerDef.mark;
        if (!def) {
            const sConf = layerFactory.getSerializedConf(layerDef.mark, layerDef);
            if (!sConf.name) {
                sConf.name = `${mark}-${i}`;
            }
            sanitizedDefs.push({
                mark: layerDef.mark,
                def: sConf
            });
        } else {
            if (!def.name) {
                def.name = `${mark}-${i}`;
            }
            sanitizedDefs.push(layerDef);
        }
    });
    return sanitizedDefs;
};

export const attachDataToLayers = (layers, dm, transformedDataModels) => {
    layers.forEach((layer) => {
        const dataSource = layer.config().source;
        const dataModel = dataSource instanceof Function ? dataSource(dm) :
            (transformedDataModels[dataSource] || dm);
        if (layer.data() !== dataModel) {
            layer.data(dataModel);
        }
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
            domains = domainValues.reduce((fieldDomain, domain) => {
                const encodingType = domain[0];
                const field = encoding[encodingType].field;
                const axisIndex = layerAxisIndex[layerId][encodingType];
                if (encodingType in axisFields) {
                    const fieldStr = `${axisFields[encodingType][axisIndex]}`;
                    fieldDomain[fieldStr] = fieldDomain[fieldStr] || [];
                    fieldDomain[fieldStr] = unionDomain(([fieldDomain[fieldStr], domain[1]]),
                        fieldsConfig[field].def.subtype ? fieldsConfig[field].def.subtype :
                                fieldsConfig[field].def.type);
                } else {
                    fieldDomain[encodingType] = domain[1];
                }
                return fieldDomain;
            }, domains);
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
    const layerDepOrder = getDependencyOrder(context._layerDepOrder);
    const groups = {};
    makeElement(layerParentGroup, 'g', orderedLayers, null, {
        update: (group, layer) => {
            groups[layer.alias()] = {
                group,
                layer
            };
        }
    });
    const layerSeq = layerDepOrder.map(name => groups[name]);
    layerSeq.forEach((o) => {
        const layer = o.layer;
        const group = o.group;
        layer.measurement(measurement);
        layer.dataProps({
            timeDiffs: context._timeDiffs
        });
        layer.config().render !== false && layer.mount(group.node());
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
    const xFieldType = fieldsConfig[xField].def.subtype;
    const yFieldType = fieldsConfig[yField].def.subtype;

    const entryVal = [['x', xFieldType, xField], ['y', yFieldType, yField]].find(entry =>
        entry[1] === DimensionSubtype.CATEGORICAL || entry[1] === DimensionSubtype.TEMPORAL);

    if (!entryVal || (xFieldType !== MeasureSubtype.CONTINUOUS && yFieldType !== MeasureSubtype.CONTINUOUS)) {
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

export const createRenderPromise = (unit) => {
    const renderedPromise = unit._renderedPromise;
    renderedPromise.then(() => {
        unit._renderedPromise = new Promise((resolve) => {
            unit._renderedResolve = resolve;
        });
        createRenderPromise(unit);
    });
};
