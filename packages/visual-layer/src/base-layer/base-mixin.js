import {
    getUniqueId,
    mergeRecursive,
    FieldType,
    selectElement,
    ReservedFields,
    DataModel,
    clone,
    generateGetterSetters,
    STATE_NAMESPACES,
    transactor,
    defaultValue,
    getObjProp,
    InvalidAwareTypes
} from 'muze-utils';
import * as PROPS from '../enums/props';
import { props } from './props';
import {
    transformData,
    getNormalizedData,
    applyInteractionStyle,
    getValidTransform,
    domainCalculator,
    renderLayer,
    encodingFieldInfRetriever
} from '../helpers';
import { localOptions } from './local-options';
import { listenerMap } from './listener-map';
import { BASE_LAYER, AREA_LAYER } from '../enums/constants';
import { applyStylesOnInteraction } from './helper';

const layerNs = [STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE, STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE];
const groupNs = STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE;

export const BaseLayerMixin = superclass => class extends superclass {
    /**
     * Creates a layer using a configuration and data.
     *
     * @public
     * @constructor
     * @param {DataModel} data Instance of DataModel to be used. This DataModel instance serves as the data for a
     * layer.
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
    constructor () {
        super();

        generateGetterSetters(this, this.constructor.getterSetters());
        this.axes({});
        this.alias(this.constructor.formalName() + getUniqueId());
        this._points = [];
        this._cachedData = [];
        this._id = getUniqueId();
        this._measurement = {};
        this._animationDonePromises = [];
        this._graphicElems = {};
        this._customConfig = null;
    }

    static getState () {
        return [
            {
                domain: null
            },
            Object.keys(this.localOptions()).reduce((acc, v) => {
                acc[v] = localOptions[v].value;
                return acc;
            }, {})
        ];
    }

    static getListeners () {
        return {
            store: [...listenerMap, {
                type: 'registerChangeListener',
                props: this.getRenderProps(),
                listener: (context) => {
                    renderLayer(context);
                },
                subNamespace: (context) => {
                    const { unitRowIndex, unitColIndex, namespace } = context.metaInf();
                    return {
                        [`${layerNs[1]}.${PROPS.DATA}`]: namespace,
                        [`${groupNs}.domain.x`]: `${unitColIndex}0`,
                        [`${groupNs}.domain.y`]: `${unitRowIndex}0`,
                        [`${groupNs}.domain.radius`]: `${unitRowIndex}-${unitColIndex}`
                    };
                }
            }],
            throwback: []
        };
    }

    static getQualifiedStateProps () {
        const layerState = this.getState();
        return layerState.map((state, i) => Object.keys(state).map(prop => `${layerNs[i]}.${prop}`));
    }

    store (...params) {
        if (params.length) {
            const store = this._store = params[0];
            const { namespace } = this.metaInf();
            store.addSubNamespace(namespace, BASE_LAYER, this);

            transactor(this, this.constructor.localOptions(), store, {
                subNamespace: namespace,
                namespace: `${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}`
            });
            return this;
        }
        return this._store;
    }

    domain (...dom) {
        const prop = `${STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE}.${PROPS.DOMAIN}`;
        const store = this.store();
        if (dom.length) {
            const { parentNamespace, namespace } = this.metaInf();
            const domain = defaultValue(store.get(prop, parentNamespace), {});
            domain[namespace] = dom[0];
            this.store().commit(prop, domain, parentNamespace);
            return this;
        }
        return this.store().get(prop, this.metaInf().namespace);
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

    static getterSetters () {
        return props;
    }

    static localOptions () {
        return localOptions;
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
     * Provides a alias for a layer. Like it's possible to have same layer (like bar) multiple times, but among
     * multiple layers of same type if one layer has to be referred, alias is used. If no alias is given then
     * `formalName` is set as the alias name.
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
            domains = domainCalculator[this.coord()](data, this);
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
        const { parentNamespace, namespace } = this.metaInf();
        const domains = getObjProp(this.store()
            .get(`${STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE}.${PROPS.DOMAIN}`, parentNamespace), namespace);
        return encodingType !== undefined ? domains[encodingType] || [] : domains;
    }

    getUidsFromPayload ({ model, uids }, targetData) {
        let uidsArr = uids;
        let dm = model;

        if (targetData) {
            const targetFields = targetData[0];
            const targetVals = targetData.slice(1, targetData.length);
            const payloadMap = targetVals.reduce((acc, v) => {
                acc[v] = v;
                return acc;
            }, {});
            const measures = Object.keys(this.data().getFieldspace().getMeasure());

            dm = model.select((fields) => {
                const row = `${targetFields.map((field) => {
                    let val;
                    if (field === ReservedFields.MEASURE_NAMES) {
                        val = measures;
                    } else if (field === ReservedFields.ROW_ID) {
                        val = fields[ReservedFields.ROW_ID];
                    } else {
                        const currentField = fields[field];
                        const isFieldInvalid = currentField instanceof InvalidAwareTypes;

                        val = isFieldInvalid ? currentField.value() : (currentField || {}).internalValue;
                    }
                    return val;
                })}`;
                return row in payloadMap;
            }, {
                saveChild: false
            });

            const dmUids = dm.getUids();
            uidsArr = uids.filter(d => dmUids.find(id => `${id}` === `${d[0]}`));
        }

        return {
            model: dm,
            uids: uidsArr,
            length: uidsArr.length
        };
    }

    /**
     * Normalizes the transformed data and returns it.
     *
     * @param {string} encodingType type of encoding x, y, etc.
     * @return {Object} Axis domains
     */
    getNormalizedData (transformedData) {
        return getNormalizedData(transformedData, this);
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
     *          // id property contains the field names and their corresponding values in a 2d array. This is the
     *          data // associated with the nearest point.
     *          id: // Example data: [['Origin'], ['USA']],
     *          dimensions: // Physical dimensions of the point.
     *          layerId: // Id of the layer instance.
     *      }
     * ```
     */
    getNearestPoint () {
        return null;
    }

    applyInteractionStyle (interactionType, selectionSet, options) {
        const interactionConfig = this.config().interaction || {};
        const { apply, styles, reset } = options;

        let interactionStyles = interactionConfig[interactionType];
        interactionStyles = styles || interactionStyles;
        if (interactionStyles) {
            applyInteractionStyle(this, selectionSet, interactionStyles, {
                apply,
                interactionType,
                reset
            });
        }
    }

    resolveTransformType () {
        this._transformType = getValidTransform(this);
    }

    transformType () {
        return this._transformType;
    }

    /**
     * Renders the layer
     * @return {BaseLayer} Instance of the layer.
     */
    render () {
        return this;
    }

    elemType () {
        return 'g';
    }

    /**
     * Disposes the entire layer.
     *
     * @return {BaseLayer} Instance of layer.
     */
    remove () {
        const { namespace, parentNamespace } = this.metaInf();
        const store = this.store();
        store.removeSubNamespace(namespace, BASE_LAYER);
        const layersDomain = store.get(`${STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE}.domain`);
        const unitDom = layersDomain[parentNamespace];
        unitDom && (delete unitDom[namespace]);
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

    getInteractionStyles () {
        return applyStylesOnInteraction;
    }

    addOverlayPath () {
        return null;
    }

    removeOverlayPath () {
        return null;
    }

    applyLayerStyle (elem, interactionType, style, options) {
        const interactionFn = this.getInteractionStyles();
        return interactionFn(this, elem, interactionType, style, options);
    }

    getIdentifiersFromData (data, rowId) {
        const schema = this.data().getSchema();
        const fieldsConfig = this.data().getFieldsConfig();
        const identifiers = [[], []];

        const allMeasures = schema.every(field => field.type === FieldType.MEASURE);
        schema.forEach((d, i) => {
            const name = d.name;
            const { type } = fieldsConfig[name].def;
            if (type === FieldType.DIMENSION) {
                identifiers[0].push(name);
                identifiers[1].push(data[i]);
            }
        });

        const measures = schema.filter(d => d.type === FieldType.MEASURE).map(d => d.name);
        if (allMeasures) {
            identifiers[0].push(...[ReservedFields.ROW_ID]);
            identifiers[1].push(...[rowId]);
        }
        if (measures.length) {
            identifiers[0].push(ReservedFields.MEASURE_NAMES);
            identifiers[1].push(measures.join());
        }
        return identifiers;
    }

    hasPlotSpan () {
        return false;
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
     * Returns the information of the marks corresponding to the supplied identifiers.
     * Identifiers are a set of field names and their corresponding values in an array.
     * It can also be an instance of datamodel.
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
            const { source, rowId } = point;

            return fieldNames.every((field, idx) => {
                if (field in fieldsConfig && fieldsConfig[field].def.type === FieldType.DIMENSION) {
                    return values.findIndex(d => d[idx] === source[fieldsConfig[field].index]) !== -1;
                } else if (field === ReservedFields.ROW_ID) {
                    return values.findIndex(d => d[idx] === rowId) !== -1;
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

    getTransformedDataFromIdentifiers (identifiers, idx = 0) {
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
            const layerName = this.constructor.formalName();
            measureIndex = fieldsConfig[yField].index;
            enc = 'y';
            if (layerName === AREA_LAYER) {
                enc = (idx % 2 === 0) ? 'y' : 'y0';
            }
        }

        const transformedData = [];
        normalizedData.forEach((dataArr) => {
            dataArr.forEach((dataObj) => {
                const tupleArr = dataObj.source;
                const exist = identifierSchema.every((obj, i) =>
                    identifierData.findIndex(d => tupleArr[fieldsConfig[obj.name].index] === d[i]) !== -1);
                if (exist) {
                    const transformedVal = dataObj[enc] || 0;
                    const row = dataObj.source;
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

        return [transformedData, this.data().getSchema()];
    }

    /**
     * Returns the dom elements associated with the supplied set of row ids.
     * Each element in the layer is mapped with a row of the datamodel. When given an array of row ids,
     * it returns all the elements which is mapped with those row ids.
     *
     * @public
     * @param {Array} set Array of row ids
     *
     * @return {Selection} D3 Selection of dom elements.
     */
    getPlotElementsFromSet (set) {
        const graphicElems = this._graphicElems;
        const elems = [];
        for (let i = 0, len = set.length; i < len; i++) {
            const elem = graphicElems[set[i]];
            if (elem) {
                elems.push(elem);
            }
        }
        return elems;
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

    /**
     * Called when the layer datamodel is set.
     *
     * @param {Array} arr Old and new datamodel instance.
     * @param {DataModel} arr[0] Previous datamodel instance.
     * @param {DataModel} arr[1] Current datamodel instance.
     *
     * @return {BaseLayer} Instance of layer.
     */
    dataDidSet ([, data]) {
        const config = this.config();

        if (data && config) {
            if (this._cacheEnabled) {
                this._cachedData.push(data);
            } else {
                this._cachedData = [data];
            }
            const encodingValue = config.encoding;
            if (encodingValue) {
                const fieldsConfig = data.getFieldsConfig();
                const encodingFieldsInf = this.retrieveEncodingFields(encodingValue, this.coord(), data);
                this.encodingFieldsInf(encodingFieldsInf);
                this.resolveTransformType();
                this._transformedData = this.getTransformedData(data, config,
                    this.transformType(), encodingFieldsInf);
                this._normalizedData = this.getNormalizedData(this._transformedData, fieldsConfig);
                if (config.calculateDomain !== false) {
                    const domain = this.calculateDomainFromData(this._normalizedData,
                        this.encodingFieldsInf(), this.data().getFieldsConfig());
                    this.domain(domain);
                }
            }
        }
        return this;
    }

    retrieveEncodingFields (encoding, coord, data) {
        const fieldsConfig = data.getFieldsConfig();

        return encodingFieldInfRetriever[coord](encoding, fieldsConfig);
    }

    static getRenderProps () {
        return [`${layerNs[1]}.${PROPS.DATA}`, ...['x', 'y', 'radius'].map(type =>
            `${groupNs}.domain.${type}`)];
    }

    applyStyles ({ strokeStyles, otherStyles, styleObj, elem, mountPoint, applicableStrokePos, datum }) {
        strokeStyles.forEach((type) => {
            this.addOverlayPath(
                elem.node(),
                datum,
                { type, value: styleObj[type] },
                applicableStrokePos,
                mountPoint
            );
        });

        this.applyElementStyles(elem, otherStyles, styleObj);
    }

    applyElementStyles (elem, styles, styleObj) {
        styles.forEach((type) => {
            elem.style(type, styleObj[type]);
        });
    }

    getBoundBoxes () {
        return null;
    }
};
