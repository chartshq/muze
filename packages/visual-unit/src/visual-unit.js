import { layerFactory } from '@chartshq/visual-layer';
import {
    setAttrs,
    CommonProps,
    getUniqueId,
    getQualifiedClassName,
    selectElement,
    transactor,
    Store,
    makeElement,
    registerListeners,
    generateGetterSetters,
    getDataModelFromIdentifiers,
    isSimpleObject,
    transposeArray,
    FieldType
} from 'muze-utils';
import { physicalActions, sideEffects, behaviouralActions, behaviourEffectMap } from '@chartshq/muze-firebolt';
import { actionBehaviourMap } from './firebolt/action-behaviour-map';
import {
    renderLayers,
    getNearestDimensionalValue,
    removeLayersBy,
    getLayersBy,
    getLayerFromDef,
    attachAxisToLayers,
    getLayerAxisIndex,
    createSideEffectGroup,
    getAdjustedDomain,
    resolveEncodingTransform
} from './helper';
import { renderGridLineLayers } from './helper/grid-lines';
import localOptions from './local-options';
import { listenerMap } from './listener-map';
import {
    primaryYAxisUpdated,
    primaryXAxisUpdated,
    secondaryXAxisUpdated,
    secondaryYAxisUpdated,
    DATADOMAIN,
    TIMEDIFFS
} from './enums/reactive-props';
import { PROPS } from './props';
import UnitFireBolt from './firebolt';
import './styles.scss';

const FORMAL_NAME = 'unit';

/**
 * Visual Unit is hierarchical component created by {@link VisualGroup}. This component accepts layer definitions
 * and creates concrete layer instances from them, binds data and attaches axis to them. It also retreives the domain
 * from the layers and unions them and sets them on corresponding axis instances. This also creates the parent svg
 * groups for all the layers and delegates the rendering to all the layers.
 *
 * @public
 * @module VisualUnit
 * @class
 */
export default class VisualUnit {

    /**
     * Creates instance of visualization unit.
     *
     * @param {Object} registry  Component registry
     * @param {Object} dependencies  Dependencies required by visual unit.
     */
    constructor (registry, dependencies) {
        this._id = getUniqueId();
        this._dependencies = dependencies;
        this._layerDeps = {
            throwback: new Store({
                onlayerdraw: false
            }),
            smartLabel: dependencies.smartLabel
        };
        this._renderedResolve = null;
        this._renderedPromise = new Promise((resolve) => {
            this._renderedResolve = resolve;
        });
        this._layerDeps.throwback.registerChangeListener([CommonProps.ON_LAYER_DRAW], () => {
            this._renderedResolve();
            this._lifeCycleManager.notify({ client: this.layers(), action: 'drawn', formalName: 'layer' });
        });

        this._lifeCycleManager = dependencies.lifeCycleManager;
        this._layersMap = {};
        this._gridlines = [];
        this._gridbands = [];
        this._layerAxisIndex = {};
        this._transformedDataModels = {};

        layerFactory.setLayerRegistry(registry.layerRegistry);
        generateGetterSetters(this, PROPS);
        this.cachedData([]);
        this.store(new Store({
            [primaryXAxisUpdated]: null,
            [primaryYAxisUpdated]: null,
            [secondaryXAxisUpdated]: null,
            [secondaryYAxisUpdated]: null
        }));
        transactor(this, localOptions, this.store().model);
        this.firebolt(new UnitFireBolt(this, {
            physical: physicalActions,
            behavioural: behaviouralActions,
            physicalBehaviouralMap: actionBehaviourMap
        }, sideEffects, behaviourEffectMap));
        registerListeners(this, listenerMap);
    }

    static formalName () {
        return FORMAL_NAME;
    }

    /**
     * Static helper for creates a unit instance
     *
     * @param {Object} [id] optional unique identifier for a unit; , id is calculated internally
     * @param {DataModel} data instance of datamodel
     * @param {Array.<Layer>} layers layer configuration
     * @param {Object} config configurtion for the visual unit
     * @return {VisualUnit} Instance of a unit
     */
    static create (...params) {
        return new this(...params);
    }

    /**
     * Returns the instance of firebolt associated with this visual unit. Firebolt dispatches the behavioural actions
     * when any physical action happens on the elements of visual unit.
     *
     * @public
     *
     * @return {Firebolt} Instance of firebolt.
     */
    firebolt (...firebolt) {
        if (firebolt.length) {
            this._firebolt = firebolt[0];
            return this;
        }
        return this._firebolt;
    }

    /**
     * Gets the domain for all axes of this visual unit.
     *
     * @return {Object} Domains of each data field.
     */
    getDataDomain () {
        return this.store().get(DATADOMAIN);
    }

