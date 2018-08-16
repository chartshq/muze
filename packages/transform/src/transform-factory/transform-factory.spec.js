/* global describe, it */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import TransformFactory from './index';
import * as TransformType from '../enums/transform-type';

describe('Transform Factory', () => {
    it('should return the appropriate transform', () => {
        const transformFunction = TransformFactory(TransformType.GROUP);
        expect(
            typeof transformFunction === 'function'
        ).to.be.true;
    });
    it('should throw error with invalid transform type', () => {
        expect(
            () => TransformFactory('yo')
        ).to.throw('Invalid transform type supplied.');
    });
});
