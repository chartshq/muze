/* global describe, it */
import { expect } from 'chai';
import { dataSelect } from './index';

describe('Data system Methods Test', () => {
    it('tests datasystem functionality', () => {
        const createSelection = (sel, appendObj, data, idFn) => {
            let selection = sel || dataSelect(idFn);

            // data = [{ val: 0 }, { val: 1} ];
            selection = selection.data(data);

            const enter = selection.enter().append(appendObj);
            const mergedSelection = enter.merge(selection);

            selection.exit() && selection.exit().remove();
            return mergedSelection;
        };

        class Layer {
            constructor (d) {
                this.data = d;
            }

            remove () {

            }
        }

        it('should return entry set data', () => {
            let sel = null;
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }, { val: 1 }], d => d.val);
            expect(sel.getObjects().map(d => d.data)).to.equal([{ val: 0 }, { val: 1 }]);
        });

        it('should return update set data excluding exit set', () => {
            let sel = null;
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }, { val: 1 }], d => d.val);
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }, { val: 2 }], d => d.val);
            expect(sel.getObjects().map(d => d.data)).to.equal([{ val: 0 }, { val: 2 }]);
        });

        it('should return all data', () => {
            let sel = null;
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }, { val: 1 }], d => d.val);
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }, { val: 1 }, { val: 2 }], d => d.val);
            expect(sel.getObjects().map(d => d.data)).to.equal([{ val: 0 }, { val: 1 }, { val: 2 }]);
        });

        it('should return updated data', () => {
            let sel = null;
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }, { val: 1 }], d => d.val);
            sel = createSelection(sel, d => new Layer(d), [{ val: 0 }], d => d.val);
            expect(sel.getObjects().map(d => d.data)).to.equal([{ val: 0 }]);
        });
    });
});
