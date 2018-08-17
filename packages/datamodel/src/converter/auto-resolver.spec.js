/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import Auto from './auto-resolver';

describe('Auto Converter', () => {
    describe('#Auto', () => {
        it('should detect the JSON data', () => {
            const data = [
                {
                    a: 1,
                    b: 2,
                    c: 3
                },
                {
                    a: 4,
                    b: 5,
                    c: 6
                },
                {
                    a: 7,
                    b: 8,
                    c: 9
                }
            ];
            const emptyData = [];

            let parsedData = Auto(data);
            let expected = [['a', 'b', 'c'], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];
            expect(parsedData).to.deep.equal(expected);

            parsedData = Auto(emptyData);
            expected = [[], []];
            expect(parsedData).to.deep.equal(expected);
        });

        it('should detect the DSV array data', () => {
            let data = [
                ['a', 'b', 'c'],
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            let parsedData = Auto(data);
            let expected = [['a', 'b', 'c'], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];
            expect(parsedData).to.deep.equal(expected);

            data = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            parsedData = Auto(data, { firstRowHeader: false });
            expected = [[], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];
            expect(parsedData).to.deep.equal(expected);
        });

        it('should detect the DSV string data', () => {
            let data = 'a,b,c\n1,2,3\n4,5,6\n7,8,9';
            let parsedData = Auto(data);
            let expected = [['a', 'b', 'c'], [['1', '4', '7'], ['2', '5', '8'], ['3', '6', '9']]];
            expect(parsedData).to.deep.equal(expected);

            data = '1,2,3\n4,5,6\n7,8,9';
            parsedData = Auto(data, { firstRowHeader: false });
            expected = [[], [['1', '4', '7'], ['2', '5', '8'], ['3', '6', '9']]];
            expect(parsedData).to.deep.equal(expected);
        });

        it('should throw error on invalid data', () => {
            let data;
            const mockFn = () => { Auto(data); };
            const errMSG = 'Couldn\'t detect the data format';

            data = 2;
            expect(mockFn).to.throw(Error, errMSG);

            data = [1, 2];
            expect(mockFn).to.throw(Error, errMSG);

            data = [undefined, 3];
            expect(mockFn).to.throw(Error, errMSG);
        });
    });
});
