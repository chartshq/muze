import { AxisOrientation } from '@chartshq/muze-axis';
import {
    getObjProp,
    FieldType,
    retrieveNearestGroupByReducers,
    mergeRecursive,
    createSelection,
    DataModel
} from 'muze-utils';
import { getMatrixModel } from './matrix-model';
import {
    getCellKey,
    isDistributionEqual,
    mutateAxesFromMap,
    getFieldsFromSuppliedLayers,
    extractFields,
    removeExitCells,
    sanitizeCheck
} from './group-utils';
import { ROW, ROWS, COLUMNS, COL, LEFT, RIGHT, TOP,
    BOTTOM, PRIMARY, SECONDARY, X, Y, TEMPORAL } from '../enums/constants';
import { SimpleVariable } from '../variable';
import { sanitiseBorderMatrix, sanitiseGeomMatrix } from './cell-border-applier';

/**
 * Updates row and column cells with the geom cell corresponding to the facet keys
 *
 * @param {*} resolver
 * @param {*} facets
 */
const updateCells = (resolver, facets, geomCell) => {
    [ROW, COL].forEach((field) => {
        const cells = resolver[`${field}Cells`]();
        const facetKey = facets[`${field}Facets`][1].join();

        !cells[facetKey] && (cells[facetKey] = []);
        cells[facetKey].push(geomCell);
        resolver[`${field}Cells`](cells);
    });
};

/**
 *
 *
 * @param {*} context
 * @param {*} datamodel
 * @param {*} fieldInfo
 * @param {*} facets
 *
 */
export const createValueCells = (context, datamodel, fieldInfo, facets) => {
    const {
        projections,
        indices
    } = fieldInfo;
    const {
        rowFields,
        columnFields
    } = projections;
    const {
         rowIndex,
         columnIndex
    } = indices;
    const {
        suppliedLayers,
        cell: GeomCell,
        resolver,
        config,
        encoder,
        detailFields
    } = context;
    const axes = resolver.axes();
    const cacheMaps = resolver.cacheMaps();
    const matrixLayers = resolver.matrixLayers();
    const labelManager = resolver.dependencies().smartlabel;
    const horizontalAxis = resolver.horizontalAxis();
    const verticalAxis = resolver.verticalAxis();
    const datamodelTransform = resolver.datamodelTransform();
    const sortedFields = config.sort;
    const {
        entryCellMap,
        exitCellMap
    } = cacheMaps;
    const layerConfigArr = encoder.getLayerConfig({ columnFields, rowFields }, suppliedLayers || [],
        context.retinalConfig);
    const axesCreators = { config, labelManager, axes, cacheMaps };

    fieldInfo.normalizedColumns = verticalAxis.fields;
    fieldInfo.normalizedRows = horizontalAxis.fields;

    const allFacets = [
        [...facets.rowFacets[0], ...facets.colFacets[0]],
        [...facets.rowFacets[1], ...facets.colFacets[1]]
    ];
    const facetFields = allFacets.slice();
    facetFields[0] = facetFields[0].map(facetField => facetField.oneVar());

    matrixLayers[rowIndex] = matrixLayers[rowIndex] ? matrixLayers[rowIndex] : [];
    matrixLayers[rowIndex][columnIndex] = layerConfigArr;

    // return from map if already there otherwise create and put in map
    const geomCellKey = getCellKey(rowIndex, columnIndex);
    const fields = {
        y: rowFields,
        x: columnFields
    };

    const geomCell = !exitCellMap.has(geomCellKey) ? new GeomCell() : exitCellMap.get(geomCellKey);

    // Sort datamodel if user has sorted a field
    const sortConfig = Object.keys(sortedFields).map(field => [field, sortedFields[field]]);
    if (sortConfig.length) {
        datamodel = datamodel.sort(sortConfig, { saveChild: true });
    }

    geomCell.data(datamodel)
                    .fields(fields)
                    .transform(datamodelTransform)
                    .detailFields(detailFields)
                    .facetByFields(allFacets);

    encoder.createAxis(axesCreators, fieldInfo, Object.assign({}, context, { geomCell, facetFields }));
    entryCellMap.set(geomCellKey, geomCell);
    exitCellMap.delete(geomCellKey);

    updateCells(resolver, facets, geomCell);

    return entryCellMap.get(geomCellKey);
};

