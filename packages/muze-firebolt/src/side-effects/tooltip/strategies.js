import { FieldType } from 'muze-utils';

export const strategies = {
    showSelectedItems: (dm) => {
        const dataObj = dm.getData();
        const measures = dataObj.schema.filter(d => d.type === FieldType.MEASURE).map(d => d.name);
        const aggregatedModel = dm.groupBy([''], measures.reduce((acc, measure) => {
            acc[measure.name] = 'sum';
            return acc;
        }, {}));
        const fieldsConf = aggregatedModel.getFieldsConfig();
        return [
            [{
                value: `${dataObj.data.length}`,
                style: {
                    'font-weight': 'bold'
                }
            }, 'Items Selected', `(SUM) ${measures[0]}`,
            {
                value: `${aggregatedModel.getData().data[0][fieldsConf[measures[0]].index].toFixed(2)}`,
                style: {
                    'font-weight': 'bold'
                }
            }]
        ];
    }
};
