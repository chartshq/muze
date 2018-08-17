/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { dataBuilder } from './data-builder';
import createFields from '../field-creator';

function avg(...nums) {
    return nums.reduce((acc, next) => acc + next, 0) / nums.length;
}

describe('Checking dataBuilder', () => {
    describe('#dataBuilder', () => {
        it('should return correct data with only rowDiffset', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '0-2,4', 'profit,sales,city');
            const oriObj = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [
                    [10, 20, 'a'],
                    [15, 25, 'b'],
                    [7, 8, 'c'],
                    [20, 77, 'e'],
                ],
                uids: [0, 1, 2, 4]
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return correct data with rowDiffset and columnWise data', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '0-2,4', 'profit,sales,city', undefined, { columnWise: true });
            const oriObj = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [
                    [10, 15, 7, 20],
                    [20, 25, 8, 77],
                    ['a', 'b', 'c', 'e'],
                ],
                uids: [0, 1, 2, 4]
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return blank data but full schema when inputs is blank data', () => {
            const data = [];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '', 'profit,sales,city');
            const oriObj = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [],
                uids: []
            };
            expect(expObj).to.deep.equal(oriObj);
        });
        it('should return blank data and schema when schema is blank', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '', '');
            const oriObj = {
                schema: [],
                data: [],
                uids: []
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return correct data with only column filter', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '0-2,4', 'sales,city');
            const oriObj = {
                schema: [
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [
                    [20, 'a'],
                    [25, 'b'],
                    [8, 'c'],
                    [77, 'e'],
                ],
                uids: [0, 1, 2, 4]
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return all data when rowDiffset is is all rows ', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '0-5', 'profit,sales,city');
            const oriObj = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [
                    [10, 20, 'a'],
                    [15, 25, 'b'],
                    [7, 8, 'c'],
                    [9, 40, 'd'],
                    [20, 77, 'e'],
                    [35, 9, 'f'],
                ],
                uids: [0, 1, 2, 3, 4, 5]
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return no data when rowDiffset is empty', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '', 'profit,sales,city');
            const oriObj = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [],
                uids: []
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return new schema order when new schema order is provided', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '0-5', 'city,profit,sales');
            const oriObj = {
                schema: [
                    { name: 'city', type: 'dimension' },
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                ],
                data: [
                    ['a', 10, 20],
                    ['b', 15, 25],
                    ['c', 7, 8],
                    ['d', 9, 40],
                    ['e', 20, 77],
                    ['f', 35, 9],
                ],
                uids: [0, 1, 2, 3, 4, 5]
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should return empty data when rowDiffset is wrong', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const expObj = dataBuilder(fieldsArr, '5-0', 'profit,sales,city');
            const oriObj = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [],
                uids: []
            };
            expect(expObj).to.deep.equal(oriObj);
        });

        it('should sort the data with input sorting function', () => {
            const data = [
                [10, 15, 7, 9, 20, 35],
                [20, 25, 8, 40, 77, 9],
                ['a', 'b', 'c', 'd', 'e', 'f'],
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const fieldsArr = createFields(data, schema);
            const retData = dataBuilder(
                fieldsArr,
                '0-2,4',
                'profit,sales,city',
                [
                    ['profit', (a, b) => a - b]
                ]
            );
            const expected = {
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                ],
                data: [
                    [7, 8, 'c'],
                    [10, 20, 'a'],
                    [15, 25, 'b'],
                    [20, 77, 'e'],
                ],
                uids: [2, 0, 1, 4]
            };
            expect(retData).to.deep.equal(expected);
        });

        it('should sort the data with another fields', () => {
            const data = [
                ['low', 'high', 'medium', 'low', 'medium', 'decent'],
                [100, 400, 20, 50, 660, 30],
                [2, 1, 1.5, 4, 5, 0.5]
            ];
            const schema = [
                { name: 'performance', type: 'dimension' },
                { name: 'horsepower', type: 'measure' },
                { name: 'weight', type: 'measure' }
            ];
            const fieldsArr = createFields(data, schema);

            let retData = dataBuilder(
                fieldsArr,
                '0-5',
                'performance,horsepower,weight',
                [
                    ['performance', ['horsepower', (a, b) => avg(...a.horsepower) - avg(...b.horsepower)]],
                    ['horsepower', 'asc']
                ]
            );
            let expected = {
                schema: [
                    { name: 'performance', type: 'dimension' },
                    { name: 'horsepower', type: 'measure' },
                    { name: 'weight', type: 'measure' }
                ],
                data: [
                    ['decent', 30, 0.5],
                    ['low', 50, 4],
                    ['low', 100, 2],
                    ['medium', 20, 1.5],
                    ['medium', 660, 5],
                    ['high', 400, 1]
                ],
                uids: [5, 3, 0, 2, 4, 1]
            };
            expect(retData).to.deep.equal(expected);

            retData = dataBuilder(
                fieldsArr,
                '0-5',
                'performance,horsepower,weight',
                [
                    ['performance', ['horsepower', 'weight',
                        (a, b) => (avg(...a.horsepower) * avg(...a.weight))
                            - (avg(...b.horsepower) * avg(...b.weight))]],
                    ['horsepower', 'desc']
                ]
            );
            expected = {
                schema: [
                    { name: 'performance', type: 'dimension' },
                    { name: 'horsepower', type: 'measure' },
                    { name: 'weight', type: 'measure' }
                ],
                data: [
                    ['decent', 30, 0.5],
                    ['low', 100, 2],
                    ['low', 50, 4],
                    ['high', 400, 1],
                    ['medium', 660, 5],
                    ['medium', 20, 1.5]
                ],
                uids: [5, 0, 3, 1, 4, 2]
            };
            expect(retData).to.deep.equal(expected);
        });
    });
});
