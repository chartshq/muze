/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import DSVArr from './dsv-arr';

describe('DSVArr Converter', () => {
    describe('#DSVArr', () => {
        it('should parse the DSV array data with header names', () => {
            const data = [
            ['a', 'b', 'c'],
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            ];
            const option = {
                firstRowHeader: true
            };

            const parsedData = DSVArr(data, option);
            const expected = [['a', 'b', 'c'], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];

            expect(parsedData).to.deep.equal(expected);
        });

        it('should parse the DSV array data without header names', () => {
            const data = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            const option = {
                firstRowHeader: false
            };

            const parsedData = DSVArr(data, option);
            const expected = [[], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];

            expect(parsedData).to.deep.equal(expected);
        });

        it('should parse the DSV array data with default options', () => {
            // With header names
            let data = [
                ['a', 'b', 'c'],
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            let parsedData = DSVArr(data);
            let expected = [['a', 'b', 'c'], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];
            expect(parsedData).to.deep.equal(expected);

            // Without header names
            data = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            parsedData = DSVArr(data);
            expected = [[1, 2, 3], [[4, 7], [5, 8], [6, 9]]];
            expect(parsedData).to.deep.equal(expected);
        });
    });
});
