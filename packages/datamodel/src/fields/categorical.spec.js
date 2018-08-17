/* global describe, it, beforeEach */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { DimensionSubtype } from 'muze-utils';
import Categorical from './categorical';

describe('Categorical Field Type', () => {
    const schema = {
        name: 'Country',
        type: 'dimension',
        subtype: DimensionSubtype.CATEGORICAL
    };

    const data = ['India', 'USA', 'Japan', 'China', 'India', 'Japan'];
    let field;

    beforeEach(() => {
        field = new Categorical(schema.name, data, schema);
    });
    describe('#subType', () => {
        it('should implement getter methods', () => {
            expect(field.subType()).to.equal(schema.subtype);
        });
    });
});
