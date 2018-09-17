/* global describe, it, before */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { Smartlabel, selectElement } from 'muze-utils';
import GenericLayout from './';

describe('Generic layout', () => {
    let instance = [];
    const rowOrient = 'right';
    const columnOrient = 'top';
    before(() => {
        const slManager = new Smartlabel(0, 'body');
        instance = new GenericLayout(
            null,
            {
                width: 500,
                height: 500
            },
            {
                row: rowOrient,
                column: columnOrient
            },
            {
                slManager
            }
       );
        instance.mountPoint(selectElement('body').node());
        instance.config({
            style: { color: 'red' },
            attributes: { type: 'text' }
        });
    });

    it('tests instantiation of Generic layout', () => {
        expect(instance instanceof GenericLayout).to.be.true;
    });
    it('tests serialization of Generic layout', () => {
        expect(instance.serialize()).to.deep.equal({
            measurement: {
                height: 500,
                width: 500
            },
            config: {
                style: { color: 'red' },
                attributes: { type: 'text' },
                row: 'right',
                column: 'top'
            },
            matrices: []
        });
    });
    it('tests config setter and getter', () => {
        instance.config({
            style: { color: 'blue' },
            attributes: { type: 'text' },
            row: 'right',
            column: 'top'
        });
        expect(instance.config()).to.deep.equal({
            style: { color: 'blue' },
            attributes: { type: 'text' },
            row: 'right',
            column: 'top'
        });
    });
    it('tests matrices setter and getter', () => {
        instance.matrices({ top: [], center: [], bottom: [] });
        expect(instance.matrices()).to.deep.equal({ top: [], center: [], bottom: [] });
    });
    it('tests measurement setter and getter', () => {
        instance.measurement({
            width: 5100,
            height: 1500
        });
        expect(instance.measurement()).to.deep.equal({
            width: 5100,
            height: 1500
        });
    });
    it('tests mountPoint setter and getter', () => {
        instance.mountPoint('body');
        expect(instance.mountPoint()).to.deep.equal('body');
    });
});
