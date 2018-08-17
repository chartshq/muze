/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import FlatJSON from './flat-json';

describe('FlatJSON Converter', () => {
    describe('#FlatJSON', () => {
        it('should parse the JSON data', () => {
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

            const parsedData = FlatJSON(data);
            const expected = [['a', 'b', 'c'], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]];

            expect(parsedData).to.deep.equal(expected);
        });

        it('should handle the empty JSON data', () => {
            const data = [];

            const parsedData = FlatJSON(data);
            const expected = [[], []];

            expect(parsedData).to.deep.equal(expected);
        });
    });
});
