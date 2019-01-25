import { VisualUnit } from '@chartshq/visual-unit';
import { generateGetterSetters, STATE_NAMESPACES } from 'muze-utils';
import {
     initializeCacheMaps,
     headerCreator,
     extractUnitConfig,
     setFacetsAndProjections
} from './group-utils';
import {
     ROW, COL, LEFT, RIGHT, COLOR, SIZE, SHAPE, DETAIL, CELL, X_AXES, Y_AXES, ENTRY_CELLS, EXIT_CELLS, INITIALIZED,
     AXIS, UNIT, BEFORE_UPDATE, UPDATED, VALUE_MATRIX, FACET_HEADERS
} from '../enums/constants';
import { createValueCells, computeMatrices } from './cell-creator';
import { RESOLVER_PROPS } from './resolver-props';

/**
 * Resolves the matrices from configuration provided
 *
 * @export
 * @class MatrixResolver
 */
export default class MatrixResolver {

    /**
     * Creates an instance of MatrixResolver.
     * @param {Object} dependencies needed to run the resolver
     * @memberof MatrixResolver
     */
    constructor (dependencies) {
        this._registry = {};
        this._layerConfig = [];
        this._matrixLayers = [];
        this._dependencies = dependencies;
        this._rowMatrix = [];
        this._columnMatrix = [];
        this._valueMatrix = [];
        this._facets = { rowFacets: [], colFacets: [] };
        this._projections = { rowProjections: [], colProjections: [] };
        this._datamodelTransform = {};
        this._units = [];
        this._cacheMaps = {};
        this._axes = {
            x: {},
            y: {},
            color: [],
            size: [],
            shape: []
        };
        generateGetterSetters(this, RESOLVER_PROPS);
        this.cacheMaps(initializeCacheMaps());
    }

    /**
     * Set:  Registers placeholders, Get: return {Object} those placeholders
     *
     * @param {Object} placeholders cells that will construct the group
     * @return {Object} Either current instance or the set of placeholders
     * @memberof MatrixResolver
     */
    registry (...placeholders) {
        if (placeholders.length) {
            Object.entries(placeholders[0]).forEach((val) => {
                this._registry[val[0]] = val[1];
            });
            return this;
        }
        return this._registry;
    }

    /**
     * Used to set the layer config from outside or get current layer info
     *
     * @param {Object} type configuration of layer provided externally
     * @return {Object} either the layer or current instance
     * @memberof MatrixResolver
     */
    cacheMaps (...maps) {
        if (maps.length) {
            [CELL, X_AXES, Y_AXES, ENTRY_CELLS, EXIT_CELLS].forEach((e) => {
                this._cacheMaps[`${e}Map`] = maps[0][`${e}Map`] || this._cacheMaps[`${e}Map`];
            });
            return this;
        }
        return this._cacheMaps;
    }

    /**
     * Used to set the layer config from outside or get current layer info
     *
     * @param {Object} type configuration of layer provided externally
     * @return {Object} either the layer or current instance
     * @memberof MatrixResolver
     */
    axes (...axes) {
        if (axes.length) {
            this._axes = Object.assign({}, this._axes, axes[0]);
            return this;
        }
        return this._axes;
    }

    /**
     *
     *
     * @param {*} facets
     *
     * @memberof MatrixResolver
     */
    facets (...facets) {
        if (facets.length) {
            Object.entries(facets[0]).forEach((e) => {
                this._facets[e[0]] = e[1];
            });
            return this;
        }
        return this._facets;
    }

    /**
     *
     *
     * @param {*} projections
     *
     * @memberof MatrixResolver
     */
    projections (...projections) {
        if (projections.length) {
            Object.entries(projections[0]).forEach((e) => {
                this._projections[e[0]] = e[1];
            });
            return this;
        }
        return this._projections;
    }

    /**
     *
     *
     * @param {*} config
     * @param {*} layerConfig
     *
     * @memberof MatrixResolver
     */
    optionalProjections (config, layerConfig) {
        const otherEncodings = {};
        const optionalProjections = [];
        const otherEncodingTypes = [SIZE, COLOR, SHAPE];

        otherEncodingTypes.forEach((type) => {
            if (config[type] && config[type].field) {
                const enc = config[type];
                otherEncodings[type] = enc.field;
                optionalProjections.push(enc.field);
            }
        });

        if (config[DETAIL]) {
            optionalProjections.push(...config.detail);
        }

        if (layerConfig.length) {
            layerConfig.forEach((layer) => {
                if (layer.encoding) {
                    Object.values(layer.encoding).forEach((enc) => {
                        if (enc && optionalProjections.indexOf(enc.field) === -1) {
                            optionalProjections.push(enc.field ? enc.field : enc);
                        }
                    });
                }
            });
        }
        this.projections({ optionalProjections });
        return otherEncodings;
    }

