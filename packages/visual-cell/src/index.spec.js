/* global describe, it, */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import SimpleCell from './simple-cell';
import { SIMPLE } from './enums/cell-type';

const simpleCell = new SimpleCell();
describe('Simple Cell', () => {
    it('tests construction of the simple cell', () => {
        expect(simpleCell.type).to.deep.equal(SIMPLE);
    });
    it('tests getting the value of simple cell', () => {
        expect(() => { simpleCell.valueOf(); }).to.throw('Method not implemented');
    });
    it('tests getting unique identifier of simple cell', () => {
        expect(() => { simpleCell.id(); }).to.throw('Method not implemented');
    });
    it('tests serialization of simple cell', () => {
        expect(() => { simpleCell.serialize(); }).to.throw('Method not implemented');
    });
    it('tests getting the logical space of simple cell', () => {
        expect(() => { simpleCell.getLogicalSpace(); }).to.throw('Method not implemented');
    });
    it('tests setting available space on simple cell', () => {
        expect(() => { simpleCell.setAvailableSpace(); }).to.throw('Method not implemented');
    });
    it('tests setting render on simple cell', () => {
        expect(() => { simpleCell.render(); }).to.throw('Method not implemented');
    });
    it('tests setting remove on simple cell', () => {
        expect(() => { simpleCell.remove(); }).to.throw('Method not implemented');
    });
});
