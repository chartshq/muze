import { DataModel, mergeRecursive } from 'muze-utils';
import { sortFacetFields } from './group-utils';
import { BORDER_WIDTH } from '../enums/defaults';
import { FACET } from '../enums/constants';

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
    let indices = [];
    let projections = [];

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
    indices = indices.length ? indices : [{ rowIndex: 0, colIndex: 0 }];
    projections = projections.length ? projections : [{ rowFields: [], columnFields: [] }];
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

    return { rowFacetNames, colFacetNames, allFacets, rowFacets, colFacets };
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
        keys.push(rowKey);
    }
    return rowKey;
};

const createJoinedKeys = keys => keys.map(e => ({
    keyArr: e,
    joinedKey: e.join(',')
}));

const setDefaultConfigForFacet = (facetInfo, projectionInfo, config) => {
    let conf = {};

    if (config && (facetInfo.allFacets.length || projectionInfo.indices.length > 1)) {
        const { facetsUserConfig = {}, border } = config;
        const { isBorderPresent = {}, isGridLinePresent = {} } = facetsUserConfig;
        const gridLinesShowLength = Object.keys(isGridLinePresent).length;
        const {
            width: borderWidth,
            color: borderColor,
            style: borderStyle,
            showValueBorders,
            showRowBorders,
            showColBorders
        } = border;
        let gridLines = {};
        let borderConf = {};

        if (Object.keys(isBorderPresent).length === 0 || !(isBorderPresent.width)) {
            borderConf = {
                width: BORDER_WIDTH[FACET]
            };
        } else {
            Object.assign(borderConf,
                borderWidth ? { width: borderWidth } : null,
                borderColor ? { color: borderColor } : null,
                showValueBorders ? { showValueBorders } : null,
                showRowBorders ? { showRowBorders } : null,
                showColBorders ? { showColBorders } : null,
                borderStyle ? { style: borderStyle } : null);
        }
        if (gridLinesShowLength <= 0) {
            gridLines = {
                x: {
                    show: false
                }
            };
        }
        conf = {
            border: borderConf,
            gridLines
        };
    }
    return conf;
};

