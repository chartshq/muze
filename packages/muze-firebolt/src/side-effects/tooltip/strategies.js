import { FieldType } from 'muze-utils';

export const strategies = {
    showSelectedItems: (dm) => {
        const dataObj = dm.getData();
        const measures = dataObj.schema.filter(d => d.type === FieldType.MEASURE).map(d => d.name);
        const aggregatedModel = dm.groupBy(['']);
        const fieldsObj = dm.getFieldspace().fieldsObj();
        const fieldsConf = aggregatedModel.getFieldsConfig();
        console.log(dataObj.data.length);
        let values = [{
            value: `${dataObj.data.length}`,
            style: {
                'font-weight': 'bold'
            }
        }, 'Items Selected'];
        if (measures.length) {
            values = [...values, ...[`(${fieldsObj[measures[0]].defAggFn().toUpperCase()}) ${measures[0]}`,
                {
                    value: `${aggregatedModel.getData().data[0][fieldsConf[measures[0]].index].toFixed(2)}`,
                    style: {
                        'font-weight': 'bold'
                    }
                }]];
        }
        return [values];
    }
};
