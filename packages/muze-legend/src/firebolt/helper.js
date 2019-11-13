import { FieldType } from 'muze-utils';
import { propagationBehaviourMap } from './action-behaviour-map';
import { propagationSideEffects } from './behaviour-effect-map';

export const propagate = (firebolt, action, identifiers) => {
    const context = firebolt.context;
    const data = context.metaData();

    const propPayload = {};
    propPayload.action = propagationBehaviourMap[action] || action;
    propPayload.sideEffects = propagationSideEffects[action];
    propPayload.sourceCanvas = context.canvasAlias();
    const isMutableAction = firebolt._actions.behavioural[propPayload.action].constructor.mutates();

    let propagateInterpolatedValues = false;

    if (identifiers) {
        const schema = identifiers.fields;
        propagateInterpolatedValues = schema.every(d => d.type === FieldType.MEASURE);
    }

    const propConfig = {
        sourceId: firebolt.id(),
        payload: propPayload,
        criteria: propPayload.criteria === null ? null : identifiers,
        isMutableAction,
        propagateInterpolatedValues,
        action: propPayload.action
    };

    data.propagate(identifiers, Object.assign({}, propConfig, {
        action,
        enabled: (propConf, fireboltInst) => propConf.sourceId === fireboltInst.id(),
        isMutableAction: false
    }), false);

    if (action !== propPayload.action) {
        data.propagate(identifiers, Object.assign({}, propConfig, {
            propagateToSource: false,
            enabled: (propConf, fireboltInst) => propConf.sourceId !== fireboltInst.id()
        }), true, {
            filterImmutableAction: actionInf => actionInf.sourceId !== firebolt.id()
        });
    }
};

export const payloadGenerator = (selectionDataModel, propConfig) => {
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
};

