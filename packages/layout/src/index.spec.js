/* global describe, it */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import * as Layout from './index';

describe('layout module test suite', () => {
    it('tests root module export', () => {
        expect(
      typeof Layout === 'object'
    ).to.be.true;
    });
});
