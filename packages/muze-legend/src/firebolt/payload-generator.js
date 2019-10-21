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
    payload.sourceFields = sourceIdentifiers ? sourceIdentifiers.getSchema().map(d => d.name) : [];
    return payload;
};

