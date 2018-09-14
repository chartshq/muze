/* global describe, it, document */
/* eslint-disable no-unused-expressions */
import { Smartlabel } from 'muze-utils';
import { expect } from 'chai';
import { ContinousAxis } from '@chartshq/muze-axis';
import AxisCell from './axis-cell';
import TextCell from './text-cell';
import GeomCell from './geom-cell';
import { GEOM } from './enums/cell-type';

const sm = new Smartlabel(12);
const header = new TextCell({}, {
    labelManager: sm
}).source('Hey Judey');
const axis = new AxisCell({
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
         type: 'linear',
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
describe('Geom Cell', () => {
    const unitCell1 = new GeomCell({}).source(
        {
            store: {
                model: {
                    lock: () => {},
                    unlock: () => {}
                }
            },
            id () {
                return 'uuid_stuff';
            },
            serialize () {
                return {};
            },
            config () {
                return {
                    width: 1e9,
                    height: 2e5
                };
            },
            lockModel () { return this; },
            unlockModel () { return this; },
            data () { return this; },
            axes () { return this; },
            facetByFields () { return this; },
            fields () { return this; },
            transform () { return this; },
            layerDef () { return this; },
            mount () { return this; },
            remove () { return this; },
            width () { return this; },
            height () { return this; }
        }).caption(header);
    const unitWithoutCaption = new GeomCell();
    const newUnit = {
        store: {
            model: {
                lock: () => {},
                unlock: () => {}
            }
        },
        id () {
            return 'uuid_stuff';
        },
        serialize () {
            return {};
        },
        config () {
            return {
                width: 1e9,
                height: 2e5
            };
        },
        lockModel () { return this; },
        unlockModel () { return this; },
        width () { return this; },
        height () { return this; }

    };
    it('tests construction of geom cell', () => {
        expect(
            unitCell1 instanceof GeomCell
        ).to.be.true;
        expect(
            unitWithoutCaption instanceof GeomCell
        ).to.be.true;
    });
    it('tests setting source of unit cell', () => {
        unitWithoutCaption.source(newUnit);
        expect(
            unitWithoutCaption.source()
        ).to.deep.equal(newUnit);
    });
    it('tests getting the valueof geom cell', () => {
        expect(
            typeof unitCell1.valueOf() === 'object'
        ).to.be.true;
    });
    it('tests type of geom cell', () => {
        expect(
           unitCell1.type === GEOM
        ).to.be.true;
    });
    it('tests getting the unique identifier of geom cell', () => {
        expect(
            typeof unitCell1.id === 'string'
        ).to.be.true;
    });
    it('tests serialization of geom cell', () => {
        expect(
            typeof unitCell1.serialize() === 'object'
        ).to.be.true;
    });
    it('tests getting logical space of geom cell', () => {
        const {
            width,
            height
        } = unitCell1.getLogicalSpace();
        expect(
            typeof (width - height) === 'number'
        ).to.be.true;
    });
    it('tests getting logical space of geom cell without caption', () => {
        const {
            width,
            height
        } = unitWithoutCaption.getLogicalSpace();
        expect(
            typeof (width - height) === 'number'
        ).to.be.true;
    });
    it('tests setting available space on geom cell', () => {
        expect(
            unitCell1.setAvailableSpace(1, 1)
        ).to.not.throw;
    });
    it('tests setting available space on geom cell without caption', () => {
        expect(
            unitWithoutCaption.setAvailableSpace(1, 1)
        ).to.not.throw;
    });
    it('tests getting logical space on geom cell without computing', () => {
        unitWithoutCaption.logicalSpace({ width: 50, height: 50 });
        expect(
            unitWithoutCaption.getLogicalSpace()
        ).to.deep.equal({ width: 50, height: 50 });
    });
    it('tests setting fields on geom cell', () => {
        unitCell1.fields(['Jude']);
        expect(
            unitCell1.fields()
        ).to.deep.equal(['Jude']);
    });

    it('tests setting axes on geom cell', () => {
        unitCell1.axes({ xAxes: axis });
        expect(
            unitCell1.axes()
        ).to.deep.equal({ xAxes: axis });
    });
    it('tests setting layerDef on geom cell', () => {
        unitCell1.layerDef({ a: 'a' });
        expect(
            unitCell1.layerDef()
        ).to.deep.equal({ a: 'a' });
    });
    it('tests setting dataModel on geom cell', () => {
        unitCell1.data([{}, {}]);
        expect(
            unitCell1.data()
        ).to.deep.equal([{}, {}]);
    });
    it('tests setting transform on geom cell', () => {
        unitCell1.transform([]);
        expect(
            unitCell1.transform()
        ).to.deep.equal([]);
    });
    it('tests setting facets on geom cell', () => {
        unitCell1.facetByFields([]);
        expect(
            unitCell1.facetByFields()
        ).to.deep.equal([]);
    });
    it('tests setting update of model on geom cell', () => {
        expect(
            unitCell1.updateModel()
        ).to.not.throw;
    });
    it('tests logical space if already existing', () => {
        expect(
            unitCell1.getLogicalSpace()
        ).to.deep.equal(unitCell1.logicalSpace());
    });
    it('tests rendering geom cell', () => {
        expect(
            unitCell1.render(document.getElementsByTagName('body')[0])
        ).to.not.throw;
    });
    it('tests removing geom cell', () => {
        expect(
            unitCell1.remove()
        ).to.not.throw;
    });
});

