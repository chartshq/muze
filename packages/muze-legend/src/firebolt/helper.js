import { propagationBehaviourMap } from './action-behaviour-map';
import { propagationSideEffects } from './behaviour-effect-map';

export const propagate = (firebolt, action, identifiers) => {
    const context = firebolt.context;
    const data = context.metaData();

    const propPayload = {};
    propPayload.action = propagationBehaviourMap[action] || action;
    // @TODO: Change fade propagationSideEffect for area layer
    propPayload.sideEffects = propagationSideEffects[action];
    propPayload.sourceCanvas = context.canvasAlias();
    const isMutableAction = firebolt._actions.behavioural[propPayload.action].constructor.mutates();

    const propConfig = {
        sourceId: firebolt.id(),
        payload: propPayload,
        criteria: propPayload.criteria === null ? null : identifiers,
        isMutableAction,
        action: propPayload.action
    };

    data.propagate(identifiers, propConfig, true);
};

export const payloadGenerator = {
    __default: (selectionDataModel, propConfig) => {
        const propPayload = propConfig.payload;
        const sourceIdentifiers = propConfig.sourceIdentifiers;
        const dataObj = selectionDataModel.getData();
        let schema = dataObj.schema;
        const payload = Object.assign({}, propPayload);
        schema = dataObj.schema;
        const data = dataObj.data;
        const sourceFields = schema.map(d => d.name);
        payload.criteria = !sourceIdentifiers && selectionDataModel.isEmpty() ? null :
                [sourceFields, ...data];
        payload.sourceFields = sourceIdentifiers ? sourceIdentifiers.fields.map(d => d.name) : [];
        return payload;
    },
    brush: (dm, propConfig) => {
        const { criteria } = propConfig;
        return {
            criteria: criteria ? criteria.range : criteria
        };
    }
};

