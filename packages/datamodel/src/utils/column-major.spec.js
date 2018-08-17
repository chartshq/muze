/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import columnMajor from './column-major';

describe('Utils', () => {
    describe('#columnMajor', () => {
        it('should return a push function', () => {
            let store = [];
            let pushFn = columnMajor(store);
            pushFn(...[1, 2, 3]);
            pushFn(...[11, 12, 13]);
            pushFn(...[21, 22, 23]);
            let expected = [[1, 11, 21], [2, 12, 22], [3, 13, 23]];
            expect(store).to.deep.equal(expected);

            store = [];
            pushFn = columnMajor(store);
            pushFn(...[1, 2, 3]);
            pushFn(...[11, 12, 13]);
            pushFn(...[21, 22, 23, 24]);
            expected = [[1, 11, 21], [2, 12, 22], [3, 13, 23], [undefined, undefined, 24]];
            expect(store).to.deep.equal(expected);
        });
    });
});