const extractAxisIndex = id => getObjProp(id.match(/^[0-9]*?(?=-)/g), 0);

/**
 * Creates axis cells based on the set of axes
 *
 * @param {Selection} selection Contains a selection of the axis units
 * @param {Array} axes Actual axis units
 * @param {number} axisIndex 0-> primary axis, 1-> secondary axis(when dual axis is made)
 * @param {Object} cells Contains a collection of the cells
 * @return {Object} return either set of axis/blank cells depending on the config
 */
const createAxisCells = (selection, axes, axisIndex, cells) =>
    createSelection(selection, axis => axis, axes, (item, i) => i + item.reduce((e, n) => {
        const id = n.id + axisIndex;
        return `${e}-${id}`;
    }, '')).map((currObj, axis) => {
        if (axis && axis[axisIndex]) {
            const axisInst = axis[axisIndex];
            const { orientation, show } = axisInst.config();

            return new cells.AxisCell().source(axisInst).config({
                isOffset: orientation === AxisOrientation.LEFT || orientation === AxisOrientation.TOP,
                show
            });
        }
        return new cells.BlankCell().config({ show: false });
    }).sort((a, b) => extractAxisIndex(a[0]) - extractAxisIndex(b[0]));

/**
 *
 *
 * @param {*} context
 * @param {*} selectionObj
 * @param {*} cells
 * @retur
 */
const axisPlaceholderGn = (context, selObj, cells) => {
    const {
        matrices
    } = context;
    const {
        axesMatrix
    } = matrices;

    return (type, axisFrom) => {
        const axes = axesMatrix[`${type}`];

        if (axes && axes.length) {
            if (type === X || type === Y) {
                const fieldNames = type === Y ? ROWS : COLUMNS;

                [PRIMARY, SECONDARY].forEach((fieldType, index) => {
                    const selObjProp = `${fieldNames}${fieldType}`;
                    let axisIndex = index;
                    let axesForDraw = axes;
                    if (axisFrom === RIGHT || axisFrom === BOTTOM) {
                        axisIndex = 1 - axisIndex;
                    }
                    if (!getObjProp(axes, 0, axisIndex)) {
                        axesForDraw = [];
                    }
                    selObj[selObjProp] = createAxisCells(selObj[selObjProp], axesForDraw, axisIndex, cells);
                });
            } else {
                selObj.rowsPrimary = createAxisCells(selObj.rowPrime, axes.map(() => []), 0, cells);
                selObj.rowsSecondary = createAxisCells(selObj.rowSec, axes.map(() => []), 0, cells);
                selObj.columnsPrimary = createAxisCells(selObj.colPrime, axes[0], 0, cells);
                selObj.columnsSecondary = createAxisCells(selObj.colSec, axes[0], 0, cells);
            }
        }
        return selObj;
    };
};

/**
 * Creates header cells based on the set of headers
 *
 * @param {Object} selection Contains a selection of the header units
 * @param {string} headers Contains a list of the headers
 * @param {Object} cells Contains a collection of the cells
 * @param {Object} labelManager smart label instance
 * @return {Object} return either set of header cells depending on the config
 */
const createTextCells = (selection, headers, cells, labelManager) => createSelection(selection,
        (label) => {
            const textCell = new cells.TextCell({}, { labelManager });
            textCell.source(label);
            return textCell;
        }, headers, (key, i) => key + i);

const extractFacetIndex = id => id.split('-').pop();

/**
 *
 *
 * @param {*} context
 * @param {*} selectionObj
 * @param {*} cells
 * @param {*} labelManager
 *
 */
