import {
    FieldType,
    getDependencyOrder,
    getObjProp,
    defaultValue,
    objectIterator,
    unionDomain,
    makeElement,
    DimensionSubtype,
    toArray,
    MeasureSubtype,
    getNearestValue,
    RTree
} from 'muze-utils';
import { layerFactory, ENCODING } from '@chartshq/visual-layer';

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
            if (getObjProp(fieldsConfig, field, 'def', 'type') === FieldType.DIMENSION && measures.length) {
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
    const dependencies = context._dependencies;
    const metaInf = context.metaInf();
    if (!existingLayer) {
        instances = layerFactory.getLayerInstance(definition);
        toArray(instances).forEach((inst, i) => {
            inst.metaInf({
                unitRowIndex: metaInf.rowIndex,
                unitColIndex: metaInf.colIndex,
                namespace: namespaces[i],
                parentNamespace: metaInf.namespace
            })
                .dependencies(dependencies)
                .store(context.store());
        });
    }
    const layers = {};
    const instanceArr = toArray(instances);
    definition = toArray(definition);
    definition.reduce((acc, def, idx) => {
        const instance = instanceArr[idx];
        instance.coord(context.coord());
        instance.config(def);
        instance.valueParser(context.valueParser());
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
                const axisArr = axes[key] || [];
                const axisIndex = axisInf[key] >= 0 ? axisInf[key] : axisArr.length - 1;
                axes[key] && (axesObj[key] = defaultValue(axes[key][axisIndex]));
            }
        });
        Object.keys(axesObj).length && layer.axes(axesObj);
    });
};

const { X, Y, RADIUS, ANGLE, ANGLE0, RADIUS0 } = ENCODING;

export const getLayerAxisIndex = (layers, fields) => {
    const layerAxisIndex = {};
    layers.forEach((layer) => {
        const { axis, encoding } = layer.config();
        const id = layer.id();
        [X, Y, ANGLE, ANGLE0, RADIUS].forEach((type) => {
            let index;
            const specificField = getObjProp(encoding, type, 'field');
            const encodingField = type === RADIUS ? defaultValue(specificField, getObjProp(encoding, RADIUS0, 'field'))
                : getObjProp(encoding, type, 'field');
            const field = defaultValue(getObjProp(axis, type), encodingField);
            if (fields[type] && fields[type].length) {
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

const getValidDomain = (domain, domain1, encodingType, fieldType) => {
    if (encodingType === ANGLE || encodingType === ANGLE0) {
        return domain.concat(domain1.filter(d => domain.indexOf(d) === -1));
    }
    return unionDomain([domain, domain1], fieldType);
};

export const unionDomainFromLayers = (layers, axisFields, layerAxisIndex, fieldsConfig) => {
    let domains = {};
    layers = layers.filter(layer => layer.getDataDomain() !== null);
    layers.forEach((layer) => {
        let domainValues = {};
        const config = layer.config();
        // const encoding = config.encoding;
        const layerDomain = layer.getDataDomain();
        const layerId = layer.id();

        if (layerDomain !== null && config.calculateDomain !== false) {
            domainValues = Object.entries(layerDomain);
            domains = domainValues.reduce((fieldDomain, domain) => {
                const encodingType = domain[0];
                const axisIndex = layerAxisIndex[layerId][encodingType];
                const field = getObjProp(axisFields, encodingType, axisIndex);
                !fieldDomain[encodingType] && (fieldDomain[encodingType] = {});
                const encodingDomain = fieldDomain[encodingType];
                if (field) {
                    const fieldStr = `${field}`;
                    encodingDomain[fieldStr] = encodingDomain[fieldStr] || [];
                    encodingDomain[fieldStr] = getValidDomain(encodingDomain[fieldStr],
                        domain[1], encodingType, fieldsConfig[field.getMembers()[0]].def.subtype);
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
    const orderedLayers = layers.sort((a, b) => a.config().order - b.config().order);
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

    const layerSeq = layerDepOrder.map(name => groups[name]).filter(d => d !== undefined);
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
        key = getNearestValue(filterData, key);
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

export const getRadiusRange = (width, height, config = {}) => {
    const {
        innerRadius,
        outerRadius
    } = config;

    return [innerRadius || 0, outerRadius || Math.min(height,
        width) / 2];
};

export const setAxisRange = (context) => {
    const axes = context.axes();
    const { radius: radiusAxes } = axes;
    if (radiusAxes) {
        radiusAxes.forEach((axis) => {
            axis.range(getRadiusRange(context.width(), context.height()));
        });
    }
};

export const createRTree = (context) => {
    const elements = [].concat(...context.layers().filter(layer => layer.config().interactive !== false)
        .map((layer) => {
            const points = layer.getBoundBoxes();
            return points;
        })).flat().filter(d => d !== null);

    const rtree = new RTree();
    rtree.load(elements);
    return rtree;
};
