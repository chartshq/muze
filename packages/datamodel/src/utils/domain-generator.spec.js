/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import generateMeasureDomain from './domain-generator';

describe('Utils', () => {
    describe('#generateMeasureDomain', () => {
        it('should return domain for measure field', () => {
            expect(generateMeasureDomain([1, 3, 4, 5])).to.deep.equal([1, 5]);
            expect(generateMeasureDomain([-1, 2, 0])).to.deep.equal([-1, 2]);
        });
    });
});
