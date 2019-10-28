/* global describe, it */

import { expect } from 'chai';
import {
  getStackedSum,
  isStackedBar
} from './strategies';

describe('#tooltipstrategy', () => {
    // FAULTY TESTCASE
    // it('Should not throw error when sub type is incorrect', () => {
    //     const dm = new DataModel([{
    //         dim: 'A',
    //         measure: 200
    //     }, {
    //         dim: 'B',
    //         measure: 400
    //     }], [{
    //         name: 'dim',
    //         type: 'dimension',
    //         subtype: 'datetime'
    //     }, {
    //         name: 'measure',
    //         type: 'measure'
    //     }]);
    //     const strategy = strategies.highlightSummary;
    //     expect(() => strategy.keyValue(dm, {}, {
    //         dimensionMeasureMap: {},
    //         axes: {
    //             color: [],
    //             shape: [],
    //             size: []
    //         }
    //     })).to.not.throw();
    // });
    it('# getStackedSum', () => {
        const array = [
            [
                315.5,
                '1970-01-01',
                'USA'
            ],
            [
                100,
                '1970-01-01',
                'European Union'
            ],
            [
                29.5,
                '1970-01-01',
                'Japan'
            ]
        ];
        let sum = 0;
        array.map((a) => {
            sum += a[0];
            return a;
        });
        expect(getStackedSum(array, 0)).to.equals(sum);
    });
    it('#isStackedBar', () => {
        const transformType = () => 'stack';
        expect(isStackedBar([{ transformType }])).to.equals(true);
    });
});
