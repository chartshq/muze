import { FieldType, getUniqueId } from 'muze-utils';

const fieldStore = {
    data: {},

    createNamespace (fieldArr, name) {
        const dataId = name || getUniqueId();
        this.data[dataId] = {
            name: dataId,
            fields: fieldArr,
            fieldsObj () {
                const retObj = {};
                this.fields.forEach((field) => {
                    retObj[field.name] = field;
                });
                return retObj;
            },
            getMeasure () {
                const retObj = {};
                this.fields.forEach((field) => {
                    if (field.schema.type === FieldType.MEASURE) {
                        retObj[field.name] = field;
                    }
                });
                return retObj;
            },
            getDimension () {
                const retObj = {};
                this.fields.forEach((field) => {
                    if (field.schema.type === FieldType.DIMENSION) {
                        retObj[field.name] = field;
                    }
                });
                return retObj;
            },
        };
        return this.data[dataId];
    },
};

export default fieldStore;
