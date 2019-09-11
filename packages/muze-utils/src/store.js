import Model from 'hyperdis';
import { defaultValue, getObjProp, toArray } from './common-utils';

const initProp = (obj, props, val = () => ({})) => {
    props.forEach((prop) => {
        if (!obj[prop]) {
            obj[prop] = val();
        }
        obj = obj[prop];
    });
    return obj;
};

const fetchPropValues = (propNames, params, deps) => params.map((param, i) => {
    const prop = propNames[i];

    return param.map(val => (val === undefined || val === null ? val : val[deps[prop]]));
});

const addListenerToNamespace = (namespaceInf, fn, context) => {
    let key = namespaceInf.key;
    const namespace = namespaceInf.id;
    const listeners = context._listeners;

    if (namespace) {
        !listeners.get(namespace) && (listeners.set(namespace, new Map()));
        const namespaceListeners = listeners.get(namespace);

        if (!key) {
            key = namespaceListeners.size;
        }
        namespaceListeners.set(key, fn);
    } else {
        key = key || listeners.size;
        listeners.set(key, fn);
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
        let fns = defaultValue(getObjProp(propListenerMap, prop, type, 'fns'), 0);

        fns++;
        subNamespace && subNamespaces.push(subNamespace);
        registeredListeners[ns][prop] = {
            subNamespace: subNamespaces,
            allProps: props,
            subNamespaces: {}
        };
        initProp(propListenerMap, [prop, type]);
        propListenerMap[prop][type] = {
            fns,
            _fnCount: fns
        };
    });
};

const registerListener = (context, type, ...options) => {
    const [propList, callBack, instantCall, namespaceInf = {}] = options;
    let props = propList;

    if (!Array.isArray(propList)) {
        props = [propList];
    }

    const { namespace: ns } = namespaceInf;
    const callbackFn = ((propNames, namespaceVal) => (...params) => {
        const { _savedCommits: commits, _propListenerMap: propListenerMap } = context;

        if (!propNames.some(prop => getObjProp(propListenerMap, prop, 'disabled'))) {
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
                        let { fns } = fnInf;

                        if (fns > 0) {
                            setContexts(contextsObj, listeners[nm], contextMap);
                            fns--;
                        }

                        if (fns <= 0) {
                            delete commitsObj[nm];
                        }
                        fnInf.fns = fns;
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

const listenerTypes = ['next', 'on'];

const removePropValue = (context, map, propInf) => {
    const { subNamespace: sns, prop, propListenerMap } = propInf;
    const propObj = propListenerMap[prop];

    listenerTypes.forEach((type) => {
        if (type in propObj) {
            delete propObj[type][sns];
        }
    });
    if (map.has(sns)) {
        const value = context.get(prop);

        if (value instanceof Object && sns in value) {
            delete value[sns];
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
        const commitsObj = this._commits;

        this.lockModel();
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

                this.commit(propName, propName in queuedProps ? queuedProps[propName][namespace] : value,
                    namespace);
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
            const propFns = listenerTypes.reduce((acc, type) => {
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
        let sanitizedVal = value;
        const commits = this._commits;
        const savedCommits = this._savedCommits;
        const locked = getObjProp(commits, propName, 'locked');
        const propListenerMap = this._propListenerMap[propName] || {};

        propListenerMap.disabled = disableListener;

        if (locked) {
            commits[propName].queue.push([propName, value, namespace]);
            return this;
        }

        if (namespace) {
            if (this._locked) {
                const queuedProps = initProp(this._queuedProps, [propName]);
                queuedProps[namespace] = value;
                sanitizedVal = queuedProps;
            } else {
                sanitizedVal = defaultValue(this.get(propName), {});
                sanitizedVal[namespace] = value;
            }

            listenerTypes.forEach((type) => {
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
     * This method is used to register a callback that will execute
     * when one or more properties change.
     *
     * @param {string | Array} propNames name of property or array of props.
     * @param {Function} callBack The callback to execute.
     * @memberof Store
     */
    /* istanbul ignore next */registerChangeListener (...params) {
        registerListener(this, 'next', ...params);
        return this;
    }

    /**
     * This method is used to register a callback that will execute
     * when one or more properties change.
     *
     * @param {string | Array} propNames name of property or array of props.
     * @param {Function} callBack The callback to execute.
     * @memberof Store
     */
    /* istanbul ignore next */ registerImmediateListener (...params) {
        registerListener(this, 'on', ...params);
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
        const listenersMap = this._listeners;
        const listeners = listenersMap.get(id);

        if (key) {
            const fn = listenersMap.get(key);

            fn && fn();
        } else {
            for (const fn of listeners.values()) {
                fn();
            }
            listenersMap.set(id, []);
        }
        return this;
    }

    removeSubNamespace (subNamespace, namespace) {
        const {
            _registeredListeners: listenerMap,
            _contextMap: contextMap,
            _propListenerMap: propListenerMap
        } = this;
        const listenersObj = listenerMap[namespace];

        for (const prop in listenersObj) {
            const { subNamespaces } = listenersObj[prop];
            const propInf = {
                subNamespace,
                prop,
                propListenerMap
            };

            if (subNamespaces[subNamespace]) {
                removePropValue(this, subNamespaces[subNamespace], propInf);
                delete subNamespaces[subNamespace];
            } else {
                for (const ns in subNamespaces) {
                    const snsMap = subNamespaces[ns];

                    removePropValue(this, snsMap, propInf);
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
 *          sanitization: // Need for sanitization before type is checked
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
            const nameSpaceProp = namespace ? `${namespace}.${prop}` : prop;

            if (subNamespace) {
                const value = defaultValue(store.get(nameSpaceProp), {});
                value[subNamespace] = conf.value;
                stateProps[nameSpaceProp] = value;
            } else {
                stateProps[prop] = conf.value;
            }

            holder[prop] = ((context, meta, nsProp) => (...params) => {
                const paramsLen = params.length;
                if (paramsLen) {
                    const { takesMultipleParams = false } = meta || {};
                    // If parameters are passed then it's a setter
                    let val = takesMultipleParams ? params : params[0];

                    if (meta) {
                        let values;
                        const prevVal = context.get(nsProp, subNamespace);
                        const { sanitization, typeCheck, typeExpected } = meta;
                        if (typeof sanitization === 'function') {
                            // Sanitize if required
                            val = sanitization(val, prevVal, holder);
                        }

                        // Checking if a setter is valid
                        if (typeof typeCheck === 'function') {
                            const typeCheckResult = typeCheck(val);

                            if (typeCheckResult) {
                                values = val;
                            }
                        } else if (typeof typeCheck === 'string' && typeCheck === 'constructor') {
                            if (val && val.constructor.name === typeExpected) {
                                values = val;
                            }
                        } else {
                            values = val;
                        }

                        const preset = meta.preset;
                        const oldValues = toArray(context.get(nsProp, subNamespace));
                        preset && preset(values, holder);
                        if (takesMultipleParams) {
                            oldValues.forEach((value, i) => {
                                if (values[i] === undefined) {
                                    values[i] = value;
                                }
                            });
                        }
                        values && context.commit(nsProp, values, subNamespace);
                    } else {
                        context.commit(nsProp, val, subNamespace);
                    }
                    return holder;
                }
                // No parameters are passed hence its a getter
                return context.get(nsProp, subNamespace);
            })(store, conf.meta, nameSpaceProp, Array.isArray(conf.value));
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