    /**
     * return the normalized set of rows and facets and projections
     *
     * @param {Object} rows parameters needed to set horizontal axis consisiting of rows
     * @return {Object} facets, projections and normalized rows
     * @memberof MatrixResolver
     */
    horizontalAxis (rows, encoder) {
        if (rows) {
            this._horizontalAxis = setFacetsAndProjections(this, { type: ROW, fields: rows }, encoder);
            return this;
        }
        return this._horizontalAxis;
    }

    /**
     * return the normalized set of columns and facets and projections
     *
     * @param {Object} columns parameters needed to set vertical axis consisiting of columns
     * @return {Object} facets, projections and normalized columns
     * @memberof MatrixResolver
     */
    verticalAxis (columns, encoder) {
        if (columns) {
            this._verticalAxis = setFacetsAndProjections(this, { type: COL, fields: columns }, encoder);
            return this;
        }
        return this._verticalAxis;
    }

    /**
     * Gets the class definition of a particular cell type(if the particular type has been extended, that particular
     * definition is returned)
     *
     * @param {Object} cell cell whose class definition is to be retrieved
     * @return {Object} cell definition
     * @memberof MatrixResolver
     */
    getCellDef (cell) {
        const registry = this.registry();

        Object.values(registry).forEach((e) => {
            if (e.prototype instanceof cell) {
                cell = e;
            }
        });
        return cell;
    }

    /**
     * return a visual cell creator along with its axis information to be injected to the datamodel creation
     * function
     *
     * @param {Object} GeomCell Type of cell to be created
     * @return {Object} Created cell
     * @memberof MatrixResolver
     */
    valueCellsCreator (context) {
        // reset matrix layers
        this.matrixLayers([]);

        return (datamodel, fieldInfo, facets) => createValueCells(context, datamodel, fieldInfo, facets);
    }

    /**
     * Callback to be applied on each cell of a matrix of a particular type
     *
     * @param {string} matrixType type of matrix on which callback is to be applied
     * @param {Function} callback function to be applied to each cell
     * @memberof MatrixResolver
     */
    forEach (matrixType, callback) {
        this[matrixType]().forEach((row, rIndex) => {
            row.forEach((col, cIndex) => {
                callback(rIndex, cIndex, col);
            });
        });
    }

    /**
     *
     *
     *
     * @memberof MatrixResolver
     */
    getAllFields () {
        const retObj = this.projections();

        Object.entries(this.facets()).forEach((e) => {
            retObj[e[0]] = e[1];
        });
        return retObj;
    }

    /**
     *
     *
     * @memberof MatrixResolver
     */
    resetSimpleAxes () {
        return this.axes({
            x: new Set(),
            y: new Set()
        });
    }

    /**
     *
     *
     * @param {*} componentRegistry
     * @param {*} config
     * @memberof MatrixResolver
     */
    createUnits (componentRegistry, config) {
        const {
            globalConfig,
            alias
        } = config;
        const {
            layerRegistry,
            sideEffectRegistry
        } = componentRegistry;
        const {
            smartlabel: smartLabel,
            lifeCycleManager
        } = this.dependencies();
        // Provide the source for the matrix
        const units = [[]];
        // Setting unit configuration
        const unitConfig = extractUnitConfig(globalConfig || {});
        const globalState = VisualUnit.getState()[0];
        const globalStates = {};
        const store = this.store();
        this.forEach(VALUE_MATRIX, (i, j, el) => {
            let unit = el.source();
            if (!unit) {
                const namespace = `${i}${j}`;

                unit = VisualUnit.create({
                    layerRegistry,
                    sideEffectRegistry
                }, {
                    smartLabel,
                    lifeCycleManager
                });
                globalStates[namespace] = null;
                unit.metaInf({
                    rowIndex: i,
                    colIndex: j,
                    namespace
                });
                unit.store(store);
                el.source(unit);
            }
            !units[i] && (units[i] = []);
            units[i][j] = unit;
            unit.parentAlias(alias);
            el.config(unitConfig);
        });

        for (const key in globalState) {
            store.append(`${STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE}.${key}`, globalStates);
        }

        lifeCycleManager.notify({ client: units, action: INITIALIZED, formalName: UNIT });
        return this.units(units);
    }

    /**
     *
     *
     * @param {*} config
     * @memberof MatrixResolver
     */
    setDomains (config, datamodel, encoders) {
        const {
            color,
            shape,
            size,
            globalConfig
        } = config;
        const groupBy = globalConfig.autoGroupBy;
        const {
            rowFacets,
            colFacets
        } = this.getAllFields();
        const encoding = {
            color,
            shape,
            size
        };
        const facetFields = [...rowFacets.map(e => e.toString()), ...colFacets.map(e => e.toString())];
        const retContext = {
            domains: encoders.simpleEncoder.getRetinalFieldsDomain(datamodel, encoding, facetFields, groupBy),
            axes: this.axes(),
            encoding
        };
        encoders.retinalEncoder.setCommonDomain(retContext);
        return this;
    }

