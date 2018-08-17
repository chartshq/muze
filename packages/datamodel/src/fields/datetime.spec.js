/* global describe, it, before */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { DimensionSubtype } from 'muze-utils';
import { DateTimeFormatter } from '../utils';
import DateTime from './datetime';

describe('DateTime', () => {
    let field;
    const schema = {
        name: 'Date',
        type: 'dimension',
        subtype: DimensionSubtype.TEMPORAL,
        format: '%Y-%m-%d'
    };
    const data = ['2017-03-01', '2017-03-02', '2017-03-03'];

    before(() => {
        field = new DateTime(schema.name, data, schema);
    });

    describe('#subType', () => {
        it('should implement getter methods', () => {
            expect(field.subType()).to.equal(schema.subtype);
        });
    });

    describe('#parse', () => {
        it('should return parsed timestamp', () => {
            const dateStr = '2017-03-01';

            let ts = field.parse(dateStr);
            let expectedTs = new DateTimeFormatter(schema.format).getNativeDate(dateStr).getTime();
            expect(ts).to.equal(expectedTs);

            const dtf = new DateTimeFormatter(schema.format);
            field._dtf = dtf;
            ts = field.parse(dateStr);
            expectedTs = dtf.getNativeDate(dateStr).getTime();
            expect(ts).to.equal(expectedTs);

            field._dtf = undefined;
            field.schema = Object.assign({}, schema, { format: undefined });
            /** Mocked version of field.parse() method */
            const mockedParseFn = () => {
                field.parse(dateStr);
            };
            expect(mockedParseFn).not.throw(Error);
        });

        it('should parse the timestamp if date format is not given', () => {
            const alternateSchema = {
                name: 'StartDate',
                type: 'dimension',
                sybtype: DimensionSubtype.TEMPORAL
            };

            const alternateData = ['2017-09-08T05:56:40.873Z', '2017-11-15T05:17:49.842Z', '2017-12-26T03:28:04.709Z'];
            const alternateField = new DateTime(alternateSchema.name, alternateData, alternateSchema);

            expect(alternateField.data.join()).to.deep.equal(alternateData.map(d => +(new Date(d))).join());
        });
    });

    describe('#getMinDiff', () => {
        it('should correctly calculate Min diff between dates array', () => {
            field = new DateTime(schema.name, data, schema);
            let diff = field.getMinDiff();
            expect(diff).to.equal(86400000);
        });
    });
});