const headerPlaceholderGn = (context, selectionObj, cells, labelManager) => {
    const {
        axis,
        keys,
        type,
        facet
    } = context;
    const counter = axis.length / keys.length;
    const selectionKeys = keys.length ? axis.map((d, i) => keys[Math.floor(i / counter)]) : [];

    const selObjUpdater = createSelection(selectionObj[`${type}Headers`], keySet => keySet, selectionKeys,
    (keySet, i) => `${keySet.join(',')}-${i}`)
        .sort((a, b) => extractFacetIndex(a[0]) - extractFacetIndex(b[0]));

    return selObjUpdater.map((keySet, data) => {
        let textCells = createTextCells(null, data, cells, labelManager);
        textCells = textCells.map((cell, k) => cell.source(k).config(facet));
        return textCells;
    });
};

/**
 * Creates a set of placeholders as a part of selection object
 *
 * @param {Array} normalizedOptions contains normalized rows and columns
 * @param {Array} matrices contains axis and value matrices
 * @param {aArrayny} projections contains set of row and column projections
 * @param {Object} cells Contains a collection of the cells
 * @param {Object} labelManager smart label instance
 * @return {Object} Creates a set of placeholders as a part of selections
 */
const generatePlaceholders = (context, cells, labelManager) => {
    let selectionObj;
    const {
        matrices,
        fields,
        facetsAndProjections,
        selection,
        facet,
        encoders,
        resolver
    } = context;
    const {
        rows,
        columns
    } = fields;
    const {
        valuesMatrix
    } = matrices;
    const {
        rowProjections,
        colProjections
    } = facetsAndProjections;
    const {
        rowKeys,
        columnKeys
    } = valuesMatrix;
    const takeAxisFrom = encoders.simpleEncoder._axisFrom;
    const takeHeaderFrom = encoders.simpleEncoder._headerFrom;

    selectionObj = selection || {};

    ['pie', X, Y].forEach((axis) => {
        const axisFrom = axis === X ? takeAxisFrom.column : takeAxisFrom.row;
        selectionObj = axisPlaceholderGn(context, selectionObj, cells)(axis, axisFrom);
    });

    const {
        rowsPrimary,
        rowsSecondary,
        columnsPrimary,
        columnsSecondary
    } = selectionObj;

    const rowAxis = rowsPrimary && rowsPrimary.getObjects().length ? rowsPrimary.getObjects() :
        (rowsSecondary && rowsSecondary.getObjects().length ? rowsSecondary.getObjects() : []);
    const colAxis = columnsPrimary && columnsPrimary.getObjects().length ? columnsPrimary.getObjects() :
        (columnsSecondary && columnsSecondary.getObjects().length ? columnsSecondary.getObjects() : []);

    const headerConfig = [
        { type: LEFT, section: rows[0], axis: rowAxis, headerFrom: takeHeaderFrom.row },
        { type: RIGHT, section: rows[1], axis: rowAxis, headerFrom: takeHeaderFrom.row },
        { type: TOP, section: columns[0], axis: colAxis, headerFrom: takeHeaderFrom.column },
        { type: BOTTOM, section: columns[1], axis: colAxis, headerFrom: takeHeaderFrom.column }
    ];

    headerConfig.forEach((config, index) => {
        let keys;
        let length;
        const {
            type,
            section,
            axis,
            headerFrom
        } = config;

        if (index < 2) {
            keys = rowKeys;
            length = rowProjections.length > 0 ? rowProjections.length : 1;
        } else {
            keys = columnKeys;
            length = colProjections.length > 0 ? colProjections.length : 1;
        }
        keys = keys.map(arr => arr.map(val => resolver.valueParser()(val)));
        if (section.length && headerFrom === type && axis && keys.length) {
            const hContext = { axis, length, type };
            let headers = [];
            if (index < 2) {
                hContext.keys = keys;
                hContext.facet = facet.rows;
                headers = headerPlaceholderGn(hContext, selectionObj, cells, labelManager);
            } else {
                hContext.facet = facet.columns;
                hContext.keys = keys[0].map((key, i) => keys.map(e => e[i]));

                headers = headerPlaceholderGn(hContext, selectionObj, cells, labelManager);
            }
            selectionObj[`${type}Headers`] = headers;
        } else {
            selectionObj[`${type}Headers`] = null;
        }
    });
    return selectionObj;
};

