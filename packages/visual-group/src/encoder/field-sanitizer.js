import { ComposedVars, SimpleVariable } from '../variable';
import { DIMENSION, COLUMNS, ROWS, TEMPORAL } from '../enums/constants';

/**
 * Gets the list of fields in a sorted order by measurement and dimension
 *
 * @param {Array} fieldList List of fields in the view
 * @param {Object} fieldMap Mapping of fields in the datamodel
 * @return {Array} fields sorted by measurement and dimensions
 */
const orderFields = (fieldArray, type) => {
    const dimensionArr = [[], []];
    const measureArr = [[], []];
    const temporalArr = [[], []];
    const categoricalArr = [[], []];

    fieldArray.forEach((fieldList, index) => {
        fieldList.forEach((field) => {
            if (field.type() === DIMENSION) {
                dimensionArr[index].push(field);
                field.subtype() === TEMPORAL ? temporalArr[index].push(field) : categoricalArr[index].push(field);
            } else {
                measureArr[index].push(field);
            }
        });
    });

    const numOfMeasures = measureArr[0].length + (measureArr[1] ? measureArr[1].length : 0);

    // Single array of fields
    if (!fieldArray[1]) {
        // Push measures to bottom
        measureArr[1] = type === COLUMNS ? measureArr[0] : [];
        // Push measures to left
        measureArr[0] = type !== COLUMNS ? measureArr[0] : [];
        // Bottom and right dimensions empty
        dimensionArr[1] = [];
        // Left and top filled with dimensions
        dimensionArr[0] = dimensionArr[0];
        if (numOfMeasures === 0) {
            const allDimensions = [...dimensionArr[0], ...dimensionArr[1]];
            if (type === COLUMNS) {
                dimensionArr[1] = allDimensions[allDimensions.length - 1] ? [allDimensions[allDimensions.length - 1]]
                        : [];
                allDimensions.splice(-1, 1);
            } else {
                dimensionArr[1] = [];
            }
            dimensionArr[0] = [...allDimensions];
        }
    }

    if (dimensionArr[0].length && dimensionArr[1].length && numOfMeasures > 0) {
        dimensionArr[0] = [...dimensionArr[0], ...dimensionArr[1]];
        dimensionArr[1] = [];
    }
    return {
        fields: dimensionArr.map((list, i) => (i === 1 ?
            measureArr[i].concat(dimensionArr[i]) : dimensionArr[i].concat(measureArr[i]))),
        dimensions: [...dimensionArr[0], ...dimensionArr[1]],
        measures: [...measureArr[0], ...measureArr[1]],
        temporal: [...temporalArr[0], ...temporalArr[1]],
        categorical: [...categoricalArr[0], ...categoricalArr[1]]
    };
};

/**
 * Gets the list of normalized fields
 *
 * @param {Array} fields List of fields in the view
 * @param {Object} fieldMap Mapping of fields in the datamodel
 * @return {Array} fields normalized by measurement and dimensions
 */
const normalizeFields = (config, type) => {
    const fieldsArr = [];
    const fields = config[type];

    if (!(fields[0] instanceof Array)) {
        fieldsArr[0] = fields;
    } else {
        fieldsArr[0] = fields[0] || [];
        fieldsArr[1] = fields[1] || [];
    }
    return fieldsArr;
};

/**
 *
 *
 * @param {*} fields
 * @param {*} datamodel
 *
 */
const convertToVar = (datamodel, fields) => {
    const vars = [];

    fields && fields.forEach((field) => {
        if (field instanceof ComposedVars) {
            vars.push(field);
            field.data(datamodel);
        } else {
            vars.push(new SimpleVariable(field).data(datamodel));
        }
    });
    return vars;
};

/**
 *
 *
 * @param {*} rows
 * @param {*} columns
 * @param {*} datamodel
 *
 */
export const transformFields = (datamodel, config) => {
    const [rowsInfo, columnsInfo] = [ROWS, COLUMNS].map((fields) => {
        const normalizedFields = normalizeFields(config, fields);
        const norFields = [convertToVar(datamodel, normalizedFields[0])];

        if (normalizedFields[1]) {
            norFields[1] = convertToVar(datamodel, normalizedFields[1]);
        }
        return orderFields(norFields, fields);
    });
    const {
        fields: rows,
        dimensions: rowDimensions,
        measures: rowMeasures,
        temporal: rowTemporalFields,
        categorical: rowCategoricalFields
    } = rowsInfo;
    const {
        fields: columns,
        dimensions: columnDimensions,
        measures: columnMeasures,
        temporal: columnTemporalFields,
        categorical: columnCategoricalFields
    } = columnsInfo;
    return {
        rows,
        rowDimensions,
        rowMeasures,
        rowTemporalFields,
        rowCategoricalFields,
        columns,
        columnTemporalFields,
        columnCategoricalFields,
        columnDimensions,
        columnMeasures
    };
};
