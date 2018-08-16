/* global describe, it */

import { expect } from 'chai';
import SelectionSet from './index';

describe('SelectionSet', () => {
    let selectionSet;
    it('Should create an instance of selection set', () => {
        selectionSet = new SelectionSet([0, 1, 2, 3, 4, 5]);
        expect(selectionSet).to.be.an.instanceOf(SelectionSet);
    });

    it('Should get correct entry set and exit set when set of ids are added in selection set', () => {
        selectionSet.add([0, 1, 2]);
        expect(selectionSet.getEntrySet()).to.deep.equals([0, 1, 2]);
        expect(selectionSet.getExitSet()).to.deep.equals([3, 4, 5]);
    });

    it('Should get correct entry set and exit set when set of ids are removed from selection set', () => {
        selectionSet.remove([2]);
        expect(selectionSet.getEntrySet()).to.deep.equals([0, 1]);
        expect(selectionSet.getExitSet()).to.deep.equals([2, 3, 4, 5]);
    });

    it('Should get correct entry set and exit set when resetted and set of ids are removed from selection set', () => {
        selectionSet.reset();
        selectionSet.remove([2]);
        expect(selectionSet.getEntrySet()).to.deep.equals([0, 1, 3, 4, 5]);
        expect(selectionSet.getExitSet()).to.deep.equals([2]);
    });

    it('Should get correct entry set and exit set when selection set is toggled', () => {
        selectionSet.toggle();
        expect(selectionSet.getEntrySet()).to.deep.equals([2]);
        expect(selectionSet.getExitSet()).to.deep.equals([0, 1, 3, 4, 5]);
    });
});

