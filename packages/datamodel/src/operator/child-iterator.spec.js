/* global describe, it */
/* eslint-disable no-unused-expressions,no-unused-vars */

import { expect } from 'chai';
import { calculatedVariableIterator } from './child-iterator';
import DataModel from '../index';

const data1 = [
    { profit: 10, sales: 20, city: 'a' },
    { profit: 15, sales: 25, city: 'b' },
];
const schema1 = [
    { name: 'profit', type: 'measure' },
    { name: 'sales', type: 'measure' },
    { name: 'city', type: 'dimension' },
];

describe('Testing Child Iterator', () => {
    let dm = new DataModel(data1, schema1);
    let createdCallBack = (profit, sales) => profit / sales;
    let hasSameChild = false;
    let hasSameFunction = false;
    const child = dm.calculateVariable({
        name: 'Efficiency'
    }, ['profit', 'sales', createdCallBack]);

    let callback = (model, ...params) => {
        if (dm._children.find(childElm => childElm === model)) {
            hasSameChild = true;
        }
        if (params[1][1] === createdCallBack) {
            hasSameFunction = true;
        }
    };
    describe('#calculatedVariableIterator', () => {
        it('Should return expected child and its callback', () => {
            calculatedVariableIterator(dm, callback);
            expect(hasSameChild).to.equal(true);
            expect(hasSameFunction).to.equal(true);
        });
    });
});
