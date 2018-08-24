import { mergeRecursive, getUniqueId } from 'muze-utils';

export default class GenericSideEffect {
    constructor (firebolt) {
        this.firebolt = firebolt;
        this.enabled = true;
        this._strategy = 'default';
        this._config = {};
        this._id = getUniqueId();
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
        this.enabled = false;
        return this;
    }

    enable () {
        this.enabled = true;
        return this;
    }

    apply () {
        return this;
    }
}
