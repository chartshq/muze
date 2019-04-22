import Model from 'hyperdis';
import { defaultValue, getObjProp } from './common-utils';
import { DATA_TYPE } from './enums';

const initProp = (obj, props, val) => {
    props.forEach((prop) => {
        if (!obj[prop]) {
            obj[prop] = val ? val() : {};
        }
        obj = obj[prop];
    });
    return obj;
};

const fetchPropValues = (propNames, params, deps) => {
    return params.map((param, i) => {
        const prop = propNames[i];
        return param.map((val) => (val === undefined || val === null ? val : val[deps[prop]]));
    });
};

const addListenerToNamespace = (namespaceInf, fn, context) => {
    let key = namespaceInf.key;
    const namespace = namespaceInf.id;
    if (namespace) {
        !context._listeners.get(namespace) && (context._listeners.set(namespace, new Map()));
        const listeners = context._listeners.get(namespace);

        if (!key) {
            key = listeners.size;
        }
        listeners.set(key, fn);
    } else {
        key = key || context._listeners.size;
        context._listeners.set(key, fn);
    }
};

const setContexts = (contexts, propObj, contextMap) => {
    for (const key of propObj.keys()) {
        contexts[key] = {
            context: contextMap[key],
            deps: propObj.get(key).depProps
        };
    }
    return contexts;
};

const registerPropInMaps = (store, props, namespaceInf, type) => {
    const {
        _registeredListeners: registeredListeners,
        _propListenerMap: propListenerMap
    } = store;
    const {
        subNamespace,
        namespace: ns
    } = namespaceInf;

    initProp(registeredListeners, [ns]);
    props.forEach((prop) => {
        const subNamespaces = defaultValue(getObjProp(registeredListeners, ns, prop, 'subNamespace'), []);
        subNamespace && subNamespaces.push(subNamespace);
        registeredListeners[ns][prop] = {
            subNamespace: subNamespaces,
            allProps: props,
            subNamespaces: {}
        };
        let fns = defaultValue(getObjProp(propListenerMap, prop, type, 'fns'), 0);
        fns++;
        initProp(propListenerMap, [prop, type]);
        propListenerMap[prop][type] = {
            fns,
            _fnCount: fns
        };
    });
};

const registerListener = (context, type, config) => {
    const { callBack, instantCall, namespaceInf, props } = config;
    const { namespace: ns } = namespaceInf;
    const callbackFn = ((propNames, namespaceVal) => (...params) => {
        const { _savedCommits: commits, _propListenerMap: propListenerMap } = context;

        if (!propNames.some((prop) => getObjProp(propListenerMap, prop, 'disabled'))) {
            if (namespaceVal) {
                const listenersObj = context._registeredListeners[namespaceVal];
                const contextMap = context._contextMap[namespaceVal];
                const contextsObj = {};

                propNames.forEach((prop) => {
                    const commitsObj = defaultValue(getObjProp(commits, prop, type), {});
                    const listeners = listenersObj[prop].subNamespaces;
                    const propDeps = propListenerMap[prop][type];
                    for (const nm in commitsObj) {
                        const fnInf = defaultValue(propDeps[nm], { fns: 0 });
                        if (fnInf.fns > 0) {
                            setContexts(contextsObj, listeners[nm], contextMap);
                            fnInf.fns--;
                        }

                        if (fnInf.fns <= 0) {
                            delete commitsObj[nm];
                        }
                    }
                });
                for (const key in contextsObj) {
                    const obj = contextsObj[key];
                    callBack(obj.context, ...fetchPropValues(propNames, params, obj.deps));
                }
            } else {
                callBack(...params);
            }
        }
    })(props, ns, type);

    const fn = context.model[type](props, callbackFn, instantCall);

    if (ns) {
        registerPropInMaps(context, props, namespaceInf, type);
    }
    addListenerToNamespace(namespaceInf, fn, context);
};

const retrieveNamespaces = (names, key) => {
    if (names instanceof Object) {
        return [names[key]];
    } else if (names instanceof Array) {
        return names;
    }
    return [names];
};

const createMap = () => new Map();

const types = ['next', 'on'];

