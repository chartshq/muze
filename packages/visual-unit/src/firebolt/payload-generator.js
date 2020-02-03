import { ReservedFields, difference, isSimpleObject, getIndexMap } from 'muze-utils';

const getIdentifierMeasureMap = (identifiers, fields, facetsMap) => {
    const identifierIdxMap = getIndexMap(identifiers[0]);
    const identifierValues = identifiers.slice(1, identifiers.length);

    return identifierValues.reduce((acc, row) => {
        let facetPresent = true;

        for (const field in facetsMap) {
            const facetVal = row[identifierIdxMap[field]];
            facetPresent = facetPresent && facetVal === facetsMap[field];
        }

        if (facetPresent) {
            const key = fields.map((field) => {
                const fieldIndex = identifierIdxMap[field];

                return row[fieldIndex];
            });
            const measureNamesIdx = identifierIdxMap[ReservedFields.MEASURE_NAMES];

            if (measureNamesIdx !== undefined) {
                const measureArr = row[measureNamesIdx];
                !acc[key] && (acc[key] = []);

                if (measureArr && measureArr.length) {
                    acc[key].push([measureArr]);
                }
            }
        }

        return acc;
    }, {});
};

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

    __default: (instance, propagationDataModel, propConfig, facetByFields = {}) => {
        let propagationDataDims = [];
        let criteria = null;

        const { payload: propPayload, sourceIdentifiers, excludeSelectedMeasures } = propConfig;
        const { data } = propagationDataModel.getData({ withUid: true });
        const payload = Object.assign({}, propPayload);
        const fieldsConfig = Object.assign({}, propagationDataModel.getFieldsConfig(), {
            [ReservedFields.ROW_ID]: {
                index: Object.keys(propagationDataModel.getFieldsConfig()).length
            }
        });

        propagationDataDims = Object.keys(propagationDataModel.getFieldspace().getDimension());
        !propagationDataDims.length && (propagationDataDims = [ReservedFields.ROW_ID]);

        if (sourceIdentifiers) {
            const identifierMap = getIdentifierMeasureMap(sourceIdentifiers.identifiers, propagationDataDims,
                facetByFields);
            const dataArr = [];

            for (let i = 0, len = data.length; i < len; i++) {
                const row = data[i];
                const dims = [];

                propagationDataDims.forEach((field) => {
                    const idx = fieldsConfig[field].index;
                    dims.push(row[idx]);
                });
                const uid = row[row.length - 1];
                const dimKey = `${dims}`;

                if (dimKey in identifierMap) {
                    const measures = identifierMap[dimKey];
                    const allMeasures = instance._metaData.dimensionsMap[uid];

                    if (excludeSelectedMeasures) {
                        const diffMeasures = difference(allMeasures, measures);
                        diffMeasures.forEach((measureArr) => {
                            dataArr.push([...dims, measureArr]);
                        });
                    } else if (measures && measures.length) {
                        measures.forEach((measureArr) => {
                            dataArr.push([...dims, measureArr]);
                        });
                    } else {
                        dataArr.push([...dims, []]);
                    }
                } else {
                    dataArr.push([...dims, []]);
                }
            }

            criteria = [[...propagationDataDims, ReservedFields.MEASURE_NAMES], ...dataArr];
        }

        payload.criteria = criteria;
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
