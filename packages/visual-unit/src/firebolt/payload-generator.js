import { DimensionSubtype } from 'muze-utils';

const getRangeFromData = (instance, selectionDataModel, propConfig) => {
    let criteria;
    const dataObj = selectionDataModel.getData();
    const propCriteria = propConfig.payload.criteria;
    const sourceIdentifiers = propConfig.sourceIdentifiers;
    const schema = dataObj.schema;
    const fieldMap = instance.data().getFieldsConfig();
    const data = dataObj.data;
    const isActionSourceSame = instance.id() === propConfig.sourceId;

    if (isActionSourceSame) {
        criteria = propCriteria;
    } else {
        criteria = (!selectionDataModel.isEmpty() && sourceIdentifiers !== null) ? schema.reduce((acc, obj, index) => {
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

    __default: (instance, selectionDataModel, propConfig) => {
        const propPayload = propConfig.payload;
        const sourceIdentifiers = propConfig.sourceIdentifiers;
        const dataObj = selectionDataModel.getData();
        let schema = dataObj.schema;
        const payload = Object.assign({}, propPayload);
        schema = dataObj.schema;
        const data = dataObj.data;
        payload.criteria = !sourceIdentifiers || sourceIdentifiers.isEmpty() ? null : [schema.map(d => d.name),
            ...data];
        return payload;
    }
};

