import { DataModel } from 'muze-utils';
import { retriveDomainFromData, sortFacetFields } from './group-utils';

/**
 * Gets name of fields form the variables
 *
 * @param {*} fields1
 * @param {*} [fields2=[]]
 *
 */
const getFieldNames = (fields1, fields2 = []) => [fields1, fields2].map(fields => fields.reduce((acc, d) => {
    acc = [...acc, ...d.getMembers()];
    return acc;
}, []));

/**
 * Creates a selected datamodel from a parent datamodel and a set of field names
 *
 * @param {Object} datamodel provided as input
 * @param {Array} fieldNames schema  names
 * @param {Array} fieldValues values of those schema names to be selected
 * @return {Object} creates a new selected datamodel
 */
const createSelectedDataModel = (datamodel, fieldNames, fieldValues) =>
    datamodel.select(fields => fieldNames.every((field, k) => fields[field].value === fieldValues[k]));

/**
 *
 *
 * @param {*} facets
 * @param {*} keyArray
 *
 */
const uniqueKeyGenerator = (keyArray, context, depth = 0, val = []) => {
    const {
        facets,
        dataModel,
        uniqueValues
    } = context;

    // Get unique keys for the next depth recursively if required
    if (facets[depth + 1]) {
        const field = facets[depth];
        uniqueValues.forEach((value) => {
            const newDm = dataModel.select(fields => fields[field].value === value);
            const nextDepthUniqueValues = retriveDomainFromData(newDm, facets[depth + 1]);
            const newContext = {
                facets,
                dataModel: newDm,
                uniqueValues: nextDepthUniqueValues
            };

            uniqueKeyGenerator(keyArray, newContext, depth + 1, [...val, value]);
        });
    } else {
        uniqueValues.forEach((value) => {
            keyArray.push([...val, value]);
        });
    }
};

/**
 * projects row model based on the set of row and/or column and other projection fields
 *
 * @param {Object} datamodel provided as input
 * @return {Object} Projected datamodel
 */
const projectRows = (datamodel, projections) => {
    const {
        allColumnProjections,
        rowProjections,
        optionalProjections
    } = projections;

    if (rowProjections.length > 0) {
        return rowProjections.map((projectFields) => {
            const [projFieldNames, colProjFieldNames] = getFieldNames(projectFields, allColumnProjections);
            return datamodel.project([...projFieldNames, ...colProjFieldNames, ...optionalProjections]);
        });
    }
    return [datamodel];
};

/**
 * Adds the datamodels to current row index based on column fields
 *
 * @param {Array} context current context
 * @param {Array} valueCellCreator List of facets applied to the current datamodel
 */
const pushToMatrix = (context, valueCellCreator) => {
    let cells = [];
    const {
        matrix,
        datamodel,
        facetInfo,
        fieldInfo
    } = context;
    // Get projected fields for current row
    const {
        rowProjections,
        colProjections,
        optionalProjections
    } = fieldInfo;
    const {
        rowIndex,
        columnIndex
    } = facetInfo;
    const rowProj = rowProjections[(rowIndex) % rowProjections.length] || [];

    // Get the cells for the matrix from the return function of the callback on the datamodel.
    // callback function -> (datamodel, {projections, indices}, facets)
    if (colProjections.length > 0) {
        cells = colProjections.map((projectFields, projIdx) => {
            const [colProjFieldNames, rowProjFieldNames] = getFieldNames(projectFields, rowProj);
            const projectedDm = datamodel.project([...colProjFieldNames, ...rowProjFieldNames, ...optionalProjections]);
            const projections = { rowFields: rowProj, columnFields: projectFields };
            const indices = { rowIndex, columnIndex: columnIndex * colProjections.length + projIdx };

            return valueCellCreator(projectedDm, { projections, indices }, facetInfo);
        });
    } else {
        const projections = { rowFields: rowProj, columnFields: [] };
        const indices = { rowIndex, columnIndex };

        cells = [valueCellCreator(datamodel, { projections, indices }, facetInfo)];
    }

    matrix[rowIndex] = matrix[rowIndex] || [];
    matrix[rowIndex].push(...cells);
};

/**
 * Formats row or columns keys with the provided formatter.
 *
 * @param {Array} keys - The collection of row or column keys.
 * @param {Array} formatterList - The list of corresponding formatter.
 */
const formatKeys = (keys, formatterList) => {
    const formattedKeys = [];
    keys.forEach((rKeys, rIdx) => {
        formattedKeys[rIdx] = [];
        rKeys.forEach((key, idx) => {
            formattedKeys[rIdx][idx] = formatterList[idx](key);
        });
    });
    return formattedKeys;
};

