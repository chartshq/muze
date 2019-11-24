import { mergeRecursive, getObjProp } from 'muze-utils';
import { AxisOrientation } from '@chartshq/muze-axis';
import { ENCODING } from '@chartshq/visual-layer';
import { scaleMaps } from '../enums/scale-maps';
import { getAxisType, getAxisKey } from '../group-helper';
import { dataTypeScaleMap } from '../data-type-scale-map';
import { CATEGORICAL, TEMPORAL, BAR, LINE, POINT, BOTH, Y, COLOR, SHAPE, SIZE, ANGLE0 } from '../enums/constants';

/**
 *
 *
 * @param {*} axisInfo
 * @param {*} field
 * @param {*} axesCreators
 *
 */
const getAxisConfig = (axisInfo, field, axesCreators, indices, facetFields) => {
    let axisOrientation;
    const { index, axisIndex, axisType } = axisInfo;
    const { config, position } = axesCreators;
    const { rowIndex, columnIndex } = indices;
    const rawUserAxisConfig = config.axes ? (config.axes[axisType] || {}) : {};

    // Change config object to a function if not already one
    const userAxisConfigFn = typeof rawUserAxisConfig !== 'function' ?
    () => rawUserAxisConfig : rawUserAxisConfig;
    const userAxisConfig = userAxisConfigFn(rowIndex, columnIndex, {
        axisFields: field.getMembers(),
        facetFields
    });

    // If current config does not specifes config for an axis, retain old config
    if (!userAxisConfig) {
        return {};
    }

    const {
        LEFT,
        RIGHT,
        TOP,
        BOTTOM
    } = AxisOrientation;
    const allOrientations = axisType === Y ? [LEFT, RIGHT] : [TOP, BOTTOM];

    if (position === BOTH) {
        axisOrientation = allOrientations[axisIndex];
    } else {
        axisOrientation = position;
    }
    const axisConfig = {
        id: `${axisType}-${index}-${axisIndex}`,
        name: field.displayName(),
        field: field.toString(),
        numberFormat: field.numberFormat(),
        orientation: axisOrientation,
        showAxisName: true,
        show: true,
        type: dataTypeScaleMap[field.subtype()]
    };
    userAxisConfig.tickValues = field.format(userAxisConfig.tickValues);
    userAxisConfig.domain = field.format(userAxisConfig.domain);

    return mergeRecursive(axisConfig, userAxisConfig);
};

/**
 *
 *
 * @param {*} axisInfo
 * @param {*} field
 * @param {*} axesCreators
 *
 */
const createSimpleAxis = (axisConfig, field, axesCreators) => {
    const { labelManager } = axesCreators;
    const Cls = scaleMaps[dataTypeScaleMap[field.subtype()]];
    const simpleAxis = new Cls(axisConfig, { labelManager });
    return simpleAxis;
};

export const getAdjustedDomain = (max, min) => {
    const y1ratio = max[0] / (max[0] - min[0]);
    const y2ratio = max[1] / (max[1] - min[1]);

    // adjust min/max values for positive negative values zero line etc
    let allSameSign = false;

    // if all numbers are positive set floor to zero
    if (min[0] > 0 && min[1] > 0 && min[1] > 0 && max[1] > 0) {
        allSameSign = true;
        min[0] = 0;
        min[1] = 0;
    }

    // if all numbers are negative set ceiling to zero
    if (min[0] < 0 && min[1] < 0 && min[1] < 0 && max[1] < 0) {
        allSameSign = true;
        max[0] = 0;
        max[1] = 0;
    }

    // align zero line if necessary
    if (!allSameSign && y1ratio !== y2ratio) {
        if (y1ratio < y2ratio) {
                    // adjust min[1]
            min[1] = min[0] / max[0] * max[1];
        } else {
                    // adjust min[0]
            min[0] = min[1] / max[1] * max[0];
        }
    }
    return [
        [min[0], max[0]],
        [min[1], max[1]]
    ];
};

/**
 *
 *
 * @param {*} axisType
 * @param {*} fieldInfo
 * @param {*} axesCreators
 * @param {*} groupAxes
 *
 */
export const generateAxisFromMap = (axisType, fieldInfo, axesCreators, axesInfo, indices, facetFields) => {
    let axisKey;
    const { groupAxes, valueParser } = axesInfo;
    const currentAxes = [];
    const { fields, index } = fieldInfo;
    const { cacheMaps } = axesCreators;
    const map = cacheMaps[`${axisType}AxesMap`];

    const commonAxisKey = getAxisKey(axisType, index);
    fields.forEach((field, axisIndex) => {
        axisKey = getAxisKey(axisType, index, axisIndex, dataTypeScaleMap[field.subtype()]);
        const axisConfig = getAxisConfig({ index, axisIndex, axisType }, field, axesCreators, indices, facetFields);

        let axis;
        if (!map.has(axisKey)) {
            axis = createSimpleAxis(axisConfig, field, axesCreators);
        } else {
            axis = map.get(axisKey);
            axis._rotationLock = false;
            axis.config(axisConfig);
        }
        axis.valueParser(valueParser);
        currentAxes.push(axis);
        map.set(axisKey, axis);
    });

    if (currentAxes.length) {
        map.set(commonAxisKey, currentAxes);
        groupAxes.add(commonAxisKey);
    }

    return currentAxes;
};

