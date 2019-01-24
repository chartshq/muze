import { getObjProp, defaultValue, makeElement, DimensionSubtype, DataModel } from 'muze-utils';
import { ScaleType } from '@chartshq/muze-axis';
import { layerFactory, LAYER_TYPES } from '@chartshq/visual-layer';
import {
    GRID_BAND,
    GRID_LINE,
    GRID_BAND_PARENT_GROUP_CLASS,
    GRID_LINE_PARENT_GROUP_CLASS,
    GRID_PARENT_GROUP
} from '../enums/constants';

const { BAR_LAYER, TICK_LAYER } = LAYER_TYPES;

const LINEAR = ScaleType.LINEAR;

const getLayerDefinition = (context, axes, type, orientation) => {
    let encoding;
    const config = context.config();
    const { classPrefix, gridLines, gridBands } = config;
    const gridLineColor = gridLines.color;
    const zeroLineColor = gridLines.zeroLineColor;
    const defClassName = type === GRID_BAND ? gridBands.defClassName : gridLines.defClassName;
    const gridBandColor = gridBands[orientation].color;
    const axis = axes[orientation][0];
    const isLinearScale = axis.constructor.type() === LINEAR;

    if (type === GRID_BAND && isLinearScale) {
        encoding = {
            [orientation]: `${orientation}value`,
            [`${orientation}0`]: `${orientation}value0`
        };
    } else {
        encoding = {
            [orientation]: isLinearScale ? `${orientation}value` : `${orientation}dim`
        };
    }
    encoding.color = {
        value: (data, i) => {
            const isNegativeDomain = isLinearScale && axis.domain()[0] < 0;
            if (type === GRID_BAND) {
                return gridBandColor[i % 2];
            }
            return isNegativeDomain && data[orientation] === 0 ? zeroLineColor : gridLineColor;
        }
    };

    return {
        definition: {
            defClassName: `${defClassName}-${orientation}`,
            className: config.className,
            name: orientation,
            individualClassName: (data, i) => {
                let className;
                const isNegativeDomain = isLinearScale && axis.domain()[0] < 0;
                if (isNegativeDomain && data.y === 0 && type !== GRID_BAND) {
                    className = `${classPrefix}-axis-zero-line`;
                } else {
                    className = `${classPrefix}-grid-${type}-${orientation}-${i % 2}`;
                }
                return className;
            },
            [`pad${orientation.toUpperCase()}`]: type === GRID_BAND ? 0 : undefined,
            encoding
        },
        axes: {
            [orientation]: axis
        },
        interactive: false
    };
};

const getDefaultVisibilty = (show, axis) => {
    if (axis.constructor.type() === LINEAR) {
        return show;
    }
    return false;
};

export const getGridLayerDefinitions = (context, config, type) => ['x', 'y'].map((axisType) => {
    const axes = context.axes();
    if (!axes[axisType]) {
        return null;
    }
    const show = defaultValue(config[axisType] && config[axisType].show,
        getDefaultVisibilty(config.show, axes[axisType][0]));

    return show ? getLayerDefinition(context, axes, type, axisType) : null;
}).filter(d => d !== null);

export const getGridLayerData = (axes, fields, fieldsConfig) => {
    const gridData = {};
    ['x', 'y'].forEach((type) => {
        let ticks = axes[type][0].getTickValues();
        const subtype = getObjProp(fieldsConfig, getObjProp(fields, type, 0).getMembers()[0], 'def', 'subtype');
        const jsonData = [];
        const schema = [
            {
                name: 'yvalue',
                type: 'measure'
            }, {
                name: 'xvalue',
                type: 'measure'
            },
            {
                name: 'yvalue0',
                type: 'measure'
            }, {
                name: 'xvalue0',
                type: 'measure'
            }, {
                name: 'xdim',
                type: 'dimension',
                subtype
            }, {
                name: 'ydim',
                type: 'dimension',
                subtype
            }
        ];
        const len = Math.max(ticks.length);
        ticks = subtype === DimensionSubtype.TEMPORAL ? ticks.map(d => d.getTime()) : ticks;
        for (let i = 0; i < len; i += 1) {
            jsonData.push({
                [`${type}value`]: ticks[i],
                [`${type}value0`]: ticks[i + 1],
                [`${type}dim`]: ticks[i],
                [`${type}dim`]: ticks[i]
            });
        }
        gridData[type] = new DataModel(jsonData, schema);
    });
    return gridData;
};