/**
 * Generates matrices
 *
 * @param {Object} config Configuration to generate matrices
 * @param {Array} matrices Matrices containing the set of visual units and axes units
 * @param {Object} cells Contains a collection of the cells
 * @param {Object} labelManager smart label instance
 * @return {Object} contains a collection of matrices
 */
export const generateMatrices = (context, matrices, cells, labelManager) => {
    const {
        unitHeight,
        unitWidth,
        facetsAndProjections,
        normalizedRows,
        normalizedColumns,
        selection,
        axisFrom,
        facet,
        encoders,
        resolver
     } = context;
    const placeholderContext = {
        fields: {
            rows: normalizedRows,
            columns: normalizedColumns
        },
        matrices,
        facetsAndProjections,
        selection,
        axisFrom,
        facet,
        encoders,
        resolver
    };
    // Generate placeholders for all matrices
    const selectionObj = generatePlaceholders(placeholderContext, cells, labelManager);
    const {
        columnsPrimary,
        columnsSecondary,
        rowsPrimary,
        rowsSecondary,
        leftHeaders,
        topHeaders,
        bottomHeaders,
        rightHeaders
    } = selectionObj;
    const [rowPrime, rowSec, colPrime, colSec] = [rowsPrimary, rowsSecondary, columnsPrimary, columnsSecondary]
        .map(d => (d ? d.getObjects() : []));
    const [leftFacets, rightFacets] = [leftHeaders, rightHeaders]
        .map(e => (e ? e.getObjects()
                        .map(f => f.getObjects()) : []));
    let rowPriority = rowSec.length ? 1 : -1;
    rowPrime.length && rowPriority++;
    let colPriority = colSec.length ? 1 : -1;
    colPrime.length && colPriority++;

    // Compute left matrix using left headers and the axes on the rows
    let leftMatrix = leftFacets.length ? leftFacets.map((d, i) => {
        rowPrime[i] = rowPrime[i] ? [rowPrime[i]] : [];
        return [...d, ...rowPrime[i]];
    }) : (rowPrime ? rowPrime.map(d => [d]) : []);

    // Compute right matrix using right headers and the axes on the rows
    const rightMatrix = rowSec.length ? rowSec.map((d, i) => [d, ...(rightFacets[i] || [])]) : (rightFacets.length ?
        rightFacets.map(d => [...d]) : []);

    const topMatrix = [];
    if (topHeaders) {
        const headers = topHeaders.getObjects();
        headers.forEach((e) => {
            const innerHeaders = e.getObjects();
            innerHeaders.forEach((x, i) => {
                topMatrix[i] = topMatrix[i] || [];
                topMatrix[i].push(x);
            });
        });
    }
    // Compute top matrix using the top headers and axes on the columns
    if (colPrime.length) {
        topMatrix.push(colPrime);
    }

    // Bottom and right matrices are prepared using the user config.
    let bottomMatrix = [];
    if (colSec.length) {
        bottomMatrix.push(colSec);
    }
    const currentBottomLength = bottomMatrix.length;
    if (bottomHeaders) {
        const headers = bottomHeaders.getObjects();
        headers.forEach((e) => {
            const innerHeaders = e.getObjects();
            innerHeaders.forEach((x, i) => {
                bottomMatrix[i + currentBottomLength] = bottomMatrix[i + currentBottomLength] || [];
                bottomMatrix[i + currentBottomLength].push(x);
            });
        });
    }

    if (!leftMatrix.length && !rightMatrix.length) {
        const cell = new cells.BlankCell();
        cell.setAvailableSpace(unitWidth, unitHeight);
        leftMatrix = [[cell]];
    }

    if (!topMatrix.length && (!bottomMatrix.length || !bottomMatrix[0].length)) {
        const cell = new cells.BlankCell();
        cell.setAvailableSpace(unitWidth, unitHeight);
        bottomMatrix = [[cell]];
    }

    return {
        rows: [leftMatrix, rightMatrix],
        columns: [topMatrix, bottomMatrix],
        selectionObj,
        colPriority,
        rowPriority
    };
};

