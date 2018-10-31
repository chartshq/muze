import { mergeRecursive } from 'muze-utils';
import { AxisOrientation } from '@chartshq/muze-axis';
import { scaleMaps } from '../enums/scale-maps';
import { getAxisType, getAxisKey } from '../group-helper';
import { dataTypeScaleMap } from '../data-type-scale-map';
import { CATEGORICAL, TEMPORAL, BAR, LINE, POINT, BOTH, Y } from '../enums/constants';

/**
 *
 *
 * @param {*} axisInfo
 * @param {*} field
 * @param {*} axesCreators
 *
 */
const getAxisConfig = (axisInfo, field, axesCreators) => {
    let axisOrientation;
    const { index, axisIndex, axisType } = axisInfo;
    const { config, position } = axesCreators;
    const userAxisConfig = config.axes ? (config.axes[axisType] || {}) : {};
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
        name: field.toString(),
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

/**
 *
 *
 * @param {*} axisType
 * @param {*} fieldInfo
 * @param {*} axesCreators
 * @param {*} groupAxes
 *
 */
export const generateAxisFromMap = (axisType, fieldInfo, axesCreators, groupAxes) => {
    let axisKey;
    const currentAxes = [];
    const { fields, index } = fieldInfo;
    const { cacheMaps } = axesCreators;
    const map = cacheMaps[`${axisType}AxesMap`];

    fields.forEach((field, axisIndex) => {
        axisKey = getAxisKey(axisType, index, dataTypeScaleMap[field.subtype()]);
        const axisConfig = getAxisConfig({ index, axisIndex, axisType }, field, axesCreators);

        if (!map.has(axisKey)) {
            const xAxis = createSimpleAxis(axisConfig, field, axesCreators);
            currentAxes.push(xAxis);
        } else {
            const axes = map.get(axisKey);
            axes[axisIndex] = axes[axisIndex] ? axes[axisIndex] : createSimpleAxis(axisConfig, field, axesCreators);
            axes[axisIndex]._rotationLock = false;
            axes[axisIndex] && axes[axisIndex].config(axisConfig).domain(axisConfig.domain || []);
        }
    });

    if (currentAxes.length) {
        map.set(axisKey, currentAxes);
    }

    for (const [key] of map.entries()) {
        if (key === axisKey) {
            groupAxes.add(axisKey);
        }
    }
    return map.get(axisKey);
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
