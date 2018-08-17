/* global describe, it, document */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import BlankCell from './blank-cell';
import { BLANK } from './enums/cell-type';
import { DEFAULT_CONFIG } from './enums/defaults';

const blankCell = new BlankCell();
describe('blank Cell', () => {
    it('tests construction of the blank cell', () => {
        expect(blankCell.type).to.deep.equal(BLANK);
    });
    it('tests getting the value of blank cell', () => {
        expect(blankCell.valueOf()).to.deep.equal(blankCell._id);
    });
    it('tests getting unique identifier of blank cell', () => {
        expect(blankCell.id).to.deep.equal(blankCell._id);
    });
    it('tests serialization of blank cell', () => {
        expect(blankCell.serialize()).to.deep.equal({ type: BLANK });
    });
    it('tests source of blank cell', () => {
        expect(blankCell.source()).to.deep.equal(undefined);
    });
    it('tests setting source of blank cell', () => {
        expect(blankCell.source({})).to.not.throw;
    });
    it('tests config of blank cell', () => {
        blankCell.config({});
        expect(blankCell.config()).to.deep.equal(DEFAULT_CONFIG);
    });
    it('tests setting logical space of blankcell', () => {
        expect(blankCell.getLogicalSpace()).to.deep.equal({ width: 2, height: 2 });
    });
    it('tests setting logical space of cell', () => {
        blankCell.logicalSpace({ width: 100, height: 200 });
        expect(blankCell.getLogicalSpace()).to.deep.equal({ width: 100, height: 200 });
    });
    it('tests getting the logical space of blank cell', () => {
        expect(blankCell.getLogicalSpace()).to.not.throw;
    });
    it('tests setting available space on blank cell', () => {
        expect(blankCell.setAvailableSpace()).to.not.throw;
    });
    it('tests setting available space on blank cell', () => {
        expect(blankCell.setAvailableSpace(100, 100)).to.not.throw;
    });
    it('tests setting render on blank cell', () => {
        const dom = document.createElement('div');
        dom.setAttribute('id', 'blank-cell');
        expect(blankCell.render(dom)).to.not.throw;
    });
    it('tests setting remove on blank cell', () => {
        expect(blankCell.remove()).to.not.throw;
    });
});