const getAxisFields = (projections, fieldHolder = []) =>
                            projections.reduce((acc, item) =>
                                [...acc, ...item.reduce((ac, field) =>
                                   (field instanceof SimpleVariable ? [...ac, field.oneVar()] : ac), [])], fieldHolder);

const sortDmTemporalFields = (resolver, datamodel) => {
    let axisFields = [];
    const projections = resolver.projections();
    axisFields = getAxisFields(projections.rowProjections, getAxisFields(projections.colProjections));

    const fieldConfig = datamodel.getFieldsConfig();
    const temporalFields = axisFields.reduce((acc, field) =>
        ((fieldConfig[field].def.subtype === TEMPORAL) ? [...acc, [field]] : acc), []);
    return temporalFields.length ? datamodel.sort(temporalFields, { saveChild: true }) : datamodel;
};

const transformDataModel = (dataModel, config, resolver) => {
    let groupedModel;

    const fieldsConfig = dataModel.getFieldsConfig();
    const resolvedData = resolver.data();
    const { groupBy, suppliedLayers, facetsAndProjections } = config;

    if (resolvedData instanceof DataModel) {
        resolvedData.dispose();
    }

    const fields = getFieldsFromSuppliedLayers(suppliedLayers).filter(field =>
        getObjProp(fieldsConfig, field, 'def', 'type') === FieldType.DIMENSION);
    const allFields = extractFields(facetsAndProjections, fields);

    groupedModel = dataModel.project(allFields);
    resolver.data(groupedModel);
    if (!groupBy.disabled) {
        const newFieldsConfig = groupedModel.getFieldsConfig();
        const dimensions = allFields.filter(field =>
            getObjProp(newFieldsConfig, field, 'def', 'type') === FieldType.DIMENSION);
        const aggregationFns = groupBy.measures;
        const measureNames = Object.keys(groupedModel.getFieldspace().getMeasure());
        const nearestAggFns = retrieveNearestGroupByReducers(groupedModel, ...measureNames);
        const resolvedAggFns = mergeRecursive(nearestAggFns, aggregationFns);

        groupedModel = groupedModel.groupBy(dimensions.length ? dimensions : [''], resolvedAggFns);
    }
    // sort temporal fields if any in the given rows and columns
    groupedModel = sortDmTemporalFields(resolver, groupedModel);
    resolver.transformedData(groupedModel);
    return groupedModel;
};

/**
 * Computes matrices for a group
 *
 * @param {Object} datamodel on which the matrices are to be computed
 * @param {Object} config configuration of the matrices
 * @param {Object} layerRegistry contains the registered layers
 * @return {Object} conputed matrices
 * @memberof MatrixResolver
 */
