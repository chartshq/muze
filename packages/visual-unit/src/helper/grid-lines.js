import { getObjProp, defaultValue, makeElement, DimensionSubtype, DataModel } from 'muze-utils';
import { ScaleType } from '@chartshq/muze-axis';
import { layerFactory } from '@chartshq/visual-layer';
import { GRIDLINEPARENTGROUPCLASS, GRIDBANDPARENTGROUPCLASS } from '../enums/constants';

const LINEAR = ScaleType.LINEAR;

const getLayerDefinition = (context, axes, type, orientation) => {
    let encoding;
    const config = context.config();
    const { classPrefix, gridLines, gridBands } = config;
    const gridLineColor = gridLines.color;
    const zeroLineColor = gridLines.zeroLineColor;
    const defClassName = type === 'band' ? gridBands.defClassName : gridLines.defClassName;
    const gridBandColor = gridBands[orientation].color;
    const axis = axes[orientation][0];
    const isLinearScale = axis.constructor.type() === LINEAR;

    if (type === 'band' && isLinearScale) {
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
            if (type === 'band') {
                return gridBandColor[i % 2];
            }
            return isNegativeDomain && data[orientation] === 0 ? zeroLineColor : gridLineColor;
        }
    };

    return {
        definition: {
            defClassName: `${defClassName}-${orientation}`,
            className: config.className,
            individualClassName: (data, i) => {
                let className;
                const isNegativeDomain = isLinearScale && axis.domain()[0] < 0;
                if (isNegativeDomain && data.y === 0 && type !== 'band') {
                    className = `${classPrefix}-axis-zero-line`;
                } else {
                    className = `${classPrefix}-grid-${type}-${orientation}-${i % 2}`;
                }
                return className;
            },
            padY: type === 'band' ? 0 : undefined,
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
    const show = defaultValue(config[axisType] && config[axisType].show,
        getDefaultVisibilty(config.show, context.axes()[axisType][0]));

    return show && getLayerDefinition(context, context.axes(), type, axisType);
}).filter(d => d !== undefined);

export const getGridLayerData = (axes, fields, fieldsConfig) => {
    let xticks = axes.x[0].getTickValues();
    let yticks = axes.y[0].getTickValues();
    const xSubType = getObjProp(fieldsConfig, getObjProp(fields, 'x', 0).getMembers()[0], 'def', 'subtype');
    const ySubType = getObjProp(fieldsConfig, getObjProp(fields, 'y', 0).getMembers()[0], 'def', 'subtype');
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
            subtype: xSubType
        }, {
            name: 'ydim',
            type: 'dimension',
            subtype: ySubType
        }
    ];
    const len = Math.max(yticks.length, xticks.length);
    xticks = xSubType === DimensionSubtype.TEMPORAL ? xticks.map(d => d.getTime()) : xticks;
    yticks = ySubType === DimensionSubtype.TEMPORAL ? yticks.map(d => d.getTime()) : yticks;
    for (let i = 0; i < len; i += 1) {
        jsonData.push({
            yvalue: yticks[i],
            yvalue0: yticks[i + 1],
            xvalue: xticks[i],
            xvalue0: xticks[i + 1],
            xdim: xticks[i],
            ydim: yticks[i]
        });
    }
    return new DataModel(jsonData, schema);
};

export const createGridLineLayer = (context, data) => {
    const vuConf = context.config();
    const dependencies = context._layerDeps;
    const measurement = {
        width: context.width(),
        height: context.height()
    };

    ['band', 'line'].forEach((type) => {
        let mark;
        let config;
        let instances;
        if (type === 'band') {
            mark = 'bar';
            config = vuConf.gridBands;
            instances = context._gridbands;
        } else {
            mark = 'tick';
            config = vuConf.gridLines;
            instances = context._gridlines;
        }
        const definitions = getGridLayerDefinitions(context, config, type);

        definitions.forEach((atomicDef, i) => {
            let layer;
            const definition = atomicDef.definition;
            const axesObj = atomicDef.axes;
            const sConf = layerFactory.getSerializedConf(mark, definition);
            sConf.mark = mark;
            if (!instances[i]) {
                layer = layerFactory.getLayerInstance(sConf);
                layer.dependencies(dependencies);
            } else {
                layer = instances[i];
            }

            layer.config(sConf)
                            .measurement(measurement)
                            .data(data)
                            .axes(axesObj);
            instances[i] = layer;
        });
    });
};

export const renderGridLineLayers = (context, container) => {
    const axes = context.axes();
    const config = context.config();
    const classPrefix = config.classPrefix;

    if (axes && ((axes.x && axes.x.length) || (axes.y && axes.y.length))) {
        const gridBandData = getGridLayerData(axes, context.fields(), context.data().getFieldsConfig());
        createGridLineLayer(context, gridBandData);
        [[context._gridlines, `${classPrefix}-${GRIDLINEPARENTGROUPCLASS}`],
            [context._gridbands, `${classPrefix}-${GRIDBANDPARENTGROUPCLASS}`]].forEach((entry) => {
                const [instances, parentGroupClass] = entry;
                const mountPoint = makeElement(container, 'g', [1], `.${parentGroupClass}`);
                const className = `${parentGroupClass}-group`;
                makeElement(mountPoint, 'g', instances, `.${className}`, {
                    update: (group, instance) => {
                        instance.mount(group.node());
                    }
                });
            });
    }
};
