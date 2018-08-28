/* global describe, it, before */

import { expect } from 'chai';
import { DataModel } from 'muze-utils';

import { muze } from './';
import TransactionSupport from './transaction-support';
import Canvas from './canvas';

describe('#muze', () => {
    it('should be an function', () => {
        expect(muze).instanceOf(Function);
    });

    it('should have global config setter getters which the instance will get', () => {
        expect(muze()).to.contain.keys(['data', 'width', 'height', 'config']);
    });

    describe('#settings', () => {
        it('should retrieve the global settings', () => {
            expect(muze().settings()).to.deep.equal({
                data: null,
                width: 0,
                height: 0,
                config: null
            });
        });

        it('should update the settings', () => {
            const factory = muze().height(100).width('200px').config({ cls: 'muze' });
            expect(factory.settings()).to.deep.equal({
                data: null,
                width: 200,
                height: 100,
                config: { cls: 'muze' }
            });
        });
    });

    describe('#instance', () => {
        it('should return instance of an canvas', () => {
            const factory = muze();
            expect(factory.instance()).instanceOf(Canvas);
        });
    });
});

describe('#TransactionSupport', () => {
    it('should be an interface', () => {
        const support = new TransactionSupport();
        expect(support.data.bind(support)).to.throw(Error, /Class not implemented/);
        expect(support.height.bind(support)).to.throw(Error, /Class not implemented/);
        expect(support.width.bind(support)).to.throw(Error, /Class not implemented/);
        expect(support.config.bind(support)).to.throw(Error, /Class not implemented/);
    });
});

describe('#Canvas', () => {
    let canvas;

    before(() => {
        canvas = new Canvas();
    });

    it('should implement TransactionSupport', () => {
        expect(canvas).instanceof(TransactionSupport);
    });

    it('should implement all the methods of TransactionSupport', () => {
        expect(canvas.width).instanceof(Function);
        expect(canvas.height).instanceof(Function);
        expect(canvas.config).instanceof(Function);
        expect(canvas.data).instanceof(Function);
    });

    describe('Property accessors', () => {
        let data;
        let schema;
        let datamodel;

        before(() => {
            data = [
                { profit: 10, sales: 20, city: 'kol', state: 'wb' },
                { profit: 15, sales: 25, city: 'dgp', state: 'wb' },
                { profit: 10, sales: 20, city: 'bang', state: 'kar' },
                { profit: 15, sales: 25, city: 'mang', state: 'kar' }
            ];
            schema = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'state', type: 'dimension' }
            ];
            datamodel = new DataModel(data, schema, 'Yo');
        });

        describe('#data', () => {
            it('should not set property if an unexpected value is passed', () => {
                expect(canvas.data({ })).instanceOf(Canvas);
                expect(canvas.data()).to.equal(null);
            });

            it('should act as a property accessor of data member of the class', () => {
                expect(canvas.data(datamodel)).instanceOf(Canvas);
                expect(canvas.data()).instanceOf(DataModel);
            });
        });

        describe('#width', () => {
            it('should not set property if an unexpected value is passed', () => {
                expect(canvas.width('abcd')).instanceof(Canvas);
                expect(canvas.width()).to.equal(0);
            });

            it('should act as a property accessor of width member of the class', () => {
                expect(canvas.width('100px')).instanceOf(Canvas);
                expect(canvas.width()).to.equal(100);
            });
        });

        describe('#height', () => {
            it('should not set property if an unexpected value is passed', () => {
                expect(canvas.height('abcd')).instanceof(Canvas);
                expect(canvas.height()).to.equal(0);
            });

            it('should act as a property accessor of height member of the class', () => {
                expect(canvas.height(80)).instanceOf(Canvas);
                expect(canvas.height()).to.equal(80);
            });
        });

        describe('#config', () => {
            it('should not set property if an unexpected value is passed', () => {
                expect(canvas.config('abcd')).instanceof(Canvas);
                expect(canvas.config()).to.equal(null);
            });

            it('should act as a property accessor of config member of the class', () => {
                expect(canvas.config({ cls: 'muze' })).instanceOf(Canvas);
                expect(canvas.config()).to.deep.equal({ cls: 'muze' });
            });
        });

        describe('#rows', () => {
            it('should act as a property accessor of the row member of the class', () => {
                expect(canvas.rows(['var1'])).instanceof(Canvas);
                expect(canvas.rows()).to.deep.equal(['var1']);
            });
        });

        describe('#columns', () => {
            it('should act as a property accessor of the columns member of the class', () => {
                expect(canvas.columns(['var2'])).instanceof(Canvas);
                expect(canvas.columns()).to.deep.equal(['var2']);
            });
        });

        describe('#color', () => {
            it('should act as a property accessor of the color member of the class', () => {
                expect(canvas.color('var3')).instanceof(Canvas);
                expect(canvas.color()).to.deep.equal('var3');
            });
        });

        describe('#shape', () => {
            it('should act as a property accessor of the shape member of the class', () => {
                expect(canvas.shape('var3')).instanceof(Canvas);
                expect(canvas.shape()).to.deep.equal('var3');
            });
        });

        describe('#size', () => {
            it('should act as a property accessor of the size member of the class', () => {
                expect(canvas.size('var3')).instanceof(Canvas);
                expect(canvas.size()).to.deep.equal('var3');
            });
        });

        // describe('#mount', () => {
        //     it('should act as a property accessor of the mount member of the class', () => {

        //     });
        // });
    });
});