    /**
     * Returns the unique id of this visual unit.
     *
     * @public
     * @return {string} Unique identifier.
     */
    id () {
        return this._id;
    }

    lockModel () {
        this._store.model.lock();
        return this;
    }

    unlockModel () {
        this._store.model.unlock();
        return this;
    }

    timeDiffsByField (...params) {
        if (params.length) {
            return this;
        }
        return this._timeDiffsByField;
    }

    /**
     * Renders the visual unit. It creates the layout and renders the axes and layers.
     *
     * @return {VisualUnit} Instance of visual unit.
     */
    render (container) {
        const config = this.config();
        const { className, defClassName, sideEffectClassName, classPrefix } = config;
        const qualifiedClassName = getQualifiedClassName(defClassName, this.id(), config.classPrefix);
        const width = this.width();
        const height = this.height();
        const containerSelection = selectElement(container).style('position', 'relative');

        this._rootSvg = makeElement(containerSelection, 'svg', [null], className)
                        .style('width', `${width}px`).style('height', `${height}px`);

        const node = this._rootSvg.node();
        setAttrs(node, {
            width,
            height,
            class: qualifiedClassName.join(' ')
        });
        renderGridLineLayers(this, node);
        renderLayers(this, node, this.layers(), {
            width,
            height
        });
        this._sideEffectGroup = createSideEffectGroup(node, `${classPrefix}-${sideEffectClassName}`);
        return this;
    }

    done () {
        return this._renderedPromise;
    }

    /**
     * Caches all the datamodels in an array from the next `data()` call on visual unit until `clearCaching()` or
     * `resetData()` is called on it.
     *
     * @public
     * @return {VisualUnit} Instance of visual unit.
     */

    enableCaching () {
        this._cache = true;
        return this;
    }

    /**
     * Clears all the previous cached data.
     *
     * @public
     * @segment VisualUnit
     * @return {VisualUnit} Instance of visual unit.
     */
    clearCaching () {
        this._cache = false;
        this.cachedData([this.cachedData()[0]]);
        return this;
    }

    /**
     * Returns the drawing information from visual unit.Drawing context contains the dimensions of unit and the svg
     * container of the visual unit.
     *
     * @public
     *
     * @return {Object} Drawing information.
     *      ```
     *          {
     *              htmlContainer: // Html container of svg container of the visual unit
     *              svgContainer: // Root svg container
     *              width: // Width of the visual unit
     *              height: // Height of the visual unit
     *              sideEffectGroup: // Svg group for drawing side effect elements.
     *              parentContainer: // Parent html container of the visual unit.
     *              xOffset: // x offset space from the starting x position of the container,
     *              yOffset: // y offset space from the starting y position of the container
     *          }
     *      ```
     */
    getDrawingContext () {
        const rootSvg = this._rootSvg && this._rootSvg.node();
        const width = this.width();
        const height = this.height();
        return {
            htmlContainer: this.mount(),
            svgContainer: rootSvg,
            width,
            height,
            sideEffectGroup: this._sideEffectGroup,
            parentContainer: this.parentContainer(),
            xOffset: 0,
            yOffset: 0
        };
    }

    /**
     * Returns the serialized configuration of visual unit.
     *
     * @return {Object} serialized configuration
     */
    serialize () {
        return {
            layers: this.layers().map(layer => layer.serialize()),
            config: this.config(),
            axes: this.store().get('axes').map(axis => axis.serialize())
        };
    }

    /**
     * Adds a new layer to the visual unit. It takes a layer definition and creates layer instances from them. It does
     * not render the layers. It returns the layer instances in an array. If the layer definition is a composite layer,
     * then multiple layer instances will be returned in the array.
     *
     * To add a layer in the unit,
     * ```
     *      unit.addLayer({
     *          name: 'bullet',
     *          mark: 'bar',
     *          encoding: {
     *              x: 'Year',
     *              y: 'Acceleration',
     *              color: 'Origin'
     *          }
     *      });
     * ```
     * @public
     * @param {Object} layerDef Definition of new layer.
     *
     * @return {Array} Array of layer instances.
     */
    addLayer (layerDef) {
        const layerName = layerDef.name;
        const layer = this.getLayerByName(layerName);
        const measurement = {
            width: this.width(),
            height: this.height()
        };

        if (layer) {
            return [layer];
        }
        const serializedDef = layerFactory.getSerializedConf(layerDef.mark, layerDef);
        const instances = Object.values(getLayerFromDef(this, serializedDef));
        this.layers().push(...instances);
        const layerAxisIndex = getLayerAxisIndex(instances, this.fields());
        this._layerAxisIndex = Object.assign(this._layerAxisIndex, layerAxisIndex);
        attachAxisToLayers(this.axes(), instances, layerAxisIndex);
        const store = { unit: this, layers: {} };
        this.layers().forEach((inst) => {
            store.layers[inst.alias()] = inst;
        });
        instances.forEach((lyr) => {
            resolveEncodingTransform(lyr, store);
            lyr.measurement(measurement);
            lyr.dataProps({
                timeDiffs: this.store().get(TIMEDIFFS)
            });
        });
        return instances;
    }

