import {
    getDataModelFromIdentifiers
} from 'muze-utils';

export default class GroupFireBolt {
    constructor (context) {
        this.context = context;
    }

    dispatchBehaviour (behaviour, payload) {
        const propPayload = Object.assign(payload);
        const criteria = propPayload.criteria;
        const data = this.context.data();

        propPayload.action = behaviour;
        const model = getDataModelFromIdentifiers(data, criteria);
        data.propagate(model, propPayload, {
            sourceId: this.context.alias()
        });
        return this;
    }
}
