/* global describe, it ,context */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import REDUCER from './reducer-store';
import { defReducer, fnList } from '../operator';

describe('Testing Reducer Functionality', () => {
    context('validate Reducer Object', () => {
        describe('#defaultReducer', () => {
            it('should return a function type as default reducer type', () => {
                expect(typeof REDUCER.defaultReducer).to.equal('function');
            });

            it('should return default reducer as sum', () => {
                expect(REDUCER.defaultReducer()).to.equal(defReducer);
            });
            it('should return updated reducer object', () => {
                REDUCER.defaultReducer(fnList.min);
                expect(REDUCER.defaultReducer()).to.equal(fnList.min);
            });
        });

        describe('#resolve', () => {
            it('should resolve correct reducer function', () => {
                REDUCER.defaultReducer(fnList.min);
                expect(REDUCER.resolve('min')).to.equal(fnList.min);
            });
        });
        let sum2 = function() {
            return 3 + 6;
        };
        let mysum = REDUCER.register('mySum', sum2);
        describe('#register', () => {
            it('check if reducer register a function correctly', () => {
                REDUCER.register('mySum', sum2);
                expect(REDUCER.resolve('mySum')).to.equal(sum2);
            });
            it('check if reducer un-register a function correctly', () => {
                mysum();
                expect(REDUCER.resolve('mySum')).to.equal(undefined);
            });
        });
    });
});