/**
 * Gets Matrixes for corresponding datamodel, facets and projections
 *
 * @param {Object} dataModel input datamodel
 * @param {Array} facetsAndProjections contains the set of facets and projections for the matrices
 * @param {Function} valueCellCreator Callback executed after datamodels are prepared after sel/proj
 * @param {Object} globalConfig global config
 *
 * @return {Object} set of matrices with the corresponding row and column keys
 */
export const getMatrixModel = (dataModel, facetsAndProjections, valueCellCreator, globalConfig) => {
    let rowDataModels = [];
    let rowKeys = [];
    let columnKeys = [];
    const allColumnProjections = [];
    const matrix = [];
    const facetInfo = [];

    const fieldInfo = Object.assign({}, facetsAndProjections);
    const {
        rowFacets,
        colFacets,
        colProjections
    } = fieldInfo;

    colProjections.forEach((colProj) => {
        allColumnProjections.push(...colProj);
    });
    fieldInfo.allColumnProjections = allColumnProjections;

    // Performing row selection and projection
    if (rowFacets.length > 0) {
        // Get unique values for the root level of facet
        const field = rowFacets[0].toString();
        const firstLevelRowKeys = retriveDomainFromData(dataModel, field);

        // Get unique keys in the form of an array of arrays for each row
        uniqueKeyGenerator(rowKeys, { facets: rowFacets, dataModel, uniqueValues: firstLevelRowKeys });

        rowKeys = sortFacetFields(rowFacets, rowKeys, globalConfig);

        // Apply selection -> projection -> row datamodels
        rowKeys.forEach((val) => {
            // Create faceted datamodel
            const [rowFacetFieldNames] = getFieldNames(rowFacets);
            const selectedDataModel = createSelectedDataModel(dataModel, rowFacetFieldNames, val);

            // Project the datamodel based on the number of projections (based on last levels)
            const newProjectedDataModels = projectRows(selectedDataModel, fieldInfo);
            rowDataModels.push(...newProjectedDataModels);

            newProjectedDataModels.forEach(() => {
                facetInfo.push([rowFacets, val]);
            });
        });
    } else {
        // No row facets, hence only row projection
        rowDataModels.push(...projectRows(dataModel, fieldInfo));
    }

    // Maintaining set of row datamodels for column resolution
    rowDataModels = rowDataModels.length > 0 ? rowDataModels : [[]];

    // Performing column selection and projection
    if (colFacets.length > 0) {
        const colFacetNames = colFacets.map(d => `${d}`);
        // Get unique values for the root level of facet
        const field = colFacetNames[0];
        const firstLevelColumnKeys = retriveDomainFromData(dataModel, field);

        // Get unique keys to create faceted datamodels: this time for columns
        uniqueKeyGenerator(columnKeys, {
            facets: colFacetNames,
            dataModel,
            uniqueValues: firstLevelColumnKeys
        });

        columnKeys = sortFacetFields(colFacets, columnKeys, globalConfig);

        // For each row in the datamodel, apply selection -> projection -> push the projection to matri
        rowDataModels.forEach((dme, rIndex) => {
            facetInfo[rIndex] = facetInfo[rIndex] || [[], []];
            columnKeys.forEach((val, cIndex) => {
                matrix[rIndex] = matrix[rIndex] || [];

                // If datamodel is not present in current row, choose parent datamodel
                const datamodel = dme instanceof DataModel ? dme : dataModel;

                // Selection is made on the datamodel for the current row
                const selectedDataModel = createSelectedDataModel(datamodel, colFacetNames, val);
                const context = {
                    matrix,
                    datamodel: selectedDataModel,
                    facetInfo: {
                        rowFacets: facetInfo[rIndex],
                        colFacets: [colFacets, val],
                        rowIndex: rIndex,
                        columnIndex: cIndex
                    },
                    fieldInfo
                };
                pushToMatrix(context, valueCellCreator);
            });
        });
    } else {
        // No column facets, hence only row projection
        rowDataModels.forEach((dme, rIndex) => {
            facetInfo[rIndex] = facetInfo[rIndex] || [[], []];
            const context = {
                matrix,
                datamodel: dme || dataModel,
                facetInfo: {
                    rowFacets: facetInfo[rIndex],
                    colFacets: [[], []],
                    rowIndex: rIndex,
                    columnIndex: 0
                },
                fieldInfo
            };

            pushToMatrix(context, valueCellCreator);
        });
    }

    const formattedColKeys = formatKeys(columnKeys, colFacets.map(facetField => facetField.rawFormat()));
    const formattedRowKeys = formatKeys(rowKeys, rowFacets.map(facetField => facetField.rawFormat()));

    // Getting column keys
    const transposedColKeys = formattedColKeys.length > 0 ? formattedColKeys[0].map((col, i) =>
                    formattedColKeys.map(row => row[i])) : formattedColKeys;

    return { matrix, rowKeys: formattedRowKeys, columnKeys: transposedColKeys };
};
