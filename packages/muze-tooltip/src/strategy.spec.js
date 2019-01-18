/* global describe, it */

import { expect } from 'chai';
import { DataModel } from 'muze-utils';
import { strategy } from './strategy';

describe('#tooltipstrategy', () => {
    it('Should not throw error when sub type is incorrect', () => {
        const dm = new DataModel([{
            dim: 'A',
            measure: 200
        }, {
            dim: 'B',
            measure: 400
        }], [{
            name: 'dim',
            type: 'dimension',
            subtype: 'datetime'
        }, {
            name: 'measure',
            type: 'measure'
        }]);

        expect(() => strategy.keyValue(dm, {}, {
            dimensionMeasureMap: {},
            axes: {
                color: [],
                shape: [],
                size: []
            }
        })).to.not.throw();
    });
});
