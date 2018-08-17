/* global describe, it, beforeEach */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { FieldType } from 'muze-utils';
import PartialField from './partial-field';

describe('Partial Field Type', () => {
    const schema = {
        name: 'Miles_per_Gallon',
        type: FieldType.MEASURE,
        description: 'This is description'
    };
    // Use empty data array to mock field.parse() method
    const data = [];
    let field;

    beforeEach(() => {
        field = new PartialField(schema.name, data, schema);
    });

    describe('#data , #schema', () => {
        it('should hold data and schema references', () => {
            expect(field.data).to.deep.equal(data);
            expect(field.schema).to.deep.equal(schema);
        });
    });
    describe('#fieldName', () => {
        it('should implement fieldName getter methods', () => {
            expect(field.fieldName()).to.equal(schema.name);
        });
    });

    describe('#type', () => {
        it('should implement type getter methods', () => {
            expect(field.type()).to.equal(schema.type);
        });
    });

    describe('#description', () => {
        it('should implement description getter methods', () => {
            expect(field.description()).to.equal(schema.description);
        });
    });

    describe('#clone', () => {
        it('should clone current instance with new data', () => {
            const newData = [];
            const cloned = field.clone(newData);

            expect(cloned.data).to.deep.equal(newData);
            expect(cloned.schema).to.deep.equal(field.schema);

            expect(cloned.fieldName()).to.equal(field.fieldName());
            expect(cloned.type()).to.equal(field.type());
            expect(cloned.description()).to.equal(field.description());
        });

        it('should clone current instance without new data', () => {
            const cloned = field.clone();

            expect(cloned.data).to.deep.equal(field.data);
            expect(cloned.schema).to.deep.equal(field.schema);

            expect(cloned.fieldName()).to.equal(field.fieldName());
            expect(cloned.type()).to.equal(field.type());
            expect(cloned.description()).to.equal(field.description());
        });
    });
});
