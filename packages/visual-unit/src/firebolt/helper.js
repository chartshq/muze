import { SpawnableSideEffect } from '@chartshq/muze-firebolt';
import { FieldType, defaultValue } from 'muze-utils';

export const initSideEffects = (sideEffects, firebolt) => {
    for (const key in sideEffects) {
        if ({}.hasOwnProperty.call(sideEffects, key)) {
            sideEffects[key] instanceof SpawnableSideEffect && sideEffects[key].drawingContext(() => {
                const context = firebolt.context;
                return context.getDrawingContext();
            });
            sideEffects[key].valueParser(firebolt.context.valueParser());
        }
    }
};

export const clearActionHistory = (context) => {
    const actionHistory = context._actionHistory;
    for (const key in actionHistory) {
        if (actionHistory[key].isMutableAction) {
            delete context._actionHistory[key];
        }
    }
};

export const dispatchQueuedSideEffects = (context) => {
    const queuedSideEffects = context._queuedSideEffects;
    Object.entries(queuedSideEffects).forEach((entry) => {
        const sideEffect = entry[1];
        context.dispatchSideEffect(sideEffect.name, ...sideEffect.params);
    });
    context._queuedSideEffects = {};
};

export const isSideEffectEnabled = (firebolt, { se, propagationInf }) => {
    const sideEffectPolicies = firebolt._sideEffectPolicies;
    const sideEffectCheckers = Object.values(sideEffectPolicies[se.name || se] || {});
    const { sourceIdentifiers, data: propagationData } = propagationInf;
    return sideEffectCheckers.length ? sideEffectCheckers.every(checker =>
        checker(propagationInf.propPayload, firebolt, {
            sourceIdentifiers,
            propagationData
        })) : true;
};

const getUniqueKeys = (data, { layers, uids, keys = {}, dimensionsMap = {}, dimensions }) => {
    data.forEach((row, i) => {
        const key = [uids[i]];
        const dims = dimensions.map(d => row[d.index]);
        layers.forEach((layer) => {
            const measureNames = Object.keys(layer.data().getFieldspace().getMeasure());
            const mKey = `${[key, ...measureNames]}`;
            keys[mKey] = defaultValue(keys[mKey], {});
            keys[mKey] = {
                dims,
                measureNames,
                uid: uids[i]
            };
            dimensionsMap[key] = defaultValue(dimensionsMap[key], []);
            measureNames.length && dimensionsMap[key].push(measureNames);
        });
    });

    return {
        keys,
        dimensionsMap
    };
};

export const prepareSelectionSetMap = ({ data, uids, dimensions }, layers, maps = {}) => {
    const obj = getUniqueKeys(data, {
        layers,
        uids,
        keys: maps.keys,
        dimensions,
        dimensionsMap: maps.dimensionsMap
    });

    return {
        keys: obj.keys,
        dimensionsMap: obj.dimensionsMap
    };
};

export const prepareSelectionSetData = (dataModel, unit) => {
    const { data, uids } = dataModel.getData();
    const fieldsConfig = dataModel.getFieldsConfig();
    const dimensions = Object.values(fieldsConfig).filter(d => d.def.type === FieldType.DIMENSION);
    const layers = unit.layers();
    const { keys, dimensionsMap } = prepareSelectionSetMap({ data, uids, dimensions }, layers);

    return {
        keys,
        dimensions,
        dimensionsMap
    };
};

export const dispatchSecondaryActions = (firebolt, { action, propagationData, config, propagationInf }) => {
    const context = firebolt.context;

    const secondaryActions = firebolt._connectedBehaviours[action] || [];

    secondaryActions.forEach((secAction) => {
        const payloadGeneratorFn = firebolt.getPayloadGeneratorFor(secAction);
        const generatedPayload = payloadGeneratorFn(firebolt, propagationData, config,
                        context.facetByFields());
        firebolt.dispatchBehaviour(secAction, generatedPayload, propagationInf);
    });
};

export const createMapByDimensions = (context, dm) => {
    let cacheMap = context._cacheMap = {};
    return (propDims, fieldsConfig) => {
        cacheMap = context._cacheMap;
        if (!cacheMap[propDims]) {
            cacheMap[propDims] = dm.getData({ withUid: true }).data.reduce((acc, row) => {
                const key = propDims.map(d => row[fieldsConfig[d].index]);
                acc[key] || (acc[key] = []);
                acc[key].push(row);
                return acc;
            }, {});
        }
        return cacheMap[propDims];
    };
};