const removePropValue = (context, map, propInf) => {
    const { subNamespace: sns, prop, propListenerMap } = propInf;
    const propObj = propListenerMap[prop];
    types.forEach((type) => {
        if (type in propObj) {
            delete propObj[type][sns];
        }
    });
    if (map.has(sns)) {
        const value = context.get(prop);
        if (value instanceof Object && sns in value) {
            delete value[sns];
            context.commit(prop, value, undefined, true);
        }
        map.delete(sns);
    }
};

/**
 * Methods to handle changes to table configuration and reactivity are handled by this
 * class.
 */
/**
 *  Common store class
 *
 * @class Store
 */
export class Store {
    /**
     * Creates an instance of Store.
     * @param {Object} config The object to create the state store with.
     * @memberof Store
     */
    constructor (config) {
        // create reactive model
        this.model = Model.create(config);
        this._listeners = new Map();
        this._registeredListeners = {};
        this._contextMap = {};
        this._commits = {};
        this._savedCommits = {};
        this._queuedProps = {};
        this._propListenerMap = {};
        this._locked = false;
    }

    lockModel () {
        this.model.lock();
        this._locked = true;
        return this;
    }

    unlockModel () {
        this._locked = false;
        this.model.unlock();
        return this;
    }

    /**
     * This method returns a plain JSON object
     * with all the fields in the state store.
     *
     * @return {Object} Serialized representation of state store.
     * @memberof Store
     */
    serialize () {
        return this.model.serialize();
    }

    lockCommits (props) {
        props.forEach((prop) => {
            this._commits[prop] = {
                locked: true,
                queue: []
            };
        });
        return this;
    }

    unlockCommits (props) {
        this.lockModel();
        const commitsObj = this._commits;
        props.forEach((prop) => {
            commitsObj[prop].locked = false;
            const queuedProps = {};
            const { queue } = commitsObj[prop];
            queue.forEach((params) => {
                const [propName, value, namespace] = params;
                if (namespace) {
                    const propObj = initProp(queuedProps, [propName, namespace]);
                    Object.assign(propObj, value);
                }
            });
            queue.forEach((params) => {
                const [propName, value, namespace] = params;
                if (propName in queuedProps) {
                    this.commit(propName, queuedProps[propName][namespace], namespace);
                } else {
                    this.commit(propName, value, namespace);
                }
            });
            delete commitsObj[prop];
        });
        this.unlockModel();
        return this;
    }

    addSubNamespace (sns, namespace, context) {
        // Get all the listeners registered by the component
        const listeners = this._registeredListeners[namespace];
        const propListenerMap = this._propListenerMap;

        initProp(this._contextMap, [namespace]);
        this._contextMap[namespace][sns] = context;
        for (const key in listeners) {
            const obj = listeners[key];
            const propObj = propListenerMap[key];
            const propFns = types.reduce((acc, type) => {
                const val = defaultValue(getObjProp(propObj, type, 'fns'), 0);
                val && (acc[type] = val);
                return acc;
            }, {});
            const { allProps, subNamespaces, subNamespace } = obj;
            const snsArr = subNamespace.length ? subNamespace : [sns];

            snsArr.forEach((ns) => {
                const nsObj = ns instanceof Function ? ns(context) : ns;
                const names = retrieveNamespaces(nsObj, key);
                const depProps = allProps.reduce((acc, prop) => {
                    acc[prop] = ns instanceof Function ? nsObj[prop] : ns;
                    return acc;
                }, {});

                names.forEach((nm) => {
                    initProp(subNamespaces, [nm], createMap).set(sns, {
                        depProps
                    });

                    for (const type in propFns) {
                        initProp(propObj, [type, nm]);
                        const fns = propFns[type];
                        propObj[type][nm] = {
                            fns,
                            _fnCount: fns
                        };
                    }
                });
            });
        }
        return this;
    }

