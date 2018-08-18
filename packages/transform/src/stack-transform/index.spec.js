import { expect } from 'chai';
import stack from './index';

/* global describe, it */

describe('Stack transform', () => {
    const data = [
            [1, 200, 'FC', 'Kolkata'],
            [2, 300, 'FB', 'Kolkata'],
            [3, 200, 'FC', 'Bangalore'],
            [4, 300, 'FB', 'Bangalore']
    ];
    const schema = [{
        name: 'id',
        type: 'identifier'
    }, {
        name: 'Downloads',
        type: 'measure'
    },
    {
        name: 'Product',
        type: 'dimension'
    },
    {
        name: 'Region',
        type: 'dimension'
    }];
    const config = {
        groupBy: 'Region',
        value: 'Downloads',
        uniqueField: 'Product'
    };
        // eslint-disable-next-line require-jsdoc
    const extractStackedValues = dataArr => dataArr.map(series => series.map(d => [d[0], d[1]]));

    it('should return two datasets stacked when schema, data and config is passed', () => {
        const stackedData = stack(schema, data, config);
        const keys = stackedData.map(d => d.key);
        expect(stackedData.length).to.equals(2);
        expect(keys).to.deep.equals(['Kolkata', 'Bangalore']);
    });

    it('should return two values for every data point in the stacked data array', () => {
        const stackedData = stack(schema, data, config);
        expect(stackedData[0][0].length).to.equals(2);
        expect(stackedData[0][1].length).to.equals(2);
        expect(stackedData[1][0].length).to.equals(2);
        expect(stackedData[1][1].length).to.equals(2);
    });

    it('should return correct stacked values when there are two data points', () => {
        const data2 = [
                [1, 200, 'FC', 'Kolkata'],
                [2, 200, 'FC', 'Bangalore']
        ];
        const stackedData = stack(schema, data2, config);
        const stackedValues = extractStackedValues(stackedData);

        expect(stackedValues).to.deep.equal([
            [[0, 200]],
            [[200, 400]]
        ]);
    });

    it('should return 3 arrays in stacked data when there are three dimensional values passed in' +
     'sort field', () => {
        const data2 = [
                [1, 'A', 2000, 'North'],
                [2, 'A', 3000, 'South'],
                [3, 'A', 2000, 'East'],
                [4, 'B', 3000, 'South'],
                [5, 'B', 2000, 'North'],
                [6, 'B', 4000, 'East'],
                [7, 'C', 3000, 'South'],
                [8, 'C', 2000, 'North'],
                [9, 'C', 2000, 'East']
        ];
        const schema2 = [{
            name: 'Product',
            type: 'dimension'
        },
        {
            name: 'Downloads',
            type: 'measure'
        },
        {
            name: 'Region',
            type: 'dimension'
        }];
        const stackedData = stack(schema2, data2, config);
        const stackedValues = extractStackedValues(stackedData);
        expect(stackedValues.length).to.equals(3);
    });

    it('should return correct stacked values when there are two data points when stack order' +
        'is specified', () => {
        const data2 = [
                [1, 200, 'FC', 'Kolkata'],
                [2, 200, 'FC', 'Bangalore']
        ];
        const config2 = {
            groupBy: 'Region',
            uniqueField: 'Product',
            value: 'Downloads',
            sort: 'descending'
        };
        const stackedData = stack(schema, data2, config2);
        const stackedValues = extractStackedValues(stackedData);

        expect(stackedValues).to.deep.equal([
            [[200, 400]],
            [[0, 200]]
        ]);
    });
});
