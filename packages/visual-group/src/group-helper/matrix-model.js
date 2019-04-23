import { DataModel } from 'muze-utils';

/**
* Gets name of fields form the variables
*
* @param {*} fields1
* @param {*} [fields2=[]]
*
*/
const getFieldNames = fieldVar => fieldVar.reduce((acc, d) => {
    acc = [...acc, ...d.getMembers()];
    return acc;
}, []);

/**
*
*
* @param {*} fieldInfo
* @returns
*/
const prepareProjectionInfo = (fieldInfo) => {
    const {
colProjections,
rowProjections
} = fieldInfo;
    const uniqueFields = [];
    const indices = [];
    const projections = [];

    rowProjections.forEach((rowProj, rIndex) => {
        const newRIndex = rIndex;
        colProjections.forEach((colProj, cIndex) => {
            const newCIndex = cIndex;
            const newRowProj = getFieldNames(rowProj);
            const newColProj = getFieldNames(colProj);

            uniqueFields.push([...newRowProj, ...newColProj]);
            indices.push({ rowIndex: newRIndex, colIndex: newCIndex });
            projections.push({ rowFields: rowProj, columnFields: colProj });
        });
    });
    return { uniqueFields, indices, projections };
};

/**
*
*
* @param {*} fieldInfo
* @returns
*/
const prepareFacetInfo = (fieldInfo) => {
    const {
rowFacets,
colFacets
} = fieldInfo;

    const rowFacetNames = getFieldNames(rowFacets);
    const colFacetNames = getFieldNames(colFacets);
    const allFacets = [...rowFacetNames, ...colFacetNames];

    return { rowFacetNames, colFacetNames, allFacets };
};

/**
*
*
* @param {*} context
* @param {*} facetNames
* @param {*} hashMap
* @param {*} keys
* @param {*} index
* @returns
*/
const prepareHashMaps = (context, facetNames, hashMap, keys, index) => {
    const rowKey = [];

    facetNames.forEach((name) => {
        const key = context._derivation[context._derivation.length - 1].meta.keys[name];

        rowKey.push(key);
    });

    const joinedRowKey = rowKey.join(',');

    if (hashMap[joinedRowKey] === undefined) {
        hashMap[joinedRowKey] = index++;
        keys.push({ keyArr: rowKey, joinedKey: joinedRowKey });
    }
    return rowKey;
};

/**
*
*
* @param {*} splitModels
* @param {*} facetInfo
* @returns
*/
const getSplitModelHashMap = (splitModels, facetInfo) => {
    const {
        rowFacetNames,
        colFacetNames
    } = facetInfo;

    const rowKeyHashMap = {};
    const colKeyHashMap = {};

    const rowKeys = [];
    const colKeys = [];
    const rowIndex = 0;

    const splitModelsHashMap = {};

    splitModels.forEach((splitContext) => {
        const rowKey = prepareHashMaps(splitContext, rowFacetNames, rowKeyHashMap, rowKeys, rowIndex);
        const colKey = prepareHashMaps(splitContext, colFacetNames, colKeyHashMap, colKeys, 1);

        splitModelsHashMap[`${rowKey}-${colKey}`] = splitContext;
    });

    return { splitModelsHashMap, rowKeys, colKeys };
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
*
*
* @param {Object} context
* @param {Object} fieldInfo
* @returns
*/
const splitByColumn = (context, optionalProjections) => {
    const {
matrix,
dataModel,
rowIndex,
colIndex,
facetInfo,
projectionInfo,
geomCellCreator
} = context;
    const {
indices,
uniqueFields,
projections
} = projectionInfo;

    const commonFields = optionalProjections;

    dataModel.splitByColumn(commonFields, uniqueFields).forEach((model, i) => {
        let { rowIndex: row, colIndex: col } = indices[i];
        row += rowIndex;
        col += colIndex;

        matrix[row] = matrix[row] || [];
        // sortFacetFields(rowFacets, rowKeys, globalConfig);

        const projectionIndexObject = {
            indices: {
                rowIndex: row,
                columnIndex: col
            },
            projections: projections[i]
        };

        matrix[row][col] = geomCellCreator(model, projectionIndexObject, facetInfo);
    });
    const lastIndex = indices[indices.length - 1];

    return {
        rowIndex: lastIndex.rowIndex + rowIndex,
        colIndex: lastIndex.colIndex + colIndex
    };
};

/**
* Gets Matrixes for corresponding datamodel, facets and projections
*
* @param {Object} dataModel input datamodel
* @param {Object} fieldInfo Information about the fields
* @param {Function} geomCellCreator Callback executed after datamodels are prepared after sel/proj
* @return {Object} set of matrices with the corresponding row and column keys
*/
export const getMatrixModel = (dataModel, fieldInfo, geomCellCreator) => {
    let currentRowIndex = 0;
    const matrix = [];
    const {
        rowFacets,
        colFacets
    } = fieldInfo;

    const projectionInfo = prepareProjectionInfo(fieldInfo);
    const facetInfo = prepareFacetInfo(fieldInfo);
    const allSplitModels = dataModel.splitByRow(facetInfo.allFacets);

    const {
        splitModelsHashMap,
        rowKeys,
        colKeys
    } = getSplitModelHashMap(allSplitModels, facetInfo);

    rowKeys.forEach((rowKeyObj) => {
        let currentColumnIndex = 0;
        const { keyArr: rowKeyArr, joinedKey: rowKey } = rowKeyObj;
        const newRowIndex = currentRowIndex;
        // sortFacetFields(colFacets, columnKeys, globalConfig);

        colKeys.forEach((colKeyObj) => {
            let context = {};
            const { keyArr: colKeyArr, joinedKey: colKey } = colKeyObj;
            const hashMapKey = splitModelsHashMap[`${rowKey}-${colKey}`];

            if (hashMapKey) {
                context = { dataModel: hashMapKey };
            } else {
                const emptyDm = new DataModel([], dataModel.getData().schema);
                emptyDm.addParent(dataModel);
                context = { dataModel: emptyDm };
            }

            context = {
                ...context,
                matrix,
                facetInfo: {
                    rowFacets: [rowFacets, rowKeyArr],
                    colFacets: [colFacets, colKeyArr]
                },
                projectionInfo,
                rowIndex: newRowIndex,
                colIndex: currentColumnIndex,
                geomCellCreator
            };
            const dataModels = splitByColumn(context, fieldInfo.optionalProjections);
            currentColumnIndex = dataModels.colIndex + 1;
            currentRowIndex = dataModels.rowIndex;
        });
        currentRowIndex++;
    });

    const formattedColKeys = formatKeys(colKeys.map(e => e.keyArr),
        colFacets.map(facetField => facetField.rawFormat()));
    const formattedRowKeys = formatKeys(rowKeys.map(e => e.keyArr),
        rowFacets.map(facetField => facetField.rawFormat()));

     // Getting column keys
    const transposedColKeys = formattedColKeys.length > 0 ? formattedColKeys[0].map((col, i) =>
     formattedColKeys.map(row => row[i])) : formattedColKeys;

    return { matrix, rowKeys: formattedRowKeys, columnKeys: transposedColKeys };
};