/**
*
*
* @param {*} splitModels
* @param {*} facetInfo
* @returns
*/
const getSplitModelHashMap = (splitModels, facetInfo, config) => {
    const {
        rowFacetNames,
        colFacetNames,
        rowFacets,
        colFacets
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

    return {
        splitModelsHashMap,
        rowKeys: createJoinedKeys(sortFacetFields(rowFacets, rowKeys, config)),
        colKeys: createJoinedKeys(sortFacetFields(colFacets, colKeys, config))
    };
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

    dataModel.splitByColumn(uniqueFields, commonFields).forEach((model, i) => {
        let { rowIndex: row, colIndex: col } = indices[i];
        row += rowIndex;
        col += colIndex;

        matrix[row] = matrix[row] || [];

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

const createColumnDataModels = (colContext, fieldInfo, sourceDM) => {
    let context = {};
    const {
        rowFacets,
        colFacets
    } = fieldInfo;
    const {
        rowKeyArr,
        rowKey,
        colKeyObj,
        newRowIndex,
        splitModelsHashMap,
        currentColumnIndex
    } = colContext;

    const { keyArr: colKeyArr, joinedKey: colKey } = colKeyObj;
    const hashMapKey = splitModelsHashMap[`${rowKey}-${colKey}`];

    if (hashMapKey) {
        context = { dataModel: hashMapKey };
    } else {
        const emptyDm = new DataModel([], sourceDM.getData().schema);
        context = { dataModel: emptyDm };
    }

    context = {
        ...context,
        ...colContext,
        facetInfo: {
            rowFacets: [rowFacets, rowKeyArr],
            colFacets: [colFacets, colKeyArr]
        },
        rowIndex: newRowIndex,
        colIndex: currentColumnIndex
    };
    const dataModels = splitByColumn(context, fieldInfo.optionalProjections);

    return {
        columnIndex: dataModels.colIndex + 1,
        rowIndex: dataModels.rowIndex
    };
};

const createRowDataModels = (rowContext, fieldInfo, sourceDM) => {
    let currentColumnIndex = 0;
    let rowIndexForCurrentKey = 0;
    const {
        colKeys,
        rowKeyObj,
        currentRowIndex
    } = rowContext;
    const newRowIndex = currentRowIndex;
    const { keyArr: rowKeyArr, joinedKey: rowKey } = rowKeyObj;
    const colContext = {
        ...rowContext,
        rowKeyArr,
        rowKey,
        newRowIndex
    };
    rowIndexForCurrentKey = currentRowIndex;
    if (colKeys.length) {
        colKeys.forEach((colKeyObj) => {
            colContext.colKeyObj = colKeyObj;
            colContext.currentColumnIndex = currentColumnIndex;
            const { columnIndex, rowIndex } = createColumnDataModels(colContext, fieldInfo, sourceDM);

            currentColumnIndex = columnIndex;
            rowIndexForCurrentKey = rowIndex;
        });
    } else {
        colContext.colKeyObj = { keyArr: [], joinedKey: '' };
        colContext.currentColumnIndex = currentColumnIndex;

        const { columnIndex, rowIndex } = createColumnDataModels(colContext, fieldInfo, sourceDM);

        currentColumnIndex = columnIndex;
        rowIndexForCurrentKey = rowIndex;
    }
    return {
        rowIndex: ++rowIndexForCurrentKey
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
export const getMatrixModel = (dataModel, fieldInfo, geomCellCreator, globalConfig) => {
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
    } = getSplitModelHashMap(allSplitModels, facetInfo, globalConfig);

    const defaultConfig = setDefaultConfigForFacet(facetInfo, projectionInfo, globalConfig);
    globalConfig = mergeRecursive(globalConfig, defaultConfig);

    const generalContext = {
        matrix,
        geomCellCreator,
        projectionInfo,
        splitModelsHashMap,
        colKeys
    };
    if (rowKeys.length) {
        rowKeys.forEach((rowKeyObj) => {
            const rowContext = {
                ...generalContext,
                rowKeyObj,
                currentRowIndex
            };
            const { rowIndex } = createRowDataModels(rowContext, fieldInfo, dataModel);

            currentRowIndex = rowIndex;
        });
    } else if (colKeys.length) {
        let currentColumnIndex = 0;
        const newRowIndex = currentRowIndex;

        colKeys.forEach((colKeyObj) => {
            const colContext = {
                ...generalContext,
                rowKeyArr: [],
                rowKey: '',
                colKeyObj,
                newRowIndex,
                currentColumnIndex
            };
            const { columnIndex, rowIndex } = createColumnDataModels(colContext, fieldInfo, dataModel);
            currentRowIndex = rowIndex;
            currentColumnIndex = columnIndex;
        });
    } else {
        let currentColumnIndex = 0;
        const newRowIndex = currentRowIndex;
        const colContext = {
            ...generalContext,
            rowKeyArr: [],
            rowKey: '',
            colKeyObj: { keyArr: [], joinedKey: '' },
            newRowIndex,
            currentColumnIndex
        };
        const { columnIndex, rowIndex } = createColumnDataModels(colContext, fieldInfo, dataModel);
        currentRowIndex = rowIndex;
        currentColumnIndex = columnIndex;
    }

    const formattedColKeys = formatKeys(colKeys.map(e => e.keyArr),
        colFacets.map(facetField => facetField.rawFormat()));
    const formattedRowKeys = formatKeys(rowKeys.map(e => e.keyArr),
        rowFacets.map(facetField => facetField.rawFormat()));

     // Getting column keys
    const transposedColKeys = formattedColKeys.length > 0 ? formattedColKeys[0].map((col, i) =>
     formattedColKeys.map(row => row[i])) : formattedColKeys;

    return { matrix, rowKeys: formattedRowKeys, columnKeys: transposedColKeys };
};