    /**
     * This method is used to update the value of a property in the state store.
     *
     * @param {string} propName The name of the property.
     * @param {number} value The new value of the property.
     * @memberof Store
     */
    commit (propName, value, namespace, disableListener = false) {
        const commits = this._commits;
        const savedCommits = this._savedCommits;
        const locked = getObjProp(commits, propName, 'locked');
        const propListenerMap = this._propListenerMap[propName] || {};

        propListenerMap.disabled = disableListener;

        if (locked) {
            commits[propName].queue.push([propName, value, namespace]);
            return this;
        }

        let sanitizedVal = value;
        if (namespace) {
            if (this._locked) {
                initProp(this._queuedProps, [propName]);
                this._queuedProps[propName][namespace] = value;
                sanitizedVal = this._queuedProps[propName];
            } else {
                sanitizedVal = defaultValue(this.get(propName), {});
                sanitizedVal[namespace] = value;
            }

            types.forEach((type) => {
                initProp(savedCommits, [propName, type]);
                savedCommits[propName][type][namespace] = true;
                if (getObjProp(propListenerMap, type, namespace)) {
                    propListenerMap[type][namespace].fns = propListenerMap[type][namespace]._fnCount;
                }
            });
        }

        this.model.prop(propName, sanitizedVal);
        return this;
    }

    /**
     * This method is used to register a callbacl that will execute
     * when one or more properties change.
     *
     * @param {string | Array} propNames name of property or array of props.
     * @param {Function} callBack The callback to execute.
     * @memberof Store
     */
    /* istanbul ignore next */registerChangeListener (propNames, callBack, instantCall, namespaceInf = {}) {
        let props = propNames;
        if (!Array.isArray(propNames)) {
            props = [propNames];
        }
        registerListener(this, 'next', {
            namespaceInf,
            callBack,
            instantCall,
            props
        });
        return this;
    }
    /**
     * This method is used to register a callbacl that will execute
     * when one or more properties change.
     *
     * @param {string | Array} propNames name of property or array of props.
     * @param {Function} callBack The callback to execute.
     * @memberof Store
     */
    /* istanbul ignore next */ registerImmediateListener (propNames, callBack, instantCall, namespaceInf = {}) {
        let props = propNames;
        if (!Array.isArray(propNames)) {
            props = [propNames];
        }
        registerListener(this, 'on', {
            namespaceInf,
            props,
            callBack,
            instantCall
        });
    }

    /**
     * This method is used to get the name of the property
     * from the state store.
     *
     * @param {string} propName The name of the field in state store.
     * @return {any} The value of the field.
     * @memberof Store
     */
    get (propName, subNamespace) {
        const value = this.model.prop(propName);
        return subNamespace ? value && value[subNamespace] : value;
    }

    /**
     * This method is used to register a computed property that is computed every time
     * the store value changes.
     *
     * @param {string} propName The name of the property to create.
     * @param {Function} callBack The function to execute when depemdent props change.
     * @memberof Store
     */
    computed (propName, callBack) {
        return this.model.calculatedProp(propName, callBack);
    }

    append (...params) {
        this.model.append(...params);
        return this;
    }

    unsubscribeAll () {
        Object.values(this._listeners).forEach(fn => fn());
        return this;
    }

    unsubscribe (namespaceInf = {}) {
        const { id, key } = namespaceInf;
        const listeners = this._listeners.get(id);
        if (key) {
            const fn = this._listeners.get(key);
            fn && fn();
        } else {
            for (const fn of listeners.values()) {
                fn();
            }
            this._listeners.set(id, []);
        }
        return this;
    }

    removeSubNamespace (subNamespace, namespace) {
        const { _registeredListeners: listenerMap, _contextMap: contextMap, _propListenerMap: propListenerMap } = this;
        const listenersObj = listenerMap[namespace];

        for (const prop in listenersObj) {
            const { subNamespaces } = listenersObj[prop];
            if (subNamespaces[subNamespace]) {
                removePropValue(this, subNamespaces[subNamespace], {
                    subNamespace,
                    prop,
                    propListenerMap
                });
                delete subNamespaces[subNamespace];
            } else {
                for (const ns in subNamespaces) {
                    const snsMap = subNamespaces[ns];
                    removePropValue(this, snsMap, {
                        subNamespace,
                        prop,
                        propListenerMap
                    });
                    if (!snsMap.size) {
                        delete subNamespaces[ns];
                    }
                }
            }
        }
        delete contextMap[namespace][subNamespace];
        return this;
    }
}

