import { assembleModelFromIdentifiers, getDataModelFromRange } from 'muze-utils';
import { propagationBehaviourMap } from './action-behaviour-map';
import { propagationSideEffects } from './behaviour-effect-map';
import { STEP, GRADIENT, DISCRETE, MEASURE } from '../enums/constants';

export const propagate = (firebolt, action, selectionSet, config = {}) => {
    let propagationData;
    const type = firebolt.context.constructor.type();
    const payload = config.payload;
    const data = firebolt.context.data();
    const metaData = firebolt.context.metaData();
    const fieldType = metaData.getData().schema[0].type;

    const propPayload = {};
    const sourceId = firebolt.context._id;
    propPayload.action = propagationBehaviourMap[action] || action;
    propPayload.sideEffects = propagationSideEffects[action];
    propPayload.sourceCanvas = firebolt.context.canvasAlias();
    const isMutableAction = firebolt._actions.behavioural[propPayload.action].constructor.mutates();
    if (payload.criteria === null) {
        propagationData = null;
    } else {
        const entrySet = selectionSet.mergedEnter;
        let values = data.filter(d => entrySet.uids.indexOf(d.id) !== -1).map(d => d.rawVal);
        if (type === STEP || (type === DISCRETE && fieldType === MEASURE)) {
            const field = Object.keys(payload.criteria || {})[0];
            values = data.filter(d => entrySet.uids.indexOf(d.id) !== -1).map(d => d.range);
            propagationData = values.length ? metaData.select((fields) => {
                let check = false;
                for (let i = 0; i < values.length; i++) {
                    check = fields[field].value >= values[i][0] && fields[field].value <= values[i][1];
                    if (check === true) {
                        break;
                    }
                }
                return check;
            }, {
                saveChild: false
            }) : null;
        } else if (type === GRADIENT) {
            propagationData = getDataModelFromRange(metaData, payload.criteria);
        } else if (values.length) {
            propagationData = assembleModelFromIdentifiers(metaData, [payload.criteria[0], ...values.map(d => [d])]);
        } else {
            propPayload.criteria = null;
            propagationData = metaData.select(() => true, {
                saveChild: false
            });
        }
    }

    let propagateInterpolatedValues = false;

    if (propagationData) {
        const schema = propagationData.getSchema();
        propagateInterpolatedValues = schema.every(d => d.type === MEASURE);
    }

    const propConfig = {
        sourceId: `legend-${sourceId}`,
        payload: propPayload,
        criteria: propPayload.criteria === null ? null : propagationData,
        isMutableAction,
        propagateInterpolatedValues,
        action: propPayload.action
    };

    metaData.propagate(propagationData, propConfig, true);
};
