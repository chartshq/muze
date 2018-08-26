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
    transformData,
    calculateDomainFromData,
    getNormalizedData,
    applyInteractionStyle
} from '../helpers';
import { listenerMap } from './listener-map';
import { defaultOptions } from './default-options';

/**
 * An abstract class which gives defination of common layer functionality like
 * - transfromation data for various {@link mode}
 * - calculating data domain
 * - linking dependent layers
 * - merging policy of configuration
 * - interaction sideffect helpers
 * - retrieving dom elements from data using id
 * - retrieving the physical dimensions of marks
 * - disposing layer
 *
 * Every layer has to extend base layer and give concrete definition.
 * This layer does not have any default visual. A new layer has to define the logic of `render` for rendering the
 * visuals
 *
 * @public
 * @class
 * @namespace Muze
 */
export default class BaseLayer extends SimpleLayer {

    /**
     * Creates a layer using a configuration and data.
     *
     * @public
     *
     * @param {DataModel} data Instance of DataModel to be used. This DataModel instance serves as the data for a layer.
     * @param {Object} axes Axes instances to be used for rendering the layer. Axes are used for mapping data from
     *      value to px.
     * @param {SimpleAxis} axes.x X axis of the layer. Based on the type of variable it gets instance of BandAxis,
     *      TimeAxis, ContinuousAxis
     * @param {SimpleAxis} axes.y X axis of the layer. Based on the type of variable it gets instance of BandAxis,
     *      TimeAxis, ContinuousAxis
     * @param {ColorAxis} axes.color Axis for coloring a layer using color interpolators
     * @param {ShapeAxis} axes.shape Axis for providing a shape
     * @param {SizeAxis} axes.shape Axis for determining size of a mark using size interpolator
     * @param {LayerConfig} config Configuration of the layer
     * @param {Object} dependencies Dependencies of the layer
     * @param {SmartLabel} smartLabel Smartlabel singleton instance
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
        this.alias(this.constructor.formalName() + getUniqueId());
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
     * Default configuration of the layer. This configuration gets merged to the user passed configuration using a
     * plolicy. Base layer only returns part of configuraion, any layer overridding base layer should return its own
     * configuration.
     *
     * @public
     * @static
     *
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
     * Policy defines how user config gets merged to default config. The default policy here does a deep copy
     * operation.
     * Any policy which does more than deep copying should define the policy as a static member.
     *
     * @static
     * @public
     *
     * @param {LayerConfig} conf Configuration with which the user config will be merged
     * @param {LayerConfig} userConf Configuration given by the user
     *
     * @return {LayerConfig} Merged layer configuration
     */
    static defaultPolicy (conf, userConf) {
        return mergeRecursive(conf, userConf);
    }

    /**
     * Determines a name for a layer. This name of the layer is used in the input data to refer to this layer.
     * ```
     *  .layer([
     *      mark: 'bar',
     *      encoding: { ... }
     *  ])
     * ```
     *
     * @static
     * @public
     *
     * @returns {string} name of layer
     */
    static formalName () {
        return 'base';
    }

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

    encodingTransform (...encodingTransform) {
        if (encodingTransform.length) {
            this._encodingTransform = encodingTransform[0];
            return this;
        }
        return this._encodingTransform;
    }

    /**
     * Provides a alias for a layer. Like it's possible to have same layer (like bar) multiple times, but among multiple
     * layers of same type if one layer has to be referred, alias is used. If no alias is given then `formalName` is set
     * as the alias name.
     *
     * @public
     *
     * If used as setter
     * @param  {string} alias Name of the alias
     * @return {BaseLayer} Instance of current base layer
     *
     * If used as getter
     * @return {string} Alias of the current layer
     */
    alias (...params) {
        if (params.length) {
            this._alias = params[0];
            return this;
        }
        return this._alias || this.constructor.formalName();
    }

    dependencies (...params) {
        if (params.length) {
            this._dependencies = params[0];
            return this;
        }
        return this._dependencies;
    }

    enableCaching () {
        this._cacheEnabled = true;
        return this;
    }

    clearCaching () {
        this._cacheEnabled = false;
        return this.data(this._cachedData[0]);
    }

    /**
     * Serialize the schema. Merge config is used for serialization.
     *
     * @public
     *
     * @return {LayerConfig} Serialized schema
     */
    serialize () {
        return this.config();
    }

    /**
     * Returns the unique identifier of this layer. Id is auto generated during the creation proceess of a schema.
     *
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
     * @public
     *
     * @param {DataModel} dataModel Instance of DataModel
     * @param {Object} config Configuration for transforming data
     * @return {Array.<Array>} Transformed data.
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
        }
        return domains;
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

    applyInteractionStyle (interactionType, selectionSet, apply) {
        const interactionConfig = this.config().interaction || {};

        const interactionStyles = interactionConfig[interactionType];
        if (interactionStyles) {
            applyInteractionStyle(this, selectionSet, interactionStyles, {
                apply,
                interactionType
            });
        }
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
            const name = d.name;
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
        return getAllAttrs ? filteredPoints : filteredPoints.map((d) => {
            const attrs = d.update || d;
            if (!attrs.width) {
                attrs.width = 2;
            }
            if (!attrs.height) {
                attrs.height = 2;
            }
            return attrs;
        }).sort((a, b) => a.y - b.y);
    }

    getTransformedDataFromIdentifiers (identifiers) {
        const normalizedData = this.store().get(PROPS.NORMALIZED_DATA);
        const fieldsConfig = this.data().getFieldsConfig();
        const {
            yField,
            xField,
            yFieldType,
            xFieldType
        } = this.encodingFieldsInf();
        let measureIndex;
        let enc;
        if (xFieldType === FieldType.MEASURE) {
            measureIndex = fieldsConfig[xField].index;
            enc = 'x';
        } else if (yFieldType === FieldType.MEASURE) {
            measureIndex = fieldsConfig[yField].index;
            enc = 'y';
        }

        const transformedData = [];
        normalizedData.forEach((dataArr) => {
            dataArr.forEach((dataObj) => {
                const id = dataObj._id;
                if (identifiers.indexOf(id) !== -1) {
                    const transformedVal = dataObj[enc];
                    const row = dataObj._data;
                    const tuple = {};
                    for (const key in fieldsConfig) {
                        const index = fieldsConfig[key].index;
                        tuple[key] = row[index];
                        if (index === measureIndex) {
                            tuple[key] = transformedVal;
                        }
                    }
                    transformedData.push(tuple);
                }
            });
        });

        return [transformedData, this.data().getData().schema];
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