export const computeMatrices = (resolverConfig) => {
    let placeholderInfo = {};
    const {
        datamodel,
        encoders,
        resolver,
        globalConfig,
        selection,
        transform,
        componentRegistry,
        groupBy,
        labelManager,
        fieldMap,
        layerConfig,
        registry,
        normalizedRows,
        normalizedColumns,
        otherEncodings,
        facetsAndProjections,
        simpleEncoder,
        config
    } = resolverConfig;

    const { rowFacets, colFacets } = facetsAndProjections;
    const isFacet = rowFacets.length > 0 || colFacets.length > 0;

    if (isFacet) {
        globalConfig.isFacet = true;
    }
    const matrixGnContext = {
        // Configuration to be passed to generate the  different matrices.
        // A common config is used for both value matrices and other matrices
        normalizedColumns,
        normalizedRows,
        facetsAndProjections,
        layers: layerConfig,
        fieldMap,
        otherEncodings,
        encoders,
        facet: globalConfig.facet || {},
        axisFrom: globalConfig.axisFrom || {},
        selection,
        resolver
    };
    const cells = {
        GeomCell: resolver.getCellDef(registry.cells.GeomCell),
        AxisCell: resolver.getCellDef(registry.cells.AxisCell),
        BlankCell: resolver.getCellDef(registry.cells.BlankCell),
        TextCell: resolver.getCellDef(registry.cells.TextCell)
    };
    const isRowSizeEqual = isDistributionEqual(normalizedRows);
    const isColumnSizeEqual = isDistributionEqual(normalizedColumns);

    resolver.colCells({});
    resolver.rowCells({});
    resolver.datamodelTransform(transform || {});

    // Cell creation begins here
    resolver.resetSimpleAxes();

    const {
        entryCellMap
    } = resolver.cacheMaps();
    const newCacheMap = {
        exitCellMap: entryCellMap,
        entryCellMap: new Map()
    };

    resolver.cacheMaps(newCacheMap);
    const valueCellContext = {
        config: globalConfig,
        suppliedLayers: simpleEncoder.serializeLayerConfig(resolver.layerConfig()),
        resolver,
        cell: cells.GeomCell,
        encoder: simpleEncoder,
        newCacheMap,
        detailFields: config.detail,
        retinalConfig: {
            color: config.color,
            size: config.size,
            shape: config.shape
        }
    };

    const groupedModel = transformDataModel(datamodel, {
        facetsAndProjections,
        suppliedLayers: valueCellContext.suppliedLayers,
        groupBy
    }, resolver);
    simpleEncoder.data(groupedModel);
    // return a callback function to create the cells from the matrix
    const cellCreator = resolver.valueCellsCreator(valueCellContext);
    // Creates value matrices from the datamodel and configs
    const valueMatrixInfo = getMatrixModel(groupedModel, facetsAndProjections, cellCreator, globalConfig);

    removeExitCells(resolver);
    resolver.cacheMaps().exitCellMap.clear();
    resolver.valueMatrix(valueMatrixInfo.matrix);

    const { xAxes, yAxes } = mutateAxesFromMap(resolver.cacheMaps(), resolver.axes());

    resolver.axes({
        x: xAxes,
        y: yAxes
    });

    resolver.createUnits(componentRegistry, config);

    const matrices = {
        valuesMatrix: valueMatrixInfo,
        axesMatrix: resolver.axes()
    };
    // Create all matrices
    const {
        rows,
        columns,
        selectionObj,
        rowPriority,
        colPriority
    } = generateMatrices(matrixGnContext, matrices, cells, labelManager);

    resolver.rowMatrix(rows);
    resolver.columnMatrix(columns);

    if (isFacet) {
        const sanitizeCheckBorder = sanitizeCheck(globalConfig.facetsUserConfig);
        const arr = sanitizeCheckBorder && sanitiseBorderMatrix({
            leftMatrix: rows[0],
            rightMatrix: rows[1],
            topMatrix: columns[0],
            bottomMatrix: columns[1]
        }, registry.cells.BlankCell);
        valueMatrixInfo.matrix = sanitizeCheckBorder && sanitiseGeomMatrix(valueMatrixInfo.matrix, arr);
    }

    placeholderInfo = {
        rows: resolver.rowMatrix(),
        columns: resolver.columnMatrix(),
        values: resolver.valueMatrix(),
        isColumnSizeEqual,
        isRowSizeEqual,
        priority: {
            row: rowPriority,
            col: colPriority
        },
        selection: selectionObj,
        dataModels: {
            groupedModel,
            parentModel: datamodel
        }
    };
    return placeholderInfo;
};
