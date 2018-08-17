import { FieldType, FilteringMode } from 'muze-utils';
import Field from './fields/field';
import fieldStore from './field-store';
import Value from './value';
import {
    rowDiffsetIterator,
    groupByIterator,
    projectIterator,
    selectIterator,
    calculatedVariableIterator
} from './operator';
import { DM_DERIVATIVES } from './constants';
import createFields from './field-creator';
import defaultConfig from './default-config';
import * as converter from './converter';
import { compose, select } from './operator/compose';

/**
 * Prepares the selection data.
 */
function prepareSelectionData (fields, i) {
    const resp = {};
    for (let field of fields) {
        resp[field.name] = new Value(field.data[i], field);
    }
    return resp;
}

export const updateFields = ([rowDiffset, colIdentifier], partialFieldspace, fieldStoreName) => {
    let collID = colIdentifier.length ? colIdentifier.split(',') : [];
    let partialFieldMap = partialFieldspace.fieldsObj();
    let newFields = collID.map(coll => new Field(partialFieldMap[coll], rowDiffset));
    return fieldStore.createNamespace(newFields, fieldStoreName);
};

export const persistDerivation = (model, operation, config = {}, criteriaFn) => {
    let derivative;
    if (operation !== DM_DERIVATIVES.COMPOSE) {
        derivative = {
            op: operation,
            meta: config,
            criteria: criteriaFn
        };
        model._derivation.push(derivative);
    }
    else {
        derivative = [...criteriaFn];
        model._derivation.length = 0;
        model._derivation.push(...derivative);
    }
};

export const selectHelper = (rowDiffset, fields, selectFn, config) => {
    const newRowDiffSet = [];
    let lastInsertedValue = -1;
    let { mode } = config;
    let li;
    let checker = index => selectFn(prepareSelectionData(fields, index), index);
    if (mode === FilteringMode.INVERSE) {
        checker = index => !selectFn(prepareSelectionData(fields, index));
    }
    rowDiffsetIterator(rowDiffset, (i) => {
        if (checker(i)) {
            if (lastInsertedValue !== -1 && i === (lastInsertedValue + 1)) {
                li = newRowDiffSet.length - 1;
                newRowDiffSet[li] = `${newRowDiffSet[li].split('-')[0]}-${i}`;
            } else {
                newRowDiffSet.push(`${i}`);
            }
            lastInsertedValue = i;
        }
    });
    return newRowDiffSet.join(',');
};

export const filterPropagationModel = (model, propModels, config = {}) => {
    const operation = config.operation || 'and';
    const filterByMeasure = config.filterByMeasure || false;
    let fns = [];
    if (propModels === null) {
        fns = [() => false];
    }
    else {
        fns = propModels.map(propModel => ((dataModel) => {
            let fn;
            const dataObj = dataModel.getData();
            const schema = dataObj.schema;
            const fieldsConfig = dataModel.getFieldsConfig();
            const data = dataObj.data;
            fn = (fields) => {
                let include = data.some(row => schema.every((propField) => {
                    if (!(propField.name in fields)) {
                        return true;
                    }
                    if (!filterByMeasure && propField.type !== FieldType.DIMENSION) {
                        return true;
                    }
                    const idx = fieldsConfig[propField.name].index;
                    return row[idx] === fields[propField.name].valueOf();
                }));
                return include;
            };
            return fn;
        })(propModel));
    }
    const filteredModel = operation === 'and' ? compose(...fns.map(fn => select(fn, {
        saveChild: false
    })))(model.clone(false, false), {
        saveChild: false
    }) : model.select(fields => fns.some(fn => fn(fields)));
    return filteredModel;
};

export const cloneWithSelect = (sourceDm, selectFn, selectConfig, cloneConfig) => {
    const cloned = sourceDm.clone(cloneConfig.saveChild);
    const rowDiffset = selectHelper(
        cloned._rowDiffset,
        cloned.getPartialFieldspace().fields,
        selectFn,
        selectConfig
    );
    cloned._rowDiffset = rowDiffset;
    cloned.__calculateFieldspace().calculateFieldsConfig();
    // Store reference to child model and selector function
    if (cloneConfig.saveChild) {
        persistDerivation(cloned, DM_DERIVATIVES.SELECT, { config: selectConfig }, selectFn);
    }

    return cloned;
};

export const cloneWithProject = (sourceDm, projField, config, allFields) => {
    const cloned = sourceDm.clone(config.saveChild);
    let projectionSet = projField;
    if (config.mode === FilteringMode.INVERSE) {
        projectionSet = allFields.filter(fieldName => projField.indexOf(fieldName) === -1);
    }
    // cloned._colIdentifier = sourceDm._colIdentifier.split(',')
    //                         .filter(coll => projectionSet.indexOf(coll) !== -1).join();
    cloned._colIdentifier = projectionSet.join(',');
    cloned.__calculateFieldspace().calculateFieldsConfig();
    // Store reference to child model and projection fields
    if (config.saveChild) {
        persistDerivation(
            cloned,
            DM_DERIVATIVES.PROJECT,
            { projField, config, actualProjField: projectionSet },
            null
        );
    }

    return cloned;
};

