/* global describe, it */
/* eslint-disable no-unused-expressions,no-unused-vars */

import { expect } from 'chai';
import DataModel from '../datamodel';
import { compose, project, select, groupBy, bin } from './compose';

describe('Testing compose functionality', () => {
    const data1 = [
        { id: 1, profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
        { id: 2, profit: 20, sales: 25, first: 'Hey', second: 'Wood' },
        { id: 3, profit: 10, sales: 20, first: 'White', second: 'the sun' },
        { id: 4, profit: 15, sales: 25, first: 'White', second: 'walls' },
    ];
    const data2 = [
        { id: 1, netprofit: 100, netsales: 200, _first: 'Hello', _second: 'Jude' },
        { id: 4, netprofit: 200, netsales: 250, _first: 'Bollo', _second: 'Wood' },

    ];

    const schema1 = [
        {
            name: 'id',
            type: 'dimension'
        },
        {
            name: 'profit',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'sales',
            type: 'measure'
        },
        {
            name: 'first',
            type: 'dimension'
        },
        {
            name: 'second',
            type: 'dimension'
        },
    ];
    const schema2 = [
        {
            name: 'id',
            type: 'dimension'
        },
        {
            name: 'netprofit',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'netsales',
            type: 'measure'
        },
        {
            name: '_first',
            type: 'dimension'
        },
        {
            name: '_second',
            type: 'dimension'
        },
    ];
    describe('#compose', () => {
        it('should return same data when composed with only one function', () => {
            const dataModel = new DataModel(data1, schema1);
            const dataModel2 = new DataModel(data1, schema1);
            let composedFn = compose(
                select(fields => fields.profit.value <= 15),

            );
            let normalDm = dataModel.select(fields => fields.profit.value <= 15);
            let composedDm = composedFn(dataModel2);
            expect(normalDm.getData()).to.deep.equal(composedDm.getData());
        });

        it('should return same data when composed with select and project function', () => {
            const dataModel = new DataModel(data1, schema1);
            const dataModel2 = new DataModel(data1, schema1);
            let composedFn = compose(
                select(fields => fields.profit.value <= 15),
                project(['profit', 'sales'])
            );

            let normalDm = dataModel.select(fields => fields.profit.value <= 15);
            normalDm = normalDm.project(['profit', 'sales']);
            let composedDm = composedFn(dataModel2);
            expect(normalDm.getData()).to.deep.equal(composedDm.getData());
        });

        it('should return same data when composed with select and project and groupby function', () => {
            const dataModel = new DataModel(data1, schema1);
            const dataModel2 = new DataModel(data1, schema1);
            let composedFn = compose(
                select(fields => fields.profit.value <= 15),
                project(['profit', 'sales']),
                groupBy(['profit'])
            );

            let normalDm = dataModel.select(fields => fields.profit.value <= 15);
            normalDm = normalDm.project(['profit', 'sales']);
            normalDm = normalDm.groupBy(['profit']);
            let composedDm = composedFn(dataModel2);
            // debugger;
            expect(normalDm.getData()).to.deep.equal(composedDm.getData());
        });

        it('should compose bin', () => {
            const data = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' }
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');
            const bins = dataModel.bin('profit', { binSize: 5, name: 'sumField' });

            let composedFn = compose(
                bin('profit', { binSize: 5, name: 'sumField' }));

            let composedDm = composedFn(dataModel);
            expect(bins.getData()).to.deep.equal(composedDm.getData());
        });

        it('should compose bin and select', () => {
            const data = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' }
            ];
            const schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');

            const dataModel2 = new DataModel(data1, schema1, 'Yo');
            const bins = dataModel.bin('profit', { binSize: 5, name: 'sumField' });

            let selectedBin = bins.select(fields => fields.profit.value <= 15);
            let composedFn = compose(
                bin('profit', { binSize: 5, name: 'sumField' }),
                select(fields => fields.profit.value <= 15)
            );
            let composedDm = composedFn(dataModel2);
            expect(selectedBin.getData()).to.deep.equal(composedDm.getData());
        });

        it('should support nested composing', () => {
            const dataModel = new DataModel(data1, schema1);
            const dataModel2 = new DataModel(data1, schema1);
            const composedFn = compose(
                select(fields => fields.profit.value <= 15),
            );

            const nestedComposedFn1 = compose(
                composedFn,
                project(['profit', 'sales'])
            );
            let normalDm = dataModel.select(fields => fields.profit.value <= 15);
            normalDm = normalDm.project(['profit', 'sales']);
            let composedDm = nestedComposedFn1(dataModel2);
            expect(normalDm.getData()).to.deep.equal(composedDm.getData());

            const nestedComposedFn2 = compose(
                composedFn,
                bin('profit', { binSize: 5, name: 'sumField' })
            );
            normalDm = dataModel.select(fields => fields.profit.value <= 15);
            normalDm = normalDm.bin('profit', { binSize: 5, name: 'sumField' });
            composedDm = nestedComposedFn2(dataModel2);
            expect(normalDm.getData()).to.deep.equal(composedDm.getData());
        });
    });
});