    resetFacetsAndProjections () {
        this._facets = {};
        this._projections = {};
        return this;
    }

    /**
     *
     *
     *
     * @memberof MatrixResolver
     */
    getRetinalAxes () {
        const {
            color,
            shape,
            size
        } = this.axes();

        return {
            color: [...color],
            shape: [...shape],
            size: [...size]
        };
    }

    /**
     *
     *
     * @param {*} type
     *
     * @memberof MatrixResolver
     */
    getSimpleAxes (type) {
        return this.axes()[`${type}`];
    }

    /**
     *
     *
     * @param {*} datamodel
     * @param {*} config
     * @memberof MatrixResolver
     */
    createRetinalAxes (fieldsConfig, config, encoders) {
        const layerConfig = this.layerConfig();
        this.optionalProjections(config, layerConfig);
        const retinalAxes = encoders.retinalEncoder.createAxis({
            fieldsConfig,
            config,
            axes: this.axes()
        });
        const {
            lifeCycleManager
        } = this.dependencies();

        [COLOR, SHAPE, SIZE].forEach((e) => {
            this.axes()[e] = retinalAxes[e];
        });

        lifeCycleManager.notify({ client: this.axes(), action: INITIALIZED, formalName: AXIS });
        lifeCycleManager.notify({ client: this.units(), action: BEFORE_UPDATE, formalName: UNIT });

        const units = [];
        const matrixLayers = this.matrixLayers();

        this.forEach(VALUE_MATRIX, (i, j, el) => {
            el.axes(retinalAxes);
            el.source() && el.source().retinalFields(config);
            el.layerDef(encoders.retinalEncoder.getLayerConfig(config, matrixLayers[i][j]));
            el.updateModel();

            units.push(el.source());
        });

        lifeCycleManager.notify({ client: units, action: UPDATED, formalName: UNIT });
        return this;
    }

    /**
     *
     *
     * @param {*} placeholders
     * @param {*} fieldNames
     *
     * @memberof MatrixResolver
     */
    createHeaders (placeholders, fieldNames, config) {
        let bottomLeft = [];
        let bottomRight = [];
        const {
            rows,
            columns
        } = placeholders;
        const {
            smartlabel: labelManager,
            lifeCycleManager
        } = this.dependencies();
        const {
            showHeaders,
            classPrefix
        } = config;
        const TextCell = this.getCellDef(this.registry().TextCell);
        const BlankCell = this.getCellDef(this.registry().BlankCell);
        const [leftRows, rightRows] = rows;
        const [topCols, bottomCols] = columns;
        const rowHeaders = fieldNames.rows;
        const blankCellCreator = cell => new BlankCell().config({ show: cell.config().show });

        // Headers and footers are created based on the rows. Thereafter, using the column information
        // they are tabularized into the current structure
        const headers = {
            left: headerCreator(leftRows, rowHeaders[0], showHeaders ? TextCell : BlankCell,
                { classPrefix, labelManager }),
            right: headerCreator(rightRows, rowHeaders[1], showHeaders ? TextCell : BlankCell,
                { classPrefix, labelManager })
        };
        const footers = {
            left: leftRows.length > 0 ? leftRows[0].map(blankCellCreator) : [],
            right: rightRows.length > 0 ? rightRows[0].map(blankCellCreator) : []
        };
        const [topLeft, topRight] = [LEFT, RIGHT].map(type => topCols.map((col, i) => {
            if (i === topCols.length - 1) {
                return headers[type];
            }
            return footers[type];
        }));

        // Creating only bottom matrices if there is no information on the top
        if (topCols.length === 0) {
            [bottomLeft, bottomRight] = [LEFT, RIGHT].map(type => bottomCols.map((col, i) => {
                if (i === 0) {
                    return headers[type];
                }
                return footers[type];
            }));
        } else {
            bottomLeft = bottomCols.map(() => (leftRows.length > 0 ? leftRows[0].map(blankCellCreator) : []));
            bottomRight = bottomCols.map(() => (rightRows.length > 0 ? rightRows[0].map(blankCellCreator) : []));
        }

        lifeCycleManager.notify({
            client: [topLeft, topRight, bottomLeft, bottomRight],
            action: INITIALIZED,
            formalName: FACET_HEADERS
        });

        return { topLeft, topRight, bottomLeft, bottomRight };
    }

    /**
     *
     *
     * @param {*} datamodel
     * @param {*} config
     * @param {*} componentRegistry
     * @param {*} encoders
     *
     * @memberof MatrixResolver
     */
    getMatrices (datamodel, config, componentRegistry, encoders) {
        const context = {
            datamodel,
            componentRegistry,
            encoders,
            resolver: this
        };

        return computeMatrices(context, config);
    }

    store (...params) {
        if (params.length) {
            this._store = params[0];
            return this;
        }
        return this._store;
    }
}
