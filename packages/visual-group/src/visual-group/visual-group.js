import { transactor, FieldType, generateGetterSetters } from 'muze-utils';
import localOptions from './local-options';
import { SimpleGroup } from '../simple-group';
import {
    MatrixResolver,
    initStore,
    findInGroup
} from '../group-helper';
import { setupChangeListeners } from './change-listener';
import { PROPS } from './props';
import {
    CONFIG,
    MOUNT,
    RETINAL,
    Y
} from '../enums/constants';

/**
 * This class is used to create an instance of a visual group.
 * It extends the SimpleGroup (which is an interface). The visual group takes in a datamodel,
 * and a set of rows and columns, alongwith optional paramters (like color, size, shape).
 *
 * @class VisualGroup
 */
class VisualGroup extends SimpleGroup {

    /**
     * Creates an instance of VisualGroup. Requires dependencies and other registry options for placeholders
     * and layers that create individual units
     * @param {Object} registry Key value pair of compostions for the group
     * @param {Object} dependencies Dependencies needed to run the group
     * @memberof VisualGroup
     */
    constructor (registry, dependencies) {
        super();

        const {
            componentSubRegistry
        } = registry;

        this._dependencies = dependencies;
        // Generate getter/setter methods for all properties of the class
        // One can get each property by calling the method and can set it
        // by passing paramaters for the same. Thus, one can chain setter
        // getter methods.
        generateGetterSetters(this, PROPS);
        // Populate the store with default values
        this.store(initStore());

        // initialize group compositions
        this._composition = {};
        // store reference to data
        this._data = [];
        // matrix instance store each of the matrices
        this._matrixInstance = {};
        // store reference to mountpoint
        this._mount = null;
        // selection object that takes care of updating of components
        this._selection = {};
        // stores info about the placeholders generated after creation of matrices
        this._placeholderInfo = {};
        // corner matrices are the headers/footers for the application
        this._cornerMatrices = {};
        // Create instance of matrix resolver
        this.resolver(new MatrixResolver(this._dependencies));

         // Getting indiviual registered items
        this.registry({
            layerRegistry: componentSubRegistry.layerRegistry.get(),
            cellRegistry: componentSubRegistry.cellRegistry.get()
        });
        // Add local options to the store
        transactor(this, localOptions, this.store().model);
        // Register listeners
        setupChangeListeners(this);
    }

    matrixInstance (...matrices) {
        if (matrices.length) {
            return this;
        }
        return this.composition().matrices;
    }

    /**
     *
     *
     * @readonly
     * @memberof VisualGroup
     */
    composition (...params) {
        if (params.length) {
            return this;
        }
        return this._composition;
    }

    /**
     * Locks the model to prevent change listeners to be triggered until unlocked
     *
     * @return {Object} Instance of class VisualGroup
     * @memberof VisualGroup
     */
    lockModel () {
        this.store().model.lock();
        return this;
    }

    /**
     * Unlocks the model so that all change listeners can be triggered
     *
     * @return {Object} Instance of class VisualGroup
     * @memberof VisualGroup
     */
    unlockModel () {
        this.store().model.unlock();
        return this;
    }

    /**
     *
     *
     * @param {*} variable
     * @return
     * @memberof VisualGroup
     */
    where (variable) {
        return findInGroup(variable, this.resolver().getAllFields());
    }

    /**
     *
     *
     * @param {*} type
     * @return
     * @memberof VisualGroup
     */
    getAxes (type) {
        if (type === RETINAL) {
            return this.resolver().getRetinalAxes();
        }
        return this.resolver().getSimpleAxes(type);
    }

    /**
     *
     *
     * @return
     * @memberof VisualGroup
     */
    getCells (type) {
        return this.resolver()[`${type}Cells`]();
    }

    /**
     *
     *
     * @param {*} channel
     * @return
     * @memberof VisualGroup
     */
    getFieldsFromChannel (channel) {
        const {
            rowProjections,
            colProjections
        } = this.resolver().getAllFields();

        return channel === Y ? rowProjections : colProjections;
    }

    /**
     *
     *
     * @param {*} facetKey
     * @return
     * @memberof VisualGroup
     */
    getCellsByFacetKey (facetKey) {
        const resolver = this.resolver();
        const cells = resolver.rowCells()[facetKey] || resolver.colCells()[facetKey] || [];
        return cells;
    }

    /**
     *
     *
     * @param {*} facetKey
     * @return
     * @memberof VisualGroup
     */
    getAxesByFacetKey (axisType, facetKey) {
        const resolver = this.resolver();
        const cells = resolver.rowCells()[facetKey] || resolver.colCells()[facetKey];
        const axes = cells[0].valueOf().axes()[axisType] || [];

        return axes;
    }

    /**
     * This method is used to return a serialized representation of the instance's properties.
     *
     * @return {Object} Object with config proprties.
     * @memberof VisualGroup
     */
    serialize () {
        const store = this.store();

        return {
            [CONFIG]: store.get(CONFIG),
            [MOUNT]: store.get(MOUNT)
        };
    }

    /**
     *
     *
     * @param {*} facetKey
     * @return
     * @memberof VisualGroup
     */
    getDimensionMeasureMap (facetKey) {
        const fields = this.resolver().projections();
        const rowFacets = fields.rowFacets.map(d => `${d}`);
        const colFacets = fields.colFacets.map(d => `${d}`);
        const rowProjections = (fields.rowProjections && fields.rowProjections[0]) || [];
        const colProjections = (fields.colProjections && fields.colProjections[0]) || [];
        const dimensionMeasureMap = {};
        const rowMeasures = rowProjections.filter(d => d.type() === FieldType.MEASURE);
        const colMeasures = colProjections.filter(d => d.type() === FieldType.MEASURE);
        const units = this.getCellsByFacetKey(facetKey).map(d => d.valueOf());

        units.forEach((unit) => {
            const fieldsMeasures = unit._dimensionMeasureMap;
            for (const key in fieldsMeasures) {
                if ({}.hasOwnProperty.call(fieldsMeasures, key)) {
                    !dimensionMeasureMap[key] && (dimensionMeasureMap[key] = []);
                    dimensionMeasureMap[key] = [...new Set([...dimensionMeasureMap[key], ...fieldsMeasures[key]])];
                }
            }
        });
        rowFacets.forEach((e) => { dimensionMeasureMap[e] = rowMeasures.map(d => `${d}`); });
        colFacets.forEach((e) => { dimensionMeasureMap[e] = colMeasures.map(d => `${d}`); });
        return dimensionMeasureMap;
    }

    /**
     *
     *
     * @param {*} id
     * @return
     * @memberof VisualGroup
     */
    findUnitById (id) {
        return this.matrixInstance().value.findPlaceHolderById(id);
    }

    getGroupByData () {
        return this._groupedDataModel;
    }
}

export default VisualGroup;
