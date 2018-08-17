/* global describe, it, beforeEach */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { FieldType } from 'muze-utils';
import Dimension from './dimension';

describe('Dimension Field Type', () => {
    const schema = {
        name: 'Country',
        type: FieldType.DIMENSION
    };
    const data = ['India', 'USA', 'Japan', 'China', 'India', 'Japan'];
    let field;

    beforeEach(() => {
        field = new Dimension(schema.name, data, schema);
    });

    describe('#domain', () => {
        it('should return dimension domain', () => {
            const domain = field.domain();
            expect(domain.sort()).to.deep.equal(['India', 'USA', 'Japan', 'China'].sort());
        });
    });

    describe('#parse', () => {
        it('should return parsed string value', () => {
            expect(field.parse('India')).to.equal('India');
            expect(field.parse(123)).to.equal('123');
            expect(field.parse(undefined)).to.equal('');
            expect(field.parse(null)).to.equal('');
        });
    });
});
