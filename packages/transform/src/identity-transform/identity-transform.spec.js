/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import identityTransform from './index';

describe('Identity transform', () => {
    it('should return data unmodified', () => {
        const data = [1, 2, 3];
        const retVal = identityTransform(null, data);
        expect(
          retVal
        ).to.deep.equal(data);
    });
});
