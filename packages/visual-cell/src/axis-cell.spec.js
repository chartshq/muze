/* global describe, it,document */
/* eslint-disable no-unused-expressions */
import { Smartlabel } from 'muze-utils';
import { BandAxis, ContinousAxis } from '@chartshq/muze-axis';
import { expect } from 'chai';
import AxisCell from './axis-cell';
import { AXIS } from './enums/cell-type';

const sm = new Smartlabel(100);
describe('Axis Cell', () => {
    const axis = new AxisCell().source({
        orientation: 'top',
        id: 'uuid_stuff',
        serialize () {
            return {};
        },
        range () {
            // shabang
        }
    });
    const axisWithPadding = new AxisCell({
        margin: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
        },
        isOffset: true
    }).source(
         new ContinousAxis({
             id: 'abc',
             field: 'a',
             range: [],
             orientation: 'bottom',
             padding: 0.2,
             showInnerTicks: false,
             showOuterTicks: false,
             style: {
                 fill: 'black'
             },
             draw: true
         }, {
             labelManager: sm
         }));
    const bandAxis = new AxisCell({
        margin: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
        },
        isOffset: true
    }).source(
         new BandAxis({
             id: 'abc',
             field: 'a',
             range: [],
             orientation: 'bottom',
             padding: 0.2,
             showInnerTicks: false,
             showOuterTicks: false,
             style: {
                 fill: 'black'
             },
             draw: true
         }, {
             labelManager: sm
         }));

    it('tests construction of axis cell', () => {
        expect(
            axis instanceof AxisCell
        ).to.be.true;
        expect(
            axisWithPadding instanceof AxisCell
        ).to.be.true;
    });
    it('tests getting the value of axis cell', () => {
        expect(
            typeof axis.valueOf() === 'string'
        ).to.be.true;
    });
    it('tests type of axis cell', () => {
        expect(
           axis.type === AXIS
        ).to.be.true;
    });
    it('tests getting the unique identifier of axis cell', () => {
        expect(
            typeof axis.id === 'string'
        ).to.be.true;
    });
    it('tests serialization of axis cell', () => {
        expect(
            typeof axis.serialize() === 'object'
        ).to.be.true;
    });
    it('tests setting available space on axis cell', () => {
        axisWithPadding.source().domain([0, 100]);
        expect(
           axisWithPadding.setAvailableSpace(1, 1)
        ).to.not.throw;
    });
    it('tests setting available space on axis cell', () => {
        bandAxis.source().domain([0, 1]);
        expect(
            bandAxis.setAvailableSpace(1, 1)
        ).to.not.throw;
    });
    it('tests getting logical space on axis cell', () => {
        expect(
           axisWithPadding.getLogicalSpace()
        ).to.not.throw;
        expect(
           bandAxis.getLogicalSpace()
        ).to.not.throw;
    });
    it('tests setting available space on axis cell with vertical axis', () => {
        const newInstance = new AxisCell().source(
            {
                orientation: 'top',
                range (width, height) {
                    return [width, height];
                }
            }
        );
        newInstance.setAvailableSpace = function (width, height) { return this.source().range(width, height); };

        expect(
            newInstance.setAvailableSpace(1, 1)
        ).to.deep.equal([1, 1]);
    });
    it('tests setting source of axis cell', () => {
        bandAxis.source(bandAxis.source());
        expect(
            bandAxis.source()
        ).to.deep.equal(bandAxis.source());
    });
    it('tests setting config of axis cell', () => {
        bandAxis.config({ show: false });
        expect(
            bandAxis.config().show
        ).to.deep.equal(false);
    });
    it('tests logical space if already existing', () => {
        expect(
            bandAxis.getLogicalSpace()
        ).to.deep.equal(bandAxis.logicalSpace());
    });
    it('tests rendering axis cell', () => {
        const dom = document.createElement('div');
        dom.setAttribute('id', 'axis-cell');
        expect(
            bandAxis.render(dom)
        ).to.not.throw;
    });
    it('tests removing axis cell', () => {
        expect(
            bandAxis.remove()
        ).to.not.throw;
    });
});