// @todo Use dataSelect method to reuse instances when the method is fixed. #110
export const createGridLines = (instances = {}, createFn, definitions, iteratorFn) => {
    const map = {};
    definitions.forEach((def) => {
        const name = def.definition.name;
        let instance = instances[name];
        if (!instance) {
            instances[name] = instance = createFn(def);
        }
        iteratorFn(instance, def, name);
        map[name] = 1;
    });
    for (const key in instances) {
        if (!(key in map)) {
            instances[key].remove();
            delete instances[key];
        }
    }
    return instances;
};

export const createGridLineLayer = (context) => {
    const vuConf = context.config();
    const metaInf = context.metaInf();
    const store = context.store();
    const timeDiffs = context._timeDiffs;
    [GRID_BAND, GRID_LINE].forEach((type) => {
        let mark;
        let config;
        if (type === GRID_BAND) {
            mark = BAR_LAYER;
            config = vuConf.gridBands;
        } else {
            mark = TICK_LAYER;
            config = vuConf.gridLines;
        }
        const definitions = getGridLayerDefinitions(context, config, type);

        const sel = `_${type}Selection`;
        context[sel] = createGridLines(context[sel], () => {
            const inst = layerFactory.getLayerInstance({ mark });
            inst.dependencies(context._layerDeps);
            return inst;
        }, definitions, (layer, atomicDef, key) => {
            const definition = atomicDef.definition;
            const sConf = layerFactory.getSerializedConf(mark, definition);
            const axesObj = atomicDef.axes;
            layer.metaInf({
                unitRowIndex: metaInf.rowIndex,
                unitColIndex: metaInf.colIndex,
                namespace: `${metaInf.namespace}${type}${key}`
            })
                .store(store)
                .config(sConf)
                .dataProps({
                    timeDiffs
                })
                .axes(axesObj);
        });
        context[`_${type}`] = Object.values(context[sel]);
    });
};

export const attachDataToGridLineLayers = (context) => {
    const axes = context.axes();
    const measurement = {
        width: context.width(),
        height: context.height()
    };
    const gridLines = context._gridLines;
    const gridBands = context._gridBands;
    const gridLayerData = getGridLayerData(axes, context.fields(), context.data().getFieldsConfig());
    [].concat(...gridBands, ...gridLines).forEach((inst) => {
        inst.data(inst.axes().x ? gridLayerData.x : gridLayerData.y).measurement(measurement);
    });
};

export const renderGridLineLayers = (context, container) => {
    const config = context.config();
    const classPrefix = config.classPrefix;
    const gridLines = context._gridLines;
    const gridBands = context._gridBands;

    const gridLineParentGroup = makeElement(container, 'g', [1], `${classPrefix}-${GRID_PARENT_GROUP}`);
    [[gridLines, `${classPrefix}-${GRID_LINE_PARENT_GROUP_CLASS}`],
            [gridBands, `${classPrefix}-${GRID_BAND_PARENT_GROUP_CLASS}`]].forEach((entry) => {
                const [instances, parentGroupClass] = entry;
                const mountPoint = makeElement(gridLineParentGroup, 'g', [1], `.${parentGroupClass}`);
                const className = `${parentGroupClass}-group`;
                makeElement(mountPoint, 'g', instances, `.${className}`, {
                    update: (group, instance) => {
                        instance.dataProps({ timeDiffs: context._timeDiffs }).mount(group.node());
                    }
                });
            });
};
