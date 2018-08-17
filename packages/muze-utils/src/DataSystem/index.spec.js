/* global describe, it */
import { expect } from 'chai';
import { dataSelect, DataObject } from './index';


describe('Data system Methods Test', () => {
    it('tests datasystem functionality', () => {
        /**
         * Current class from which selection is teseted
         * @class MyObject
         * @extends {DataObject} class
         */
        class MyObject extends DataObject {
            /**
             * Creates an instance of MyObject.
             * @param {any} number class property
             * @memberof MyObject
             */
            constructor(number) {
                super();
                this.preciousNumber = number;
            }
        }
        const source = [];

        let selection = dataSelect(source);

        const data = [1, 2, 3, 4];

        selection = selection.data(data);

        let enter = selection.enter().append(d => new MyObject(d));
        enter = enter.attr('preciousNumber', 10);

        const merge = enter.merge(selection);

        const objects = enter.getObjects();
        expect(
            objects.length === 4
        ).to.be.true;
        // update the number of elements in array to get fewer elements
        let fewerSelections = merge.data([1, 2]);
        // remove exit data
        fewerSelections.exit().remove();

        fewerSelections = fewerSelections
                        .enter()
                        .append(d => new MyObject(d))
                        .merge(fewerSelections);
        const fewerObjects = fewerSelections.getObjects();
        expect(
            fewerObjects.length === 2
        ).to.be.true;
    });
});
