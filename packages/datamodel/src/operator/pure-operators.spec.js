/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { calculateVariable, sort } from './pure-operators';
import DataModel from '../index';

describe('Testing pure operators', () => {
    describe('#calculateVariable', () => {
        it('should wrap on calculateVariable() method', () => {
            const data = [
            { profit: 10, sales: 20, city: 'a', state: 'aa' },
            { profit: 15, sales: 25, city: 'b', state: 'bb' },
            { profit: 10, sales: 20, city: 'a', state: 'ab' },
            { profit: 15, sales: 25, city: 'b', state: 'ba' },
            ];
            const schema = [
            { name: 'profit', type: 'measure' },
            { name: 'sales', type: 'measure' },
            { name: 'city', type: 'dimension' },
            { name: 'state', type: 'dimension' },
            ];
            const dataModel = new DataModel(data, schema);

            const next = dataModel.project(['profit', 'sales']).select(f => +f.profit > 10);
            const child = next.calculateVariable({
                name: 'Efficiency',
                type: 'measure'
            }, ['profit', 'sales', (profit, sales) => profit / sales]);

            const wrapped = calculateVariable({
                name: 'Efficiency',
                type: 'measure'
            }, ['profit', 'sales', (profit, sales) => profit / sales])(next);

            expect(wrapped.getData()).to.deep.equal(child.getData());
        });
    });

    describe('#sort', () => {
        it('should wrap on sort() method', () => {
            const data = [
          { profit: 10, sales: 20, city: 'a', state: 'aa' },
          { profit: 15, sales: 25, city: 'b', state: 'bb' },
          { profit: 10, sales: 20, city: 'a', state: 'ab' },
          { profit: 15, sales: 25, city: 'b', state: 'ba' },
            ];
            const schema = [
          { name: 'profit', type: 'measure' },
          { name: 'sales', type: 'measure' },
          { name: 'city', type: 'dimension' },
          { name: 'state', type: 'dimension' },
            ];
            const dataModel = new DataModel(data, schema);

            const wrapped = sort([
              ['profit', 'desc']
            ])(dataModel);
            const expected = dataModel.sort([
              ['profit', 'desc']
            ]);

            expect(wrapped.getData()).to.deep.equal(expected.getData());
        });
    });
});
