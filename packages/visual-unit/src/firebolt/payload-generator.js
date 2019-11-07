import { DimensionSubtype, ReservedFields, FieldType } from 'muze-utils';

const getRangeFromData = (instance, selectionDataModel, propConfig) => {
    let criteria;
    const dataObj = selectionDataModel.getData();
    const selectionDataFields = selectionDataModel.getFieldsConfig();
    const propCriteria = propConfig.payload.criteria;
    const sourceIdentifiers = propConfig.sourceIdentifiers;
    const schema = dataObj.schema;
    const fieldMap = instance.data().getFieldsConfig();
    const data = dataObj.data;
    const isActionSourceSame = instance.id() === propConfig.sourceId;

    if (isActionSourceSame) {
        criteria = propCriteria ? Object.keys(propCriteria).reduce((acc, v) => {
            if (v in selectionDataFields) {
                acc[v] = propCriteria[v];
            }
            return acc;
        }, {}) : null;
    } else {
        criteria = (sourceIdentifiers !== null) ? schema.reduce((acc, obj, index) => {
            let range;
            const field = obj.name;
            const fieldObj = fieldMap[field];
            const type = fieldObj && (fieldObj.def.subtype ? fieldObj.def.subtype : fieldObj.def.type);
            const isDimension = type === DimensionSubtype.CATEGORICAL;

            if (!fieldObj) {
                return acc;
            }

            if (!isDimension) {
                range = [Math.min(...data.map(d => d[index])), Math.max(...data.map(d => d[index]))];
            } else {
                range = data.map(d => d[index]);
            }
            acc[field] = range;
            return acc;
        }, {}) : null;
    }

    return criteria;
};

export const payloadGenerator = {
    brush: (instance, selectionDataModel, propConfig) => {
        const propPayload = propConfig.payload;
        const criteria = getRangeFromData(instance, selectionDataModel, propConfig);
        const payload = Object.assign({}, propPayload);
        payload.criteria = criteria;
        return payload;
    },

    __default: (instance, selectionDataModel, propConfig, facetByFields = []) => {
        const propPayload = propConfig.payload;
        const sourceIdentifiers = propConfig.sourceIdentifiers;
        const dataObj = selectionDataModel.getData();
        let schema = dataObj.schema;
        const payload = Object.assign({}, propPayload);
        schema = dataObj.schema;
        const data = dataObj.data;
        const fieldsConfig = selectionDataModel.getFieldsConfig();
        const sourceFields = schema.filter(d => d.type === FieldType.DIMENSION).map(d => d.name);
        if (sourceIdentifiers) {
            const [facetFields = [], facetValues = []] = facetByFields;
            const facetIndices = facetFields.reduce((acc, v, i) => {
                acc[v] = i;
                return acc;
            }, {});
            const identifierIdxMap = sourceIdentifiers.fields.reduce((acc, v, i) => {
                acc[v.name] = i;
                return acc;
            }, {});
            const identifiers = sourceIdentifiers.identifiers.slice(1, sourceIdentifiers.identifiers.length);
            const sourceIdentifierFields = sourceIdentifiers.fields.filter(d => d.name in fieldsConfig ||
                d.name in facetIndices || d.name === ReservedFields.ROW_ID);

            const identifierMap = identifiers.reduce((acc, v) => {
                const key = sourceIdentifierFields.map(d => v[identifierIdxMap[d.name]]);
                const measureNamesIdx = identifierIdxMap[ReservedFields.MEASURE_NAMES];
                if (measureNamesIdx) {
                    !acc[key] && (acc[key] = []);
                    acc[key].push([v[measureNamesIdx]]);
                }
                return acc;
            }, {});

            const dataArr = [];
            const selectionSet = instance._selectionSet[propConfig.action];
            const selectionSetFields = selectionSet._fields;
            for (let i = 0, len = data.length; i < len; i++) {
                const row = data[i];
                const dims = [];
                selectionSetFields.forEach((field) => {
                    if (fieldsConfig[field] && fieldsConfig[field].def.type === FieldType.DIMENSION) {
                        const idx = fieldsConfig[field].index;
                        dims.push(row[idx]);
                    }
                });
                const vals = `${sourceIdentifierFields.map((d) => {
                    if (d.name in fieldsConfig) {
                        return row[fieldsConfig[d.name].index];
                    } else if (d.name in facetIndices) {
                        return facetValues[facetIndices[d.name]];
                    }
                    return null;
                }).filter(d => d !== null)}`;
                if (vals in identifierMap) {
                    const measures = identifierMap[vals];
                    measures.forEach((measureArr) => {
                        dataArr.push([...dims, ...measureArr]);
                    });
                } else {
                    const measures = instance._dimensionsMap[dims] || [[]];
                    measures.forEach((measureArr) => {
                        dataArr.push([...dims, ...measureArr]);
                    });
                }
            }

            payload.criteria = [[...sourceFields, ReservedFields.MEASURE_NAMES], ...dataArr];
        } else {
            payload.criteria = null;
        }

        payload.sourceFields = sourceIdentifiers ? sourceIdentifiers.fields.map(d => d.name) : [];
        return payload;
    }
};

