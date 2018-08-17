/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { Measure, Categorical, DateTime } from './fields';
import createFields from './field-creator';

describe('Creating Field', () => {
    describe('#createFields', () => {
        it('should return an array of correct field instances', () => {
            const data = [
                ['India', 'China'],
                ['2018-01-01', '2018-01-01'],
                [2000000, 4800000]
            ];
            const schema = [
                { name: 'Country', type: 'dimension' },
                { name: 'Date', type: 'dimension', subtype: 'temporal', format: '%Y-%m-%d' },
                { name: 'Job', type: 'measure' }
            ];
            const headers = ['Country', 'Date', 'Job'];
            const fieldsArr = createFields(data, schema, headers);

            expect(fieldsArr.length === 3).to.be.true;
            expect(fieldsArr[0] instanceof Categorical).to.be.true;
            expect(fieldsArr[1] instanceof DateTime).to.be.true;
            expect(fieldsArr[2] instanceof Measure).to.be.true;
        });
    });
});

