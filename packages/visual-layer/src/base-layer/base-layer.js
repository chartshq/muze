import {
    getUniqueId,
    mergeRecursive,
    Store,
    FieldType,
    selectElement,
    ReservedFields,
    registerListeners,
    transactor
} from 'muze-utils';
import { SimpleLayer } from '../simple-layer';
import * as PROPS from '../enums/props';
import {
    transformData, calculateDomainFromData, getNormalizedData, fadeUnfadeSelection, focusUnfocusSelection
} from '../helpers';
import { listenerMap } from './listener-map';
import { defaultOptions } from './default-options';

/**
 * Base Layer class is an abstract class which has all the common functionalities
 * of all layers. Every layer class should extend this class and overrride the necessary
 * methods. This class needs to be passed axes, configuration and data model.
 *
 * @example
 * class BarLayer extends BaseLayer {
 *   update (params) {
 *       // super.update(params);
 *       // Update the bar layer
 *   }
 * }
 * @class
 */
export default class BaseLayer extends SimpleLayer {

    /**
     * Creates a layer
     * @param {DataModel} data Instance of datamodel
     * @param {Object} axes Axes instances
     * @param {Object} config Configuration of the layer
     * @param {Object} dependencies Dependencies of the layer
     */
    constructor (data, axes, config, dependencies) {
        super();
        this.store(new Store({
            DATA: null
        }));
        transactor(this, defaultOptions, this.store().model);
        this.data(data);
        this.axes(axes);
        this.config(config);
        this.dependencies(dependencies);
        this._points = [];
        this._cachedData = [];
        this._id = getUniqueId();
        this._measurement = {};
        registerListeners(this, listenerMap);
    }

    /**
     * Creates a layer instance
     * @return {BaseLayer} Instance of a layer
     */
    static create (...params) {
        return new this(...params);
    }

    /**
     * Default configuration of the layer
     * @return {Object} Default configuration
     */
    static defaultConfig () {
        return {
            transform: {
                type: 'identity'
            }
        };
    }

