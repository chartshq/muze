import { FieldType } from 'muze-utils';

export const strategies = {
    showSelectedItems: (dm) => {
        const dataObj = dm.getData();
        const measures = dataObj.schema.filter(d => d.type === FieldType.MEASURE);
        const aggregatedModel = dm.groupBy([''], measures.reduce((acc, v) => {
            acc[v.name] = v.defAggFn === 'count' ? 'sum' : v.defAggFn;
            return acc;
        }, {}));
        const fieldsObj = dm.getFieldspace().fieldsObj();
        const fieldsConf = aggregatedModel.getFieldsConfig();
        let values = [{
            value: `${dataObj.data.length}`,
            style: {
                'font-weight': 'bold'
            }
        }, 'Items Selected'];
        const measureNames = measures.map(d => d.name);
        if (measureNames.length) {
            values = [...values, ...[`(${fieldsObj[measureNames[0]].defAggFn().toUpperCase()}) ${measureNames[0]}`,
                {
                    value: `${aggregatedModel.getData().data[0][fieldsConf[measureNames[0]].index].toFixed(2)}`,
                    style: {
                        'font-weight': 'bold'
                    }
                }]];
        }
        return [values];
    }
};