    /**
     *
     *
     *
     * @memberof VisualUnit
     */
    remove () {
        const lifeCycleManager = this._dependencies.lifeCycleManager;
        lifeCycleManager.notify({ client: this, action: 'beforeremove', formalName: 'unit' });
        this.store().unsubscribeAll();
        selectElement(this.mount()).remove();
        this.firebolt().remove();
        // Remove layers
        lifeCycleManager.notify({ client: this.layers(), action: 'beforeremove', formalName: 'layer' });
        this.layers().forEach(layer => layer.remove());
        lifeCycleManager.notify({ client: this.layers(), action: 'removed', formalName: 'layer' });
        lifeCycleManager.notify({ client: this, action: 'removed', formalName: 'unit' });
        return this;
    }

    /**
     *
     *
     * @param {*} identifiers
     *
     * @memberof VisualUnit
     */
    getDataModelFromIdentifiers (identifiers, mode, parentModel) {
        if (identifiers === null) {
            return null;
        }
        const dataModel = parentModel || this.data();
        return getDataModelFromIdentifiers(dataModel, identifiers, mode);
    }

    /**
     * Resets the data of visual unit to original data model. It also clears the cached data.
     *
     * @public
     * @segment VisualUnit
     * @return {VisualUnit} Instance of visual unit.
     */
    resetData () {
        this.data(this.cachedData()[0]);
        return this;
    }

    /**
     *
     *
     *
     * @memberof VisualUnit
     */
    getSourceInfo () {
        return {
            dimensionMeasureMap: this._dimensionMeasureMap,
            fields: this.fields(),
            data: this.data(),
            axes: this.axes()
        };
    }

    /**
     *
     *
     *
     * @memberof VisualUnit
     */
    getDefaultTargetContainer () {
        const { classPrefix, defClassName } = this.config();
        return [`.${classPrefix}-${defClassName}`];
    }

    /**
     * Returns an array of layer instances which matches the supplied mark type.
     *
     * @public
     *
     * @param {string} type Mark type of layer.
     *
     * @return {Array} Array of layer instances.
     */
    getLayersByType (type) {
        const layers = getLayersBy(this.layers(), 'type', type);
        return layers;
    }

    /**
     * Returns the layer instance which matches the supplied layer name. If no layer is found, then it returns
     * undefined.
     *
     * @public
     * @param {string} name Name of layer.
     *
     * @return {VisualUnit} Layer instance.
     */
    getLayerByName (name) {
        const layers = getLayersBy(this.layers(), 'name', name);
        return layers[0];
    }

    /**
     *
     *
     * @param {*} domain
     *
     * @memberof VisualUnit
     */
    updateAxisDomain (domain) {
        ['x', 'y'].forEach((type) => {
            const axes = this.axes()[type];
            let min = [];
            let max = [];
            let dom;
            axes && axes.forEach((axis, i) => {
                const field = this.fields()[type][i];
                dom = domain[`${this.fields()[type][i]}`];

                if (field.type() !== FieldType.DIMENSION && dom) {
                    min[i] = dom[0];
                    max[i] = dom[1];
                }
            });
            if (axes) {
                if (axes.length > 1) {
                    const axisConf = axes[0].config();
                    if (axes[0].constructor.type() === 'linear') {
                        if (axisConf.alignZeroLine) {
                            axes.forEach(axis => axis.config({
                                nice: false
                            }));
                            const adjustedDomain = getAdjustedDomain(max, min);
                            min = adjustedDomain.min;
                            max = adjustedDomain.max;
                        }

                        axes[0].updateDomainCache([min[0], max[0]]);
                        axes[1].updateDomainCache([min[1], max[1]]);
                    } else {
                        axes[0].updateDomainCache(dom);
                        axes[1].updateDomainCache(dom);
                    }
                } else {
                    axes[0].updateDomainCache(dom);
                }
            }
        });
        return this;
    }

