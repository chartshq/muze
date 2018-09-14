/* global describe, it, document */
/* eslint-disable no-unused-expressions */
import { Smartlabel } from 'muze-utils';
import { expect } from 'chai';
import TextCell from './text-cell';
import { TEXT } from './enums/cell-type';
import { CLASSPREFIX } from './enums/constants';

const sm = new Smartlabel(200);
const text = new TextCell({}, {
    labelManager: sm
}).source('Hey Judey');
const header = new TextCell({ type: 'header' }, {
    labelManager: sm
}).source('Hey Jude');
describe('Header Cell', () => {
    it('tests construction of the header cell', () => {
        expect(header instanceof TextCell).to.be.true;
    });
    it('tests construction of the text cell', () => {
        expect(text instanceof TextCell).to.be.true;
    });
    it('tests construction of the text cell', () => {
        expect(text.type).to.deep.equal(TEXT);
    });
    it('tests classname of the header cell', () => {
        expect(text._className).to.deep.equal(`${CLASSPREFIX}-text-cell`);
    });
    it('tests classname of the header cell', () => {
        expect(header._className).to.deep.equal(`${CLASSPREFIX}-header-cell`);
    });
    it('tests getting the value of header cell', () => {
        expect(
            header.valueOf() === 'Hey Jude'
        ).to.be.true;
    });
    it('tests setting source of text cell', () => {
        header.source('HELLO');
        expect(
            header.source()
        ).to.deep.equal('HELLO');
    });
    it('tests setting config of text cell', () => {
        header.config({ show: true });
        expect(
            header.config().show
        ).to.deep.equal(true);
    });
    it('tests getting unique identifier of header cell', () => {
        expect(
            typeof header.id === 'string'
        ).to.be.true;
    });
    it('tests serialization of header cell', () => {
        expect(
            typeof header.serialize() === 'object'
        ).to.be.true;
    });
    it('tests getting the logical space of header cell', () => {
        const {
            width,
            height
        } = header.getLogicalSpace();
        expect(
            typeof (width + height) === 'number'
        ).to.be.true;
    });
    it('tests setting available space on header cell', () => {
        expect(
             header.setAvailableSpace(10, 10)
        ).to.not.throw;
    });
    it('tests rendering text cell', () => {
        const dom = document.createElement('div');
        dom.setAttribute('id', 'text-cell');
        expect(header.render(dom)).to.not.throw;
    });
    it('tests removing text cell', () => {
        expect(
            header.remove()
        ).to.not.throw;
    });
    it('tests no logical space of text cell when draw false', () => {
        header.config({ show: false });
        expect(
            header.getLogicalSpace()
        ).to.deep.equal({ width: 0, height: 0 });
    });
    it('tests logical space if already existing', () => {
        expect(
            header.getLogicalSpace()
        ).to.deep.equal(header._logicalSpace);
    });
});
