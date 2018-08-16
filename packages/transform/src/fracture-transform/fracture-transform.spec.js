/* global describe, it, before */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import fracture from './index';

describe('FractureTransform', () => {
    let schema,
        data,
        originData,
        downloadData,
        webvisitData;

    before(() => {
        schema = [
            { name: 'Origin', type: 'dimension' },
            { name: 'Download', type: 'measure' },
            { name: 'Webvisit', type: 'measure' },
        ];
        originData = ['Kolkata', 'Mumbai', 'Delhi', 'Bangalore'];
        downloadData = [1000, 800, 400, 900];
        webvisitData = [800, 600, 200, 700];
        data = [
            originData,
            downloadData,
            webvisitData,
        ];
    });

    it('should break schema in one part when # of break == 1', () => {
        const [tSchema] = fracture(schema, data, {
            keys: ['Origin'],
            breaks: ['Download']
        });

        expect(tSchema.length).to.equal(1);
    });

    it('should break data in one part when # of break == 1', () => {
        const [, tData] = fracture(schema, data, {
            keys: ['Origin'],
            breaks: ['Download']
        });

        expect(tData.length).to.equal(1);
    });


    it('should break schema in n part when # of break == n where n > 1', () => {
        const [tSchema] = fracture(schema, data, {
            keys: ['Origin'],
            breaks: ['Download', 'Webvisit']
        });

        expect(tSchema.length).to.equal(2);
    });

    it('should break data in n part when # of break == n where n > 1', () => {
        const [, tData] = fracture(schema, data, {
            keys: ['Origin'],
            breaks: ['Download', 'Webvisit']
        });

        expect(tData.length).to.equal(2);
    });

    it('should contain the data form the correct part when broke using 1 field', () => {
        const [, tData] = fracture(schema, data, {
            keys: ['Origin'],
            breaks: ['Download']
        });

        expect(tData[0]).to.deep.equal([originData, downloadData]);
    });

    it('should contain the schema from the correct part when broke using 1 field', () => {
        const [tSchema] = fracture(schema, data, {
            keys: ['Origin'],
            breaks: ['Download']
        });

        expect(tSchema[0]).to.deep.equal([
            { name: 'Origin', type: 'dimension' },
            { name: 'Download', type: 'measure' },
        ]);
    });
});
