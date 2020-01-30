import { ReservedFields, FieldType, difference, isSimpleObject } from 'muze-utils';

const getRangeFromData = (instance, selectionDataModel, propConfig) => {
    const dataObj = selectionDataModel.getData();
    const { includeMeasures = true, sourceIdentifiers } = propConfig;
    const schema = dataObj.schema;
    const fieldMap = instance.data().getFieldsConfig();
    const selectionDataFields = selectionDataModel.getFieldspace().fieldsObj();
    let criteria = null;
    if (sourceIdentifiers !== null) {
        criteria = schema.reduce((ranges, obj) => {
            const field = obj.name;
            const fieldObj = fieldMap[field];

            if (!fieldObj) {
                return ranges;
            }

            ranges[field] = selectionDataFields[field].domain();
            return ranges;
        }, {});
        const measureNamesIdx = sourceIdentifiers.identifiers[0]
            .findIndex(field => field === ReservedFields.MEASURE_NAMES);
        if (measureNamesIdx !== undefined && includeMeasures) {
            const measureNames = sourceIdentifiers.identifiers.slice(1, sourceIdentifiers.identifiers.length)
                .map(d => d[measureNamesIdx]);
            criteria[ReservedFields.MEASURE_NAMES] = measureNames.map(d => [d]);
        }
    }
    return criteria;
};

export const payloadGenerator = {
    brush: (instance, selectionDataModel, propConfig, facetByFields) => {
        const propPayload = propConfig.payload;
        let payload;
        if (isSimpleObject(propPayload.criteria)) {
            const criteria = getRangeFromData(instance, selectionDataModel, propConfig);
            payload = Object.assign({}, propPayload);
            payload.criteria = criteria;
        } else {
            payload = payloadGenerator.__default(instance, selectionDataModel, propConfig, facetByFields);
        }

        return payload;
    },

    __default: (instance, selectionDataModel, propConfig, facetByFields = []) => {
        let selectionSetFields = [];
        const { payload: propPayload, sourceIdentifiers, excludeSelectedMeasures } = propConfig;
        const dataObj = selectionDataModel.getData({ withUid: true });
        const payload = Object.assign({}, propPayload);
        const data = dataObj.data;
        const fieldsConfig = Object.assign({}, selectionDataModel.getFieldsConfig(), {
            [ReservedFields.ROW_ID]: {
                index: Object.keys(selectionDataModel.getFieldsConfig()).length,
                def: {
                    type: FieldType.DIMENSION
                }
            }
        });
        selectionSetFields = Object.keys(selectionDataModel.getFieldspace().getDimension());
        !selectionSetFields.length && (selectionSetFields = [ReservedFields.ROW_ID]);

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
            for (let i = 0, len = data.length; i < len; i++) {
                const row = data[i];
                const dims = [];
                selectionSetFields.forEach((field) => {
                    if (fieldsConfig[field] && fieldsConfig[field].def.type === FieldType.DIMENSION) {
                        const idx = fieldsConfig[field].index;
                        dims.push(row[idx]);
                    }
                });
                const uid = row[row.length - 1];
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
                    const allMeasures = instance._metaData.dimensionsMap[uid];

                    if (excludeSelectedMeasures) {
                        const fn = v => `${v}`;
                        const diffMeasures = difference(allMeasures, measures, [fn, fn]);
                        diffMeasures.forEach((measureArr) => {
                            dataArr.push([...dims, measureArr]);
                        });
                    } else {
                        measures.forEach((measureArr) => {
                            dataArr.push([...dims, measureArr]);
                        });
                    }
                } else {
                    let measures = instance._metaData.dimensionsMap[uid];
                    measures = measures && measures.length ? measures : [[]];
                    measures.forEach((measureArr) => {
                        dataArr.push([...dims, measureArr]);
                    });
                }
            }

            payload.criteria = [[...selectionSetFields, ReservedFields.MEASURE_NAMES], ...dataArr];
        } else {
            payload.criteria = null;
        }

        payload.sourceFields = sourceIdentifiers ? sourceIdentifiers.fields.map(d => d.name) : [];
        return payload;
    },
    pseudoSelect: (instance, selectionDataModel, propConfig) =>
        payloadGenerator.__default(instance, selectionDataModel, Object.assign({}, {
            excludeSelectedMeasures: true
        }, propConfig))
};

export const getPayloadGenerator = (action, criteria) => {
    if (criteria instanceof Array || !payloadGenerator[action]) {
        return payloadGenerator.__default;
    }

    return payloadGenerator[action];
};