    /**
     * Returns the point located nearest to the supplied x and y position. It returns the unique identifiers of the
     * point. This function also accepts an additional configuration `getAllPoints` inside `config` object in the third
     * argument which if set to true, then it returns the identifiers of all the points which falls on the nearest
     * x value or y value if any one of the field is a dimension. Additionally, a target property is also returned
     * which contains the identifier of the nearest point. If no nearest point is found, then it returns identifier
     * as null.
     *
     * @public
     *
     * @param {number} x X Position of the point from where nearest point is to be found.
     * @param {number} y Y Position of the point from where nearest point is to be found.
     * @param {Object} config Additional configuration options.
     * @param {boolean} config.getAllPoints If true, then returns all the points nearest to the x value or y value if
     * it is dimension.
     * @param {Object} config.data Data associated with the nearest point.
     * @return {Object} Nearest point information
     * ```
     *      {
     *          id: [['Origin'], ['USA'], ['Japan']], // Identifiers of all the points closest to the x value.
     *          target: [['Origin'], ['Japan']] // Identifier of the nearest point.
     *      }
     * ```
     */
    getNearestPoint (x, y, config) {
        let pointObj = {
            id: null
        };
        const dimValue = getNearestDimensionalValue(this, {
            x,
            y
        });

        if (dimValue !== null && config.getAllPoints) {
            pointObj.id = dimValue;
            const pointInf = this.getMarkInfFromLayers(x, y, config);
            pointObj.target = pointInf && pointInf.id ? pointInf.id : pointObj.id;
            return pointObj;
        }

        const markInf = this.getMarkInfFromLayers(x, y, config) || { id: null };
        pointObj = Object.assign({}, markInf);

        pointObj.target = markInf.id;
        return pointObj;
    }

    getMarkInfFromLayers (x, y, args) {
        const layers = this.layers();
        const len = layers.length;
        let point = null;
        // Iterate through the layers array and fetch the nearest point from each layer. If a valid
        // nearest point is found from any layer, then return that point.
        for (let i = 0; i < len; i++) {
            const layer = layers[i];
            const config = layer.config();
            if (config.interactive !== false) {
                point = layer.getNearestPoint(x, y, args);
            }
            if (point) {
                return point;
            }
        }
        return point;
    }

    /**
     * Get the information of all the marks such as x, y position and size from supplied identifiers. It
     * returns an array of points whose data matches the given identifiers.
     *
     * @public
     *
     * @param {Array|Object} identifiers Field names and their corresponding values.
     * ```
     * identifiers can be given in an array of array,
     *      ['Origin', 'Name'], // Names of the fields supplied in first array
     *      ['USA', 'ford'], // Data values of each field supplied in rest of the arrays.
     *      ['Japan', 'ford']
     * or in an object,
     *      {
     *          Origin: ['USA']
     *      }
     * ```
     * @param {Object} config Optional configurations which decides which information of the mark will
     * be retrieved.
     * @param {boolean} [config.getAllAttrs = false] If true, then returns all the information of each mark.
     * @param {boolean} [config.getBBox = false] If true, then returns the bounding box of each mark.
     *
     * @return {Array} Array of objects containing the information of each point.
     * ```
     * By default, the method returns the array of points in this structure,
     *      [
     *          {
     *              x: 20,
     *              y: 100,
     *              width: 200,
     *              height: 100
     *          }
     *      ]
     * If 'config.getAllAttrs' is true, then it returns all the information of each mark,
     *      [
     *      // Positions of mark on initial state of transition.
     *          enter: {
     *              x: 0,
     *              y: 0
     *          },
     *          // Final positions of the mark
     *          update: {
     *              x: 20,
     *              y: 10
     *          },
     *          style: // css styles of each mark
     *          source: [200, 'USA'] // Row information of each mark
     *          id: 20 // Row id of each mark
     *      ]
     * ```
     */
    getPlotPointsFromIdentifiers (identifiers, config = {}) {
        let points = [];
        let parsedIdentifiers = identifiers;
        if (identifiers === null) {
            return [];
        }
        const layers = this.layers();
        const len = layers.length;
        if (isSimpleObject(identifiers)) {
            parsedIdentifiers = [Object.keys(identifiers)];
            parsedIdentifiers = [...parsedIdentifiers, ...transposeArray(Object.values(identifiers))];
        }
        for (let i = 0; i < len; i++) {
            const layer = layers[i];
            if (layer.config().interactive !== false) {
                points = [...points, ...layer.getPointsFromIdentifiers(parsedIdentifiers, config)];
            }
        }
        return points;
    }

    /**
     * Removes the layer instance which matches the supplied layer name.
     *
     * @public
     * @param {string} name Name of layer
     *
     * @return {VisualUnit} Instance of visual unit.
     */
    removeLayerByName (name) {
        removeLayersBy('name', name);
        return this;
    }

    /**
     * Removes all the layer instances which matches the supplied mark type.
     *
     * @public
     * @param {string} type Mark type of layer.
     *
     * @return {VisualUnit} Instance of visual unit.
     */
    removeLayersByType (type) {
        removeLayersBy('type', type);
        return this;
    }

    parentContainer (...container) {
        if (container.length) {
            this._parentContainer = container[0];

            return this;
        }
        return this._parentContainer;
    }
}
