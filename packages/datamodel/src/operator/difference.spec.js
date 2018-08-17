/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { difference } from './difference';
import DataModel from '../index';

const data1 = [
    { profit: 10, sales: 20, city: 'a', state: 'aa' },
    { profit: 15, sales: 25, city: 'b', state: 'bb' },
    { profit: 10, sales: 20, city: 'a', state: 'ab' },
    { profit: 15, sales: 25, city: 'b', state: 'ba' },
];
const schema1 = [
    { name: 'profit', type: 'measure' },
    { name: 'sales', type: 'measure' },
    { name: 'city', type: 'dimension' },
    { name: 'state', type: 'dimension' },
];
const data2 = [
    { profit: 10, sales: 20, city: 'a', state: 'ab' },
    { profit: 15, sales: 25, city: 'b', state: 'ba' },
    { profit: 10, sales: 20, city: 'a', state: 'ala' },
    { profit: 15, sales: 25, city: 'b', state: 'baa' },
];
const schema2 = [
    { name: 'profit', type: 'measure' },
    { name: 'sales', type: 'measure' },
    { name: 'city', type: 'dimension' },
    { name: 'state', type: 'dimension' },
];

describe('Checking difference', () => {
    describe('#difference', () => {
        it('should return difference between to datamodels having same schema', () => {
            const dataModel1 = (new DataModel(data1, schema1, 'ModelA')).project(['city', 'state']);
            const dataModel2 = (new DataModel(data2, schema2, 'ModelB')).project(['city', 'state']);
            const differenceDataModel = difference(dataModel1, dataModel2);
            expect(differenceDataModel.getData()).to.deep.equal({
                schema: [
                { name: 'city', type: 'dimension' },
                { name: 'state', type: 'dimension' },
                ],
                data: [
                ['a', 'aa'],
                ['b', 'bb'],
                ],
                uids: [0, 1]
            });
        });
    });
});
