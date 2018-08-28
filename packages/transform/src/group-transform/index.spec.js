import { expect } from 'chai';
import group from './index';

/* global describe, it */

describe('Group transform', () => {
    const data = [
            [200, 'FC', 'Kolkata'],
            [300, 'FB', 'Kolkata'],
            [200, 'FC', 'Bangalore'],
            [300, 'FB', 'Bangalore']
    ];
    const schema = [{
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
        groupBy: 'Region'
    };

    it('should group the data into two datasets when dimensional values for groupby are 2', () => {
        const groupedData = group(schema, data, config);
        expect(groupedData.length).to.equals(2);
    });

    it('should group the data properly for multiple groupby fields', () => {
        const data2 = [
                [200, 'FC', 'Kolkata', 'India'],
                [300, 'FB', 'Kolkata', 'India'],
                [200, 'FC', 'Bangalore', 'India'],
                [300, 'FB', 'Bangalore', 'India'],
                [200, 'FC', 'Texas', 'USA'],
                [300, 'FB', 'Texas', 'USA'],
                [200, 'FC', 'New York', 'USA'],
                [300, 'FB', 'New York', 'USA']
        ];
        const schema2 = [{
            name: 'Downloads',
            type: 'measure'
        },
        {
            name: 'Product',
            type: 'dimension'
        },
        {
            name: 'Place',
            type: 'dimension'
        }, {
            name: 'Country',
            type: 'dimension'
        }];

        const groupedData = group(schema2, data2, {
            groupBy: ['Country', 'Place']
        });

        expect(groupedData.length).to.equals(2);
        expect(groupedData[0].values.length).to.equals(2);
        expect(groupedData[1].values.length).to.equals(2);
    });

    it('should throw error when groupby field is not found in data', () => {
        expect(
            () => group(schema, data, {
                groupBy: 'Sales'
            })).to.throw('Groupby field Sales not found in schema');
    });
});
