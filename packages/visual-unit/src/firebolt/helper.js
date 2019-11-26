import { SpawnableSideEffect } from '@chartshq/muze-firebolt';
import { FieldType, ReservedFields, defaultValue, isSimpleObject, getObjProp } from 'muze-utils';

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

const getUniqueKeys = (data, dimensions, { layers, uids, keys = {}, dimensionsMap = {} }) => {
    data.forEach((row, i) => {
        const key = dimensions.length ? dimensions.map(d => row[d.index]) : [uids[i]];

        layers.forEach((layer) => {
            const measureNames = Object.keys(layer.data().getFieldspace().getMeasure());
            const mKey = `${[key, ...measureNames]}`;
            keys[mKey] = defaultValue(keys[mKey], {});
            keys[mKey] = {
                dims: key,
                measureNames,
                uid: uids[i]
            };
            dimensionsMap[key] = defaultValue(dimensionsMap[key], []);
            dimensionsMap[key].push(measureNames);
        });
    });

    return {
        keys,
        dimensionsMap
    };
};

export const prepareSelectionSetMap = ({ data, uids, dimensions }, layers, maps = {}) => {
    const obj = getUniqueKeys(data, dimensions, {
        layers,
        uids,
        keys: maps.keys,
        dimensionsMap: maps.dimensionsMap
    });

    return {
        keys: obj.keys,
        dimensionsMap: obj.dimensionsMap
    };
};

export const prepareSelectionSetData = (dataModel, unit) => {
    const { data, uids } = dataModel.getData();
    const dimensions = Object.values(dataModel.getFieldsConfig()).filter(d => d.def.type === FieldType.DIMENSION);
    const layers = unit.layers();
    const { keys, dimensionsMap } = prepareSelectionSetMap({ data, uids, dimensions }, layers);
    const dimensionFields = dimensions.length ? dimensions.map(d => d.def.name) : [ReservedFields.ROW_ID];
    const hasMeasures = Object.keys(dataModel.getFieldspace().getMeasure()).length;
    const measureName = hasMeasures ? [ReservedFields.MEASURE_NAMES] : [];

    return {
        keys,
        dimensions: dimensionFields,
        dimensionsMap,
        allFields: [...dimensionFields, ...measureName]
    };
};

export const sanitizePayloadCriteria = (data, propFields, { dm, dimensionsMap }) => {
    const fieldsConfig = Object.assign({}, dm.getFieldsConfig(), {
        [ReservedFields.ROW_ID]: {
            index: Object.keys(dm.getFieldsConfig()).length,
            def: {
                name: ReservedFields.ROW_ID,
                type: FieldType.DIMENSION
            }
        }
    });
    if (data === null) {
        return null;
    }

    if (isSimpleObject(data)) {
        return Object.keys(data).reduce((acc, v) => {
            if (v in fieldsConfig || v === ReservedFields.MEASURE_NAMES) {
                acc[v] = data[v];
            }
            return acc;
        }, {});
    }

    const criteriaFields = data[0];
    const fields = criteriaFields.length ? criteriaFields.map((d, i) => ({
        name: d,
        index: i
    })) : [];

    const fieldIndexMap = fields.reduce((acc, v, i) => {
        acc[v.name] = i;
        return acc;
    }, {});

    propFields = propFields || fields.map(d => d.name);
    const dataWithFacets = [
        propFields
    ];

    const measureNameField = criteriaFields.find(field => field === ReservedFields.MEASURE_NAMES);
    const propDims = fields.filter(d => d.name in fieldsConfig).map(d => d.name);

    const dimsMap = dm.getData({ withUid: true }).data.reduce((acc, row) => {
        const key = propDims.map(d => row[fieldsConfig[d].index]);
        acc[key] || (acc[key] = []);
        acc[key].push(row);
        return acc;
    }, {});

    for (let i = 1, len = data.length; i < len; i++) {
        const row = data[i];
        const dimKey = propDims.map(field => row[fieldIndexMap[field]]);
        const origRow = dimsMap[dimKey];
        if (origRow) {
            origRow.forEach((rowVal) => {
                const newRowVal = [];
                propFields.forEach((field) => {
                    if (field in fieldIndexMap) {
                        const idx = fieldIndexMap[field];
                        newRowVal.push(row[idx]);
                    } else {
                        const idx = getObjProp(fieldsConfig[field], 'index');
                        idx !== undefined && newRowVal.push(rowVal[idx]);
                    }
                });
                if (!measureNameField) {
                    const measuresArr = dimensionsMap[newRowVal].length ? dimensionsMap[newRowVal] : [[]];
                    measuresArr.forEach((measures) => {
                        dataWithFacets.push([...newRowVal, ...measures]);
                    });
                } else {
                    dataWithFacets.push(newRowVal);
                }
            });
        }
    }
    return dataWithFacets;
};
