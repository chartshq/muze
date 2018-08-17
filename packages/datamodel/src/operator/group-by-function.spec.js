/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { fnList } from './group-by-function';


describe('groupBy function tests', () => {
    describe('#sum', () => {
        it('should return sum for 1D array', () => {
            expect(fnList.sum([10, 12, 17])).to.equal(39);
        });
    });
    describe('#sum', () => {
        it('should return sum for 2D Array', () => {
            expect(fnList.sum([[10, 20], [12, 22], [27, 17]])).to.deep.equal([49, 59]);
        });
    });
    describe('#avg', () => {
        it('should return Average for 1D Array', () => {
            expect(fnList.avg([10, 12, 17])).to.equal(39 / 3);
        });
    });
    describe('#avg', () => {
        it('should return avg for 2D Array', () => {
            expect(fnList.avg([[10, 20], [12, 22], [27, 17]])).to.deep.equal([49 / 3, 59 / 3]);
        });
    });
    describe('#min', () => {
        it('should return min for 1D Array', () => {
            expect(fnList.min([10, 12, 17])).to.equal(10);
        });
    });
    describe('#min', () => {
        it('should return min for 2D Array', () => {
            expect(fnList.min([[10, 20], [12, 22], [27, 17]])).to.deep.equal([10, 17]);
        });
    });
    describe('#max', () => {
        it('should return max for 1D Array', () => {
            expect(fnList.max([10, 12, 17])).to.equal(17);
        });
    });
    describe('#max', () => {
        it('should return max for 2D Array', () => {
            expect(fnList.max([[10, 20], [12, 22], [27, 17]])).to.deep.equal([27, 22]);
        });
    });
    describe('#first', () => {
        it('should return first for 1D Array', () => {
            expect(fnList.first([10, 12, 17])).to.equal(10);
        });
    });
    describe('#first', () => {
        it('should return first for 2D Array', () => {
            expect(fnList.first([[10, 20], [12, 22], [27, 17]])).to.deep.equal([10, 20]);
        });
    });
    describe('#last', () => {
        it('should return last for 1D Array', () => {
            expect(fnList.last([10, 12, 17])).to.equal(17);
        });
    });
    describe('#last', () => {
        it('should return last for 2D Array', () => {
            expect(fnList.last([[10, 20], [12, 22], [27, 17]])).to.deep.equal([27, 17]);
        });
    });
    describe('#count', () => {
        it('should return count for 1D Array', () => {
            expect(fnList.count([10, 12, 17])).to.equal(3);
        });
    });
    describe('#count', () => {
        it('should return count for 2D Array', () => {
            expect(fnList.count([[10, 20], [12, 22], [27, 17]])).to.deep.equal([3, 3]);
        });
    });
    describe('#std', () => {
        it('should return standard deviation for 1D Array', () => {
            expect(Math.ceil(fnList.std([10, 12, 17]))).to.equal(Math.ceil(2.9));
        });
    });
});
