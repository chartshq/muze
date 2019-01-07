import {
    getUniqueId,
    mergeRecursive,
    FieldType,
    selectElement,
    ReservedFields,
    registerListeners,
    transactor,
    DataModel,
    clone,
    generateGetterSetters,
    STATE_NAMESPACES
} from 'muze-utils';
import { SimpleLayer } from '../simple-layer';
import * as PROPS from '../enums/props';
import { props } from './props';
import {
    transformData,
    calculateDomainFromData,
    getNormalizedData,
    applyInteractionStyle,
    initializeGlobalState
} from '../helpers';
import { listenerMap } from './listener-map';
import { defaultOptions } from './default-options';

/**
 * An abstract class which gives definition of common layer functionality like
 * - transforming data for various modes. Supported modes: identity, group and stack.
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
 * @module BaseLayer
 */
export default class BaseLayer extends SimpleLayer {

    /**
     * Creates a layer using a configuration and data.
     *
     * @public
     * @constructor
     * @param {DataModel} data Instance of DataModel to be used. This DataModel instance serves as the data for a layer.
     * @param {Object} axes Axes instances to be used for rendering the layer. Axes are used for mapping data from
     *      value to px.
     * @param {SimpleAxis} axes.x X axis of the layer. Based on the type of variable it gets instance of BandAxis,
     *      TimeAxis, ContinuousAxis
     * @param {SimpleAxis} axes.y X axis of the layer. Based on the type of variable it gets instance of BandAxis,
     *      TimeAxis, ContinuousAxis
     * @param {ColorAxis} axes.color Axis for coloring a layer using color interpolators
     * @param {ShapeAxis} axes.shape Axis for providing a shape
     * @param {SizeAxis} axes.size Axis for determining size of a mark using size interpolator
     * @param {LayerConfig} config Configuration of the layer
     * @param {Object} dependencies Dependencies of the layer
     * @param {SmartLabel} dependencies.smartLabel Smartlabel singleton instance
     */
    constructor (data, axes, config, dependencies = {}) {
        super();

        generateGetterSetters(this, props);
        this.data(data);
        this.axes(axes);
        this.config(config);
        this.alias(this.constructor.formalName() + getUniqueId());
        this.dependencies(dependencies);
        this._points = [];
        this._cachedData = [];
        this._id = getUniqueId();
        this._measurement = {};
        this._animationDonePromises = [];
    }

    static getState () {
        return [
            {
                domain: {}
            },
            {
                config: {},
                data: {}
            }
        ];
    }

    store (...params) {
        if (params.length) {
            this._store = params[0];
            const metaInf = this.metaInf();
            const localNs = `${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}.${metaInf.namespace}`;
            initializeGlobalState(this);
            const store = this.store();
            store.append(`${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}`, {
                [metaInf.namespace]: null
            });

            transactor(this, defaultOptions, store.model, {
                namespace: localNs
            });
            registerListeners(this, listenerMap, {
                local: localNs,
                global: STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE
            }, {
                unitRowIndex: metaInf.unitRowIndex,
                unitColIndex: metaInf.unitColIndex
            });
            return this;
        }
        return this._store;
    }