/**
 * Setter getter creator from config
 * Format
 *  PROPERTRY_NAME: {
 *      value: // default value of the property,
 *      meta: {
 *          typeCheck: // The setter value will be checked using this. If the value is function then the setter value
 *                     // is passed as args. (Optional)
 *          typeExpected: // The output of typecheck action will be tested against this. Truthy value will set the
 *                       // value to the setter
 *          sanitizaiton: // Need for sanitization before type is checked
 *      }
 *  }
 *
 * @param {Object} holder an empty object on which the getters and setters will be mounted
 * @param {Object} options options config based on which the getters and setters are determined.
 * @param {Hyperdis} model optional model to attach the property. If not sent new moel is created.
 * @return {Array}
 */
export const transactor = (holder, options, model, namespaceInf = {}) => {
    let conf;
    const store = model instanceof Store ? model : new Store({});
    const stateProps = {};
    const { namespace, subNamespace } = namespaceInf;
    for (const prop in options) {
        if ({}.hasOwnProperty.call(options, prop)) {
            conf = options[prop];
            let nameSpaceProp;
            if (namespace) {
                nameSpaceProp = `${namespace}.${prop}`;
            } else {
                nameSpaceProp = prop;
            }
            if (subNamespace) {
                const value = defaultValue(store.get(nameSpaceProp), {});
                value[subNamespace] = conf.value;
                stateProps[nameSpaceProp] = value;
            } else {
                stateProps[prop] = conf.value;
            }

            holder[prop] = ((context, meta, nsProp) => (...params) => {
                let val;
                let compareTo;
                const paramsLen = params.length;
                const prevVal = context.get(nsProp, subNamespace);
                if (paramsLen) {
                    // If parameters are passed then it's a setter
                    const spreadParams = meta && meta.spreadParams;
                    val = params;
                    const values = [];
                    if (meta) {
                        for (let i = 0; i < paramsLen; i++) {
                            val = params[i];
                            const sanitization = meta.sanitization && (spreadParams ? meta.sanitization[i] :
                                meta.sanitization);
                            const typeCheck = meta.typeCheck && (spreadParams ? meta.typeCheck[i] : meta.typeCheck);
                            if (sanitization && typeof sanitization === 'function') {
                                // Sanitize if required
                                val = sanitization(val, prevVal, holder);
                            }
``
                            if (typeCheck) {
                                // Checking if a setter is valid
                                if (typeof typeCheck === 'function') {
                                    let typeExpected = meta.typeExpected;
                                    if (typeExpected && spreadParams) {
                                        typeExpected = typeExpected[i];
                                    }
                                    if (typeExpected) {
                                        compareTo = typeExpected;
                                    } else {
                                        compareTo = true;
                                    }

                                    if (typeCheck(val) === compareTo) {
                                        values.push(val);
                                    }
                                } else if (typeof typeCheck === DATA_TYPE.STRING) {
                                    if (typeCheck === 'constructor') {
                                        const typeExpected = spreadParams ? meta.typeExpected[i] :
                                            meta.typeExpected;
                                        if (val && (val.constructor.name === typeExpected)) {
                                            values.push(val);
                                        }
                                    }
                                } else {
                                    // context.prop(key, val);
                                    values.push(val);
                                }
                            } else {
                                values.push(val);
                            }
                        }
                        const preset = meta.preset;
                        const oldValues = context.get(nsProp, subNamespace);
                        preset && preset(values[0], holder);
                        if (spreadParams) {
                            oldValues.forEach((value, i) => {
                                if (values[i] === undefined) {
                                    values[i] = value;
                                }
                            });
                        }
                        values.length && context.commit(nsProp, spreadParams ? values : values[0], subNamespace);
                    } else {
                        context.commit(nsProp, spreadParams ? val : val[0], subNamespace);
                    }
                    return holder;
                }
                // No parameters are passed hence its a getter
                return context.get(nsProp, subNamespace);
            })(store, conf.meta, nameSpaceProp, subNamespace);
        }
    }

    if (subNamespace) {
        for (const key in stateProps) {
            store.commit(key, stateProps[key][subNamespace], subNamespace);
        }
    } else if (namespace === undefined) {
        store.append(stateProps);
    } else {
        store.append(namespace, stateProps);
    }

    return [holder, store];
};