    /**
     * Default policy merges the user configuration with the given configuration
     * @param {Object} conf Configuration of layer
     * @param {Object} userConf Configuration given by the user
     * @return {Object} merged configuration of user config and layer config
     */
    static defaultPolicy (conf, userConf) {
        return mergeRecursive(conf, userConf);
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof BaseLayer
     */
    static formalName () {
        return 'base';
    }

    /**
     *
     *
     * @readonly
     * @memberof BaseLayer
     */
    store (...store) {
        if (store.length) {
            this._store = store[0];
            return this;
        }
        return this._store;
    }

    encodingFieldsInf (...fieldsInf) {
        if (fieldsInf.length) {
            this._encodingFieldsInf = fieldsInf[0];
            return this;
        }
        return this._encodingFieldsInf;
    }

    /**
     *
     *
     * @param {*} params
     * @returns
     * @memberof BaseLayer
     */
    alias (...params) {
        if (params.length) {
            this._alias = params[0];
            return this;
        }
        return this._alias || this.constructor.formalName();
    }

    /**
     * Sets or gets the dependencies.
     * @param {Object} dependencies Dependencies needed by layer
     * @return {BaseLayer} Instance of base layer.
     */
    dependencies (...params) {
        if (params.length) {
            this._dependencies = params[0];
            return this;
        }
        return this._dependencies;
    }

    /**
     *
     *
     * @returns
     * @memberof BaseLayer
     */
    enableCaching () {
        this._cacheEnabled = true;
        return this;
    }

    /**
     *
     *
     * @memberof BaseLayer
     */
    clearCaching () {
        this._cacheEnabled = false;
        return this.data(this._cachedData[0]);
    }

    /**
     * Returns a serialized schema of the layer
     * @return {Object} Serialized schema
     */
    serialize () {
        return this.config();
    }

    /**
     * Returns the unique identifier of this layer
     * @return {string} id of the layer
     */
    id () {
        return this._id;
    }

    /**
     * Gets the transform method from transform factory based on type of transform. It then calls the
     * transform method with the data and passes the configuration parameters of transform such as
     * groupBy, value field, etc.
     *
     * @param {DataModel} dataModel Instance of dataModel
     * @param {Object} config configuration for transforming data
     * @return {Array.<Array>} Transformed data.
     * @private
     */
    getTransformedData (dataModel, config, transformType, encodingFieldsInf) {
        return transformData(dataModel, config, transformType, encodingFieldsInf);
    }

    /**
     * Calculates the domain from the data.
     * It checks the type of field and calculates the domain based on that. For example, if it
     * is a quantitative or temporal field, then it calculates the min and max from the data or
     * if it is a nominal field then it gets all the values from the data of that field.
     * @param {Array} data DataArray
     * @param {Object} fieldsConfig Configuration of fields
     * @return {Array} Domain values array.
     */
    calculateDomainFromData (data) {
        let domains = {};
        const isEmpty = this.data().isEmpty();
        if (!isEmpty) {
            domains = calculateDomainFromData(data, this.encodingFieldsInf(), this.transformType());
        } return domains;
    }

    shouldDrawAnchors () {
        return false;
    }

    /**
     * Returns the domain for the axis.
     *
     * @param {string} encodingType type of encoding x, y, etc.
     * @return {Object} Axis domains
     */
    getDataDomain (encodingType) {
        const domains = this.store().get(PROPS.DOMAIN);
        return encodingType !== undefined ? domains[encodingType] || [] : domains;
    }

    /**
     * Returns the domain for the axis.
     *
     * @param {string} encodingType type of encoding x, y, etc.
     * @return {Object} Axis domains
     */
    getNormalizedData (transformedData, fieldsConfig) {
        return getNormalizedData(transformedData, fieldsConfig, this.encodingFieldsInf(), this.transformType());
    }

    /**
     * Abstract method for getting nearest point
     * @return {BaseLayer} Instance of base layer
     */
    getNearestPoint () {
        return null;
    }

    /**
     * Applies selection styles to the elements that fall within the selection set.
     * @param {Array} selectionSet Array of tuple ids.
     * @param {Object} config Configuration for selection.
     * @return {BarLayer} Instance of bar layer.
     */
    highlightPoint (selectionSet, config = {}) {
        const elements = this.getPlotElementsFromSet(selectionSet);
        const axes = this.axes();
        const colorAxis = axes.color;
        const highlightStyles = config.interaction ? config.interaction.highlight : this.config().interaction.highlight;
        highlightStyles.forEach((highlight) => {
            elements.style(highlight.type, (d) => {
                d.meta.colorTransform.highlight = d.meta.colorTransform.highlight || {};
                let fillColorInfo = colorAxis.transformColor(d.meta.stateColor, highlight.intensity);
                d.meta.colorTransform.highlight[highlight.type] = highlight.intensity;
                d.meta.stateColor = fillColorInfo.hsla;
                return fillColorInfo.color;
            });
        });
        return this;
    }

    /**
     * Removes selection styles to the elements that fall within the selection set.
     * @param {Array} selectionSet Array of tuple ids.
     * @param {Object} config Configuration for selection.
     * @return {BarLayer} Instance of bar layer.
     */
    dehighlightPoint (selectionSet, config = {}) {
        const elements = this.getPlotElementsFromSet(selectionSet);
        const axes = this.axes();
        const colorAxis = axes.color;
        const highlightStyles = config.interaction ? config.interaction.highlight : this.config().interaction.highlight;
        highlightStyles.forEach((highlight) => {
            elements.style(highlight.type, (d) => {
                d.meta.colorTransform.highlight = d.meta.colorTransform.highlight || {};
                if (d.meta.colorTransform.highlight && d.meta.colorTransform.highlight[highlight.type]) {
                    let fillColorInfo = colorAxis.transformColor(d.meta.stateColor, highlight.intensity.map(e => -e));
                    d.meta.stateColor = fillColorInfo.hsla;
                    d.meta.colorTransform.highlight[highlight.type] = null;
                    return fillColorInfo.color;
                }
                d.meta.colorTransform.highlight = null;
                const [h, s, l] = d.meta.stateColor;
                return `hsl(${h * 360},${s * 100}%,${l * 100}%)`;
            });
        });
        return this;
    }

    /**
     * Removes selection styles to the elements that fall within the selection set.
     * @param {Array} selectionSet Array of tuple ids.
     * @param {Object} config Configuration for selection.
     * @return {BarLayer} Instance of bar layer.
     */
    focusOutSelection (selectionSet, config = {}) {
        const interaction = config.interaction || this.config().interaction;
        focusUnfocusSelection(this, selectionSet, true, interaction);
        return this;
    }

    /**
     * Removes selection styles to the elements that fall within the selection set.
     * @param {Array} selectionSet Array of tuple ids.
     * @param {Object} config Configuration for selection.
     * @return {BarLayer} Instance of bar layer.
     */
    focusSelection (selectionSet, config = {}) {
        const interaction = config.interaction || this.config().interaction;
        focusUnfocusSelection(this, selectionSet, false, interaction);
        return this;
    }

    /**
     *
     *
     * @param {*} selectionSet
     * @param {*} [config={}]
     * @returns
     * @memberof BaseLayer
     */
    fadeOutSelection (selectionSet, config = {}) {
        const interaction = config.interaction || this.config().interaction;
        fadeUnfadeSelection(this, selectionSet, true, interaction);
        return this;
    }

    /**
     *
     *
     * @param {*} selectionSet
     * @param {*} [config={}]
     * @returns
     * @memberof BaseLayer
     */
    unfadeSelection (selectionSet, config = {}) {
        const interaction = config.interaction || this.config().interaction;
        fadeUnfadeSelection(this, selectionSet, false, interaction);
        return this;
    }

    /**
     *
     *
     * @param {*} params
     * @returns
     * @memberof BaseLayer
     */
    linkLayerStore (...params) {
        if (params.length) {
            this._linkedLayerStore = params[0];
            return this;
        }
        return this._linkedLayerStore;
    }

    /**
     *
     *
     * @returns
     * @memberof BaseLayer
     */
    transformType (...transformType) {
        if (transformType.length) {
            this._transformType = transformType[0];
            return this;
        }
        return this._transformType;
    }

    /**
     * Renders the layer
     * @return {BaseLayer} Instance of the layer.
     */
    render () {
        return this;
    }

    /**
     *
     *
     * @returns
     * @memberof BaseLayer
     */
    elemType () {
        return 'g';
    }

    /**
     * Disposes the entire layer
     * @return {BaseLayer} Instance of layer.
     */
    remove () {
        this.store().unsubscribeAll();
        selectElement(this.mount()).remove();
        return this;
    }

    /**
     * Stores point in an object with key as the categorical value or temporal value
     *
     * @param {string} key categorical value or temporal value
     * @param {Object} data Information of the data point
     * @return {BarLayer} Instance of bar layer
     */
    cachePoint (key, data) {
        if (key === null) {
            return this;
        }
        const pointMap = this._pointMap;
        !pointMap[key] && (pointMap[key] = []);
        pointMap[key].push(data);
        return this;
    }

    /**
     *
     *
     * @param {*} dataProps
     * @returns
     * @memberof BaseLayer
     */
    dataProps (...dataProps) {
        if (dataProps.length) {
            this._dataProps = dataProps[0];
            return this;
        }
        return this._dataProps;
    }

    /**
     *
     *
     * @param {*} data
     * @param {*} id
     * @returns
     * @memberof BaseLayer
     */
    getIdentifiersFromData (data) {
        const schema = this.data().getData().schema;
        const fieldsConfig = this.data().getFieldsConfig();
        const identifiers = [[], []];
        const {
                xFieldType,
                yFieldType,
                xField,
                yField
            } = this.encodingFieldsInf();

        const [xMeasure, yMeasure] = [xFieldType, yFieldType].map(type => type === FieldType.MEASURE);
        schema.forEach((d, i) => {
            let name = d.name;
            if (fieldsConfig[name].def.type === FieldType.DIMENSION) {
                identifiers[0].push(name);
                identifiers[1].push(data[i]);
            }
        });

        if (xMeasure && yMeasure) {
            const xMeasureIndex = fieldsConfig[xField].index;
            const yMeasureIndex = fieldsConfig[yField].index;
            identifiers[0].push(...[xField, yField]);
            identifiers[1].push(...[data[xMeasureIndex], data[yMeasureIndex]]);
        }
        return identifiers;
    }

    getPlotSpan () {
        return {
            x: 0,
            y: 0
        };
    }

    getPlotPadding () {
        return {
            x: 0,
            y: 0
        };
    }

    /**
     *
     *
     * @param {*} identifiers
     * @returns
     * @memberof BaseLayer
     */
    getPointsFromIdentifiers (identifiers, getAllAttrs) {
        if (!this.data()) {
            return [];
        }
        const fieldNames = identifiers[0];
        const values = identifiers.slice(1, identifiers.length);
        const points = this._points;
        const fieldsConfig = this.data().getFieldsConfig();

        const filteredPoints = [].concat(...points).filter((point) => {
            const { _data, _id } = point;

            return fieldNames.every((field, idx) => {
                if (field in fieldsConfig) {
                    return values.findIndex(d => d[idx] === _data[fieldsConfig[field].index]) !== -1;
                } else if (field === ReservedFields.ROW_ID) {
                    return values.findIndex(d => d[idx] === _id) !== -1;
                } return false;
            });
        });
        return getAllAttrs ? filteredPoints : filteredPoints.map(d => d.update || d).sort((a, b) => a.y - b.y);
    }

    /**
     *
     *
     * @param {*} set
     * @returns
     * @memberof BaseLayer
     */
    getPlotElementsFromSet (set) {
        return selectElement(this.mount()).selectAll(this.elemType()).filter(data => set.indexOf(data._id) !== -1);
    }
}