export const sanitizeIndividualLayerConfig = (encodingConfigs, def) => {
    [COLOR, SHAPE, SIZE].forEach((axis) => {
        if (encodingConfigs[axis] && encodingConfigs[axis].field) {
            def.forEach((conf) => {
                conf.encoding = conf.encoding || {};
                !conf.encoding[axis] && (conf.encoding[axis] = {});
                conf.encoding[axis].field = encodingConfigs[axis].field;
            });
        }
    });
};

/**
 *
 *
 * @memberof MatrixResolver
 */
export const mutateAxesFromMap = (cacheMaps, axes) => {
    const {
        xAxesMap,
        yAxesMap
    } = cacheMaps;
    const {
        x: xAxisSet,
        y: yAxisSet
    } = axes;
    const xAxes = [];
    const yAxes = [];

    xAxisSet.forEach((axisId) => {
        const xAxis = xAxesMap.get(axisId);
        xAxes.push(xAxis);
    });
    yAxisSet.forEach((axisId) => {
        const yAxis = yAxesMap.get(axisId);
        yAxes.push(yAxis);
    });
    return {
        xAxes, yAxes
    };
};

/**
 * return a default mark based on predefined set of rules of type and subtype of the fields
 *
 * @param {string} colFieldType dimension/measure - temporal/ordinal/nominal
 * @param {string} rowFieldType dimension/measure - temporal/ordinal/nominal
 * @return {Object} return mark type
 */
export const getDefaultMark = (colFieldType, rowFieldType) => {
    let mark;

    if (colFieldType === CATEGORICAL || rowFieldType === CATEGORICAL) {
        mark = BAR;
    } else if (colFieldType === TEMPORAL || rowFieldType === TEMPORAL) {
        mark = LINE;
    } else {
        mark = POINT;
    }

    return mark;
};

/**
 *
 *
 * @param {*} axesCreators
 * @param {*} [fieldInfo=[]]
 *
 */
export const createRetinalAxis = (axesCreators, fieldProps = {}) => {
    const { axisType, fieldsConfig } = axesCreators;
    const field = fieldProps.field;
    const axis = [];
    const Cls = scaleMaps[axisType];

    fieldProps.type = fieldProps.type ? fieldProps.type : getAxisType(fieldsConfig, field || null);
    axis.push(new Cls(fieldProps));
    return axis;
};

/**
 *
 *
 * @param {*} arr
 * @param {*} val
 *
 */
export const getIndex = (arr, val) => {
    let i = 0;
    let arrIndex = -1;

    while (arrIndex === -1 && i < arr.length) {
        if (arr[i].toString() === val.toString()) {
            arrIndex = i;
        }
        i++;
    }
    return arrIndex;
};

/**
 *
 *
 * @param {*} colFields
 * @param {*} rowFields
 * @param {*} userLayerConfig
 *
 * @memberof CartesianEncoder
 */
export const getLayerConfFromFields = (colFields, rowFields, userLayerConfig) => userLayerConfig.filter((conf) => {
    const userConf = conf instanceof Array ? conf : [conf];
    const encodingArr = [].concat(...userConf.map(d => d.encoding).filter(d => d !== undefined));

    if (!encodingArr.length) {
        return true;
    }

    const xFields = [].concat(...encodingArr.map(d => [d.x && d.x.field, d.x0 && d.x0.field]))
                .filter(d => d !== undefined && d !== null);
    const yFields = [].concat(...encodingArr.map(d => [d.y && d.y.field, d.y0 && d.y0.field]))
                .filter(d => d !== undefined && d !== null);

    if (!xFields.length && !yFields.length) {
        return true;
    }

    const colFieldExist = xFields.length ? xFields.every(d => colFields.indexOf(d) !== -1) : false;
    const rowFieldExist = yFields.length ? yFields.every(d => rowFields.indexOf(d) !== -1) : false;
    if (xFields.length && yFields.length) {
        return colFieldExist && rowFieldExist;
    }
    return colFieldExist || rowFieldExist;
});

export const resolveAxisConfig = (context, fieldInf, axisInfo) => {
    const { rowIndex, columnIndex, axesObj } = axisInfo;
    const { config, facetFields, resolver } = context;
    const resolverAxes = resolver.axes();
    const { RADIUS, ANGLE } = ENCODING;
    [RADIUS, ANGLE, ANGLE0].forEach((enc) => {
        const axesArr = resolverAxes[enc];
        if (!axesArr[rowIndex]) {
            axesArr[rowIndex] = [];
        }
        axesArr[rowIndex][columnIndex] = axesObj[enc];
        const axisConfig = getObjProp(config.axes, enc) || {};

        axesObj[enc].forEach((axis, i) => {
            let userConfig = axisConfig;
            if (axisConfig instanceof Function) {
                userConfig = axisConfig(rowIndex, columnIndex, {
                    axisFields: [fieldInf[enc][i]],
                    facetFields
                });
            }
            axis.config(userConfig);
        });
    });
};

export const getSortingConfig = (context, currentFieldName, axesConfig) => {
    const config = context.config();
    const dataModel = context.data();

    let lastSortConfig = null;
    if (Object.keys(config.sort).length !== 0) {
        return config.sort[currentFieldName];
    }

    const operations = [...dataModel.getAncestorDerivations(), ...dataModel.getDerivations()];

    while (lastSortConfig = operations.pop()) {
        if (lastSortConfig.op === 'sort') break;
    }
    if (lastSortConfig &&
        lastSortConfig.criteria.length &&
        lastSortConfig.criteria[0][0] === currentFieldName) {
        return lastSortConfig.criteria[0][1];
    }
    return axesConfig().defaultSort;
};