    domain (...dom) {
        const prop = `${STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE}.${PROPS.DOMAIN}.${this.metaInf().namespace}`;
        if (dom.length) {
            this.store().commit(prop, dom[0]);
            return this;
        }
        return this.store().get(prop);
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
     *  .layers([
     *      mark: 'bar',
     *      encoding: { ... }
     *  ])
     * ```
     *
     * @static
     * @public
     *
     * @return {string} name of layer
     */
    static formalName () {
        return 'base';
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
     *
     * If used as setter
     * @param  {string} alias Name of the alias
     * @return {BaseLayer} Instance of current base layer
     *
     * If used as getter
     * @return {string} Alias of the current layer
     *
     * @public
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
     * @public
     *
     * @return {string} id of the layer
     */
    id () {
        return this._id;
    }

    /**
     * Returns the transformed data based on given transform type.
     * It first gets the transform method from transform factory based on type of transform. It then calls the
     * transform method with the data and passes the configuration parameters of transform such as
     * groupBy, value field, etc.
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
     * if it is a categorical field then it gets all the values from the data of that field.
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

    static shouldDrawAnchors () {
        return false;
    }

    /**
     * Returns the domain for the axis.
     *
     * @param {string} encodingType type of encoding x, y, etc.
     * @return {Object} Axis domains
     */
    getDataDomain (encodingType) {
        const domains = this.store()
            .get(`${STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE}.${PROPS.DOMAIN}.${this.metaInf().namespace}`);
        return encodingType !== undefined ? domains[encodingType] || [] : domains;
    }

    /**
     * Normalizes the transformed data and returns it.
     *
     * @param {string} encodingType type of encoding x, y, etc.
     * @return {Object} Axis domains
     */
    getNormalizedData (transformedData, fieldsConfig) {
        return getNormalizedData(transformedData, fieldsConfig, this.encodingFieldsInf(), this.transformType());
    }

    /**
     * Gets the nearest point closest to the given x and y coordinate. If no nearest point is found, then it returns
     * null.
     *
     * @public
     *
     * @param {number} x X Coordinate.
     * @param {number} y Y Coordinate.
     *
     * @return {Object} Information of the nearest point.
     * ```
     *      {
     *          // id property contains the field names and their corresponding values in a 2d array. This is the data
     *          // associated with the nearest point.
     *          id: // Example data: [['Origin'], ['USA']],
     *          dimensions: // Physical dimensions of the point.
     *          layerId: // Id of the layer instance.
     *      }
     * ```
     */
    getNearestPoint () {
        return null;
    }

    applyInteractionStyle (interactionType, selectionSet, apply, styles) {
        const interactionConfig = this.config().interaction || {};

        let interactionStyles = interactionConfig[interactionType];
        interactionStyles = styles || interactionStyles;
        if (interactionStyles) {
            applyInteractionStyle(this, selectionSet, interactionStyles, {
                apply,
                interactionType
            });
        }
    }

    disableUpdate () {
        this._updateLock = true;
        return this;
    }

    enableUpdate () {
        this._updateLock = false;
        return this;
    }
    /**
     *
     *
     *
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
     *
     * @memberof BaseLayer
     */
    elemType () {
        return 'g';
    }

    /**
     * Disposes the entire layer.
     *
     * @return {BaseLayer} Instance of layer.
     */
    remove () {
        this.store().unsubscribe({
            namespace: `${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}.${this.metaInf().namespace}`
        });
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
     *
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
     *
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
     * Returns the information of the marks corresponding to the supplied identifiers. Identifiers are a set of field
     * names and their corresponding values in an array. It can also be an instance of datamodel.
     *
     * For example,
     * ```
     *  const identifiers = [
     *      ['Origin', 'Cylinders'],
     *      ['USA', '8']
     *  ];
     *  const points = barLayer.getPointsFromIdentifiers(identifiers);
     * ```
     * @public
     * @param {Array|DataModel} identifiers Identifiers of the marks.
     * @param {Object} config Optional configuration which describes how to get the information.
     * @param {boolean} config.getAllAttrs If true, then returns all the information of the points, else returns only
     * the positions of the points.
     * @param {boolean} config.getBBox If true, then returns the bounding box of all the marks.
     *
     * @return {Array} Array of points contains
     */
    getPointsFromIdentifiers (identifiers, config = {}) {
        const getAllAttrs = config.getAllAttrs;
        const getBBox = config.getBBox;
        if (!this.data()) {
            return [];
        }
        let fieldNames;
        let values;
        if (identifiers instanceof DataModel) {
            const dataObj = identifiers.getData();
            fieldNames = dataObj.schema.map(d => d.name);
            values = dataObj.data;
        } else {
            fieldNames = identifiers[0];
            values = identifiers.slice(1, identifiers.length);
        }

        const points = this._points;
        const fieldsConfig = this.data().getFieldsConfig();

        const filteredPoints = [].concat(...points).filter((point) => {
            const { _data, _id } = point;

            return fieldNames.every((field, idx) => {
                if (field in fieldsConfig && fieldsConfig[field].def.type === FieldType.DIMENSION) {
                    return values.findIndex(d => d[idx] === _data[fieldsConfig[field].index]) !== -1;
                } else if (field === ReservedFields.ROW_ID) {
                    return values.findIndex(d => d[idx] === _id) !== -1;
                } return true;
            });
        });
        return getAllAttrs ? filteredPoints : filteredPoints.map((d) => {
            const obj = clone(d);
            if (getBBox) {
                const update = obj.update || obj;
                if (obj.size !== undefined) {
                    const sizeVal = Math.sqrt(obj.size / Math.PI) * 2;
                    update.width = sizeVal;
                    update.height = sizeVal;
                    update.x -= sizeVal / 2;
                    update.y -= sizeVal / 2;
                } else {
                    if (update.width === undefined) {
                        update.width = 2;
                    }
                    if (update.height === undefined) {
                        update.height = 2;
                    }
                }
            }

            return obj.update || obj;
        }).sort((a, b) => a.y - b.y);
    }

    getTransformedDataFromIdentifiers (identifiers) {
        const { data: identifierData, schema: identifierSchema } = identifiers.getData();
        const normalizedData = this._normalizedData;
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
                const tupleArr = dataObj._data;
                const exist = identifierSchema.every((obj, i) =>
                    identifierData.findIndex(d => tupleArr[fieldsConfig[obj.name].index] === d[i]) !== -1);
                if (exist) {
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
     * Returns the dom elements associated with the supplied set of row ids.
     * Each element in the layer is mapped with a row of the datamodel. When given an array of row ids, it returns all
     * the elements which is mapped with those row ids.
     *
     * @public
     * @param {Array} set Array of row ids
     *
     * @return {Selection} D3 Selection of dom elements.
     */
    getPlotElementsFromSet (set) {
        return selectElement(this.mount()).selectAll(this.elemType()).filter(data =>
            (data ? set.indexOf(data._id) !== -1 : false));
    }

    /**
     * Notifies when all animations/transitions of the layer are completed.
     *
     * @public
     * @return {Promise} Returns a promise to notify the animation completion.
     */
    animationDone () {
        return Promise.all(this._animationDonePromises);
    }

    registerAnimationDoneHook () {
        let resolveFn;
        const promise = new Promise((resolve) => {
            resolveFn = resolve;
        });
        this._animationDonePromises.push(promise);

        return () => {
            resolveFn();
        };
    }

    getRenderProps () {
        const metaInf = this.metaInf();
        return [`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.y.${metaInf.unitRowIndex}0`,
            `${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.x.${metaInf.unitColIndex}0`];
    }
}
