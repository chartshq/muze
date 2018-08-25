import { mergeRecursive, getUniqueId } from 'muze-utils';

export default class GenericSideEffect {
    constructor (firebolt) {
        this.firebolt = firebolt;
        this._enabled = true;
        this._strategy = 'default';
        this._config = {};
        this._id = getUniqueId();
        this._strategies = {};
        this.config(this.constructor.defaultConfig());
    }

    static defaultConfig () {
        return {};
    }

    static target () {
        return 'all';
    }

    static mutates () {
        return false;
    }

    config (...params) {
        if (params.length) {
            this._config = mergeRecursive(this._config, params[0]);
            return this;
        }
        return this._config;
    }

    disable () {
        this._enabled = false;
        return this;
    }

    enable () {
        this._enabled = true;
        return this;
    }

    isEnabled () {
        return this._enabled;
    }

    apply () {
        return this;
    }

    addStrategy (name, fn) {
        this._strategies[name] = fn;
        return this;
    }
}
