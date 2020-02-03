import { retrieveNearestGroupByReducers } from 'muze-utils';

export class EntryExitSet {
    constructor ({ uids, data, filteredModel }) {
        this._uids = uids;
        this._data = data;
        this._filteredModel = filteredModel;
        this._model = null;
    }

    get uids () {
        return this._uids;
    }

    get model () {
        if (!this._model) {
            this._model = this._filteredModel(this._data);
        }
        return this._model;
    }

    get length () {
        return this._uids.length;
    }

    get aggFns () {
        return retrieveNearestGroupByReducers(this._model);
    }
}
