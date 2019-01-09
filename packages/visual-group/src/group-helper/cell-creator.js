import { AxisOrientation } from '@chartshq/muze-axis';
import { getObjProp, FieldType, STATE_NAMESPACES } from 'muze-utils';
import { getMatrixModel } from './matrix-model';
import {
    getCellKey,
    isDistributionEqual,
    mutateAxesFromMap,
    createSelection,
    getFieldsFromSuppliedLayers,
    extractFields
} from './group-utils';
import { ROW, ROWS, COLUMNS, COL, LEFT, RIGHT, TOP, BOTTOM, PRIMARY, SECONDARY, X, Y } from '../enums/constants';

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
    const {
        entryCellMap,
        exitCellMap
    } = cacheMaps;
    const layerConfigArr = encoder.getLayerConfig({ columnFields, rowFields }, suppliedLayers || []);
    const axesCreators = { config, labelManager, axes, cacheMaps };

    fieldInfo.normalizedColumns = verticalAxis.fields;
    fieldInfo.normalizedRows = horizontalAxis.fields;

    const groupAxes = encoder.createAxis(axesCreators, fieldInfo);

    matrixLayers[rowIndex] = matrixLayers[rowIndex] ? matrixLayers[rowIndex] : [];
    matrixLayers[rowIndex][columnIndex] = layerConfigArr;

    // return from map if already there otherwise create and put in map
    const geomCellKey = getCellKey(rowIndex, columnIndex);
    const fields = {
        y: rowFields,
        x: columnFields
    };

    const allFacets = [
        [...facets.rowFacets[0], ...facets.colFacets[0]],
        [...facets.rowFacets[1], ...facets.colFacets[1]]
    ];
    const geomCell = !exitCellMap.has(geomCellKey) ? new GeomCell() : exitCellMap.get(geomCellKey);

    geomCell.data(datamodel)
                    .axes(groupAxes)
                    .fields(fields)
                    .transform(datamodelTransform)
                    .detailFields(detailFields)
                    .facetByFields(allFacets);
    entryCellMap.set(geomCellKey, geomCell);
    exitCellMap.delete(geomCellKey);

    updateCells(resolver, facets, geomCell);

    return entryCellMap.get(geomCellKey);
};

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
        return e + id;
    }, '')).map((axis) => {
        if (axis && axis[axisIndex]) {
            const axisInst = axis[axisIndex];
            const { orientation, show } = axisInst.config();

            return new cells.AxisCell().source(axisInst).config({
                isOffset: orientation === AxisOrientation.LEFT || orientation === AxisOrientation.TOP,
                show
            });
        }
        return new cells.BlankCell().config({ show: false });
    });

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
                selObj.columnsPrimary = createAxisCells(selObj.colPrime, axes[0], 0, cells);
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
    label => new cells.TextCell({}, { labelManager }).source(label), headers, (key, i) => key + i);

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

    return createSelection(selectionObj[`${type}Headers`], keySet => keySet, selectionKeys,
        (keySet, i) => `${keySet.join(',')}-${i}`)
                    .map(keySet => createTextCells(null, keySet, cells, labelManager)
                                    .map((cell, k, i) => cell.source(keySet[i]).config(facet)));
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
        encoders
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
        encoders
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
        encoders
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

/**
 * Computes matrices for a group
 *
 * @param {Object} datamodel on which the matrices are to be computed
 * @param {Object} config configuration of the matrices
 * @param {Object} layerRegistry contains the registered layers
 * @return {Object} conputed matrices
 * @memberof MatrixResolver
 */
export const computeMatrices = (context, config) => {
    const {
        resolver,
        datamodel,
        componentRegistry,
        encoders
    } = context;
    const {
            globalConfig,
            selection,
            transform
        } = config;
    const groupBy = globalConfig.autoGroupBy;
    const { smartlabel: labelManager } = resolver.dependencies();
    const fieldMap = datamodel.getFieldsConfig();
    const layerConfig = resolver.layerConfig();
    const registry = resolver.registry();
    const { fields: normalizedRows } = resolver.horizontalAxis();
    const { fields: normalizedColumns } = resolver.verticalAxis();
    const otherEncodings = resolver.optionalProjections(config, layerConfig);
    const facetsAndProjections = resolver.getAllFields();
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
        selection
    };
    const cells = {
        GeomCell: resolver.getCellDef(registry.GeomCell),
        AxisCell: resolver.getCellDef(registry.AxisCell),
        BlankCell: resolver.getCellDef(registry.BlankCell),
        TextCell: resolver.getCellDef(registry.TextCell)
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
        suppliedLayers: encoders.simpleEncoder.serializeLayerConfig(resolver.layerConfig()),
        resolver,
        cell: cells.GeomCell,
        encoder: encoders.simpleEncoder,
        newCacheMap,
        detailFields: config.detail
    };
    const fieldsConfig = datamodel.getFieldsConfig();
    let groupedModel = datamodel;
    if (!groupBy.disabled) {
        const fields = getFieldsFromSuppliedLayers(valueCellContext.suppliedLayers, datamodel.getFieldsConfig());
        const allFields = extractFields(facetsAndProjections, fields);

        const dimensions = allFields.filter(field =>
            fieldsConfig[field] && fieldsConfig[field].def.type === FieldType.DIMENSION);
        const aggregationFns = groupBy.measures;

        groupedModel = datamodel.groupBy(dimensions.length ? dimensions : [''], aggregationFns).project(allFields);
    }

    // return a callback function to create the cells from the matrix
    const cellCreator = resolver.valueCellsCreator(valueCellContext);
    // Creates value matrices from the datamodel and configs
    const valueMatrixInfo = getMatrixModel(groupedModel, facetsAndProjections, cellCreator);

    resolver.cacheMaps().exitCellMap.forEach((placeholder) => {
        placeholder.remove();
    });
    resolver.cacheMaps().exitCellMap.clear();
    resolver.valueMatrix(valueMatrixInfo.matrix);

    const { xAxes, yAxes } = mutateAxesFromMap(resolver.cacheMaps(), resolver.axes());

    resolver.axes({
        x: xAxes,
        y: yAxes
    });
    const store = resolver.store();

    [xAxes, yAxes].forEach((axesArr, type) => {
        const stateProps = {};
        axesArr = axesArr || [];
        axesArr.forEach((axes, idx) => {
            axes.forEach((axis, axisIndex) => {
                stateProps[`${idx}${axisIndex}`] = null;
            });
        });
        store.append(`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.${type ? 'y' : 'x'}`, stateProps);
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

    return {
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
};