export const updateData = (relation, data, schema, options) => {
    options = Object.assign(Object.assign({}, defaultConfig), options);
    const converterFn = converter[options.dataFormat];

    if (!(converterFn && typeof converterFn === 'function')) {
        throw new Error(`No converter function found for ${options.dataFormat} format`);
    }

    const [header, formattedData] = converterFn(data, options);
    const fieldArr = createFields(formattedData, schema, header);

    // This will create a new fieldStore with the fields
    const nameSpace = fieldStore.createNamespace(fieldArr, options.name);
    relation._partialFieldspace = nameSpace;
    // If data is provided create the default colIdentifier and rowDiffset
    relation._rowDiffset = formattedData.length && formattedData[0].length ? `0-${formattedData[0].length - 1}` : '';
    relation._colIdentifier = (schema.map(_ => _.name)).join();
    return relation;
};

export const fieldInSchema = (schema, field) => {
    let i = 0;

    for (; i < schema.length; ++i) {
        if (field === schema[i].name) {
            return {
                type: schema[i].subtype || schema[i].type,
                index: i
            };
        }
    }
    return null;
};

export const propagateIdentifiers = (dataModel, propModel, config = {}, nonTraversingModel) => {
    // function to propagate to target the DataModel instance.
    const forwardPropagation = (targetDM, propagationData) => {
        propagateIdentifiers(targetDM, propagationData, config, nonTraversingModel);
    };

    dataModel !== nonTraversingModel && dataModel.handlePropagation({
        payload: config.payload,
        data: propModel,
        sourceIdentifiers: config.sourceIdentifiers,
        sourceId: config.propagationSourceId
    });

    // propagate to children created by SELECT operation
    selectIterator(dataModel, (targetDM, criteria) => {
        if (targetDM !== nonTraversingModel) {
            const selectedModel = propModel.select(criteria, {
                saveChild: false
            });
            forwardPropagation(targetDM, selectedModel);
        }
    });
    // propagate to children created by PROJECT operation
    projectIterator(dataModel, (targetDM, projField) => {
        if (targetDM !== nonTraversingModel) {
            const projModel = propModel.project(projField, {
                saveChild: false
            });
            forwardPropagation(targetDM, projModel);
        }
    });

    // propagate to children created by groupBy operation
    groupByIterator(dataModel, (targetDM, conf) => {
        if (targetDM !== nonTraversingModel) {
            const {
                    reducer,
                    groupByString,
                } = conf;
                // group the filtered model based on groupBy string of target
            const groupedPropModel = propModel.groupBy(groupByString.split(','), reducer, {
                saveChild: false
            });
            forwardPropagation(targetDM, groupedPropModel);
        }
    });

    calculatedVariableIterator(dataModel, (targetDM, ...params) => {
        if (targetDM !== nonTraversingModel) {
            const calculatedVariableModel = propModel.calculateVariable(...params, {
                saveChild: false,
                replaceVar: true
            });
            forwardPropagation(targetDM, calculatedVariableModel);
        }
    });
};

export const getRootGroupByModel = (model) => {
    if (model._parent && model._derivation.find(d => d.op !== 'group')) {
        return getRootGroupByModel(model._parent);
    }
    return model;
};

export const getRootDataModel = (model) => {
    if (model._parent) {
        return getRootDataModel(model._parent);
    }
    return model;
};

export const propagateToAllDataModels = (identifiers, rootModels, config) => {
    let criteria;
    let propModel;
    const propagationNameSpace = config.propagationNameSpace;
    const payload = config.payload;

    if (identifiers === null) {
        criteria = null;
    } else {
        criteria = [].concat(...[...Object.values(propagationNameSpace.mutableActions)
                    .map(d => Object.values(d).map(obj => obj.criteria)), identifiers]);
    }

    const rootGroupByModel = rootModels.groupByModel;
    const rootModel = rootModels.model;
    const propConfig = {
        payload,
        propagationSourceId: config.propagationSourceId,
        sourceIdentifiers: identifiers
    };

    if (rootGroupByModel) {
        propModel = filterPropagationModel(rootGroupByModel, criteria, {
            filterByMeasure: true
        });
        propagateIdentifiers(rootGroupByModel, propModel, propConfig);
    }

    propModel = filterPropagationModel(rootModel, criteria, {
        filterByMeasure: !rootGroupByModel
    });
    propagateIdentifiers(rootModel, propModel, propConfig, rootGroupByModel);
};


export const propagateImmutableActions = (propagationNameSpace, rootModels, propagationSourceId) => {
    const rootGroupByModel = rootModels.groupByModel;
    const rootModel = rootModels.model;
    const immutableActions = propagationNameSpace.immutableActions;
    for (let sourceId in immutableActions) {
        const actions = immutableActions[sourceId];
        for (let action in actions) {
            const criteriaModel = actions[action].criteria;
            propagateToAllDataModels(criteriaModel, {
                groupByModel: rootGroupByModel,
                model: rootModel
            }, {
                propagationNameSpace,
                payload: actions[action].payload,
                propagationSourceId
            });
        }
    }
};
