import { defReducer, fnList } from '../operator';

class ReducerStore {
    constructor () {
        this.store = new Map();
        this.store.set('defReducer', defReducer);

        Object.entries(fnList).forEach((key) => {
            this.store.set(key[0], key[1]);
        });
    }

    defaultReducer (...params) {
        if (params.length) {
            let reducer = params[0];
            if (typeof reducer === 'function') {
                this.store.set('defReducer', reducer);
            } else if (typeof reducer === 'string') {
                if (Object.keys(fnList).indexOf(reducer) !== -1) {
                    this.store.set('defReducer', fnList[reducer]);
                }
            }
            return this;
        }

        return this.store.get('defReducer');
    }
    register (name, reducer) {
        if (typeof name === 'string' && typeof reducer === 'function') {
            this.store.set(name, reducer);
        }

        return () => { this.__unregister(name); };
    }

    __unregister (name) {
        if (this.store.has(name)) {
            this.store.delete(name);
        }
    }

    resolve (name) {
        if (name instanceof Function) {
            return name;
        }
        return this.store.get(name);
    }
}

const reducerStore = (function() {
    let store = null;

    function getStore () {
        if (store === null) {
            store = new ReducerStore();
        }
        return store;
    }
    return getStore();
}());

export default reducerStore;
