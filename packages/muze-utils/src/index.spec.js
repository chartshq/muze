import { expect } from 'chai';
import {
    getUniqueId,
    getDomainFromData,
    getMax,
    getMin,
    unionDomain,
    clone,
    getMinPoint,
    getMaxPoint,
    getClosestIndexOf,
    sanitizeIP,
    capitalizeFirst,
    intSanitizer,
    transactor,
    enableChainedTransaction,
    isSimpleObject
} from './';
/* global describe, it, before */

describe('Utils', () => {
    const data = [
        ['A', 1000, 200],
        ['B', 2000, 100],
        ['C', 3000, 300]
    ];

    it('Gets max from data correctly', () => {
        const max = getMax(data, 1);

        expect(max === 3000).to.be.true;
    });

    it('Gets min from data correctly', () => {
        const min = getMin(data, 1);

        expect(min === 1000).to.be.true;
    });

    it('Gets domain from data correctly', () => {
        const yDomain = getDomainFromData([data], [1, 1], 'measure');
        const xDomain = getDomainFromData([data], [0], 'dimension');
        const rangeDomain = getDomainFromData([data], [2, 1], 'measure');
        expect(yDomain).to.deep.equals([1000, 3000]);
        expect(xDomain).to.deep.equals(['A', 'B', 'C']);
        expect(rangeDomain).to.deep.equals([100, 3000]);
    });

    it('getUniqueId returns unique ids', () => {
        const uniqueId1 = getUniqueId();
        const uniqueId2 = getUniqueId();

        expect(uniqueId1 !== uniqueId2).to.be.true;
    });

    it('Should check if the object has the right properties', () => {
        const object = {
            rows: [], columns: [], values: []
        };
        const cloneObj = sanitizeIP.typeObj(['rows', 'columns', 'values'], object);
        const cloneObj2 = sanitizeIP.typeObj(['sum', 'minus'], object);
        const cloneObj3 = sanitizeIP.typeObj(['rows', 'columns'], 'hi');
        expect(cloneObj === object).to.be.true;
        expect(cloneObj2).to.be.an.instanceOf(Error);
        expect(cloneObj3).to.be.an.instanceOf(Error).with.property('message', 'Argument type object expected');
    });

    it('Should return unioned domain', () => {
        expect(unionDomain([[10, 20], [20, 100]], 'measure')).to.deep.equals([10, 100]);
        expect(unionDomain([['A', 'B'], ['C']], 'dimension')).to.deep.equals(['A', 'B', 'C']);
    });

    it('Should clone an object properly', () => {
        const obj = {
            a: {
                max: 20,
                min: 20
            },
            b: {
                max: 20,
                min: 20
            }
        };
        const newObject = clone(obj);
        expect(newObject !== obj).to.equals(true);
        expect(newObject.a !== obj.a).to.equals(true);
    });

    it('Should return max object from an array of objects', () => {
        const min = getMinPoint([{
            x: 200
        }, {
            x: 400
        }], 'x');
        expect(min).to.deep.equals({
            x: 200
        });
    });

    it('Should return max object from an array of objects', () => {
        const max = getMaxPoint([{
            x: 200
        }, {
            x: 400
        }], 'x');
        expect(max).to.deep.equals({
            x: 400
        });
    });

    it('Should return closest index from value when side is left', () => {
        const value = getClosestIndexOf([1, 20, 30], 22, 'left');
        expect(value).to.deep.equals(1);
    });

    it('Should return closest index from value when side is right', () => {
        const value = getClosestIndexOf([1, 20, 30], 29, 'right');
        expect(value).to.deep.equals(2);
    });

    it('Should return closest index from value when side is right and value is exactly same', () => {
        const value = getClosestIndexOf([1, 20, 30], 20, 'right');
        expect(value).to.deep.equals(1);
    });

    it('Should capitalize the first letter of a word', () => {
        const word = capitalizeFirst('simple');
        expect(word).to.equals('Simple');
    });

    describe('#intSanitizer', () => {
        it('Should extract the numbers from number string', () => {
            expect(intSanitizer('10')).to.equal(10);
        });

        it('Should extract the numbers from number mixed string', () => {
            expect(intSanitizer('10px')).to.equal(10);
        });

        it('Should extract the numbers from number mixed string', () => {
            expect(intSanitizer('10px')).to.equal(10);
        });

        it('Should return null when no number is passed', () => {
            expect(intSanitizer('px')).to.equal(null);
        });

        it('Should return the no if integer is passed', () => {
            expect(intSanitizer(10)).to.equal(10);
        });
    });

    describe('Transaction related', () => {
        let options;
        let holder;
        let model;
        let subject;

        /* in this section the order of test cases matte */

        before(() => {
            /**
             * Height and width setter
             *
             * @return {Object} height and width setter
             */
            function Subject () {
                let _height = null;
                let _width = null;

                return {
                    height: (val) => {
                        _height = val;
                        return this;
                    },

                    width: (val) => {
                        _width = val;
                        return this;
                    },

                    getHeight: () => _height,
                    getWidth: () => _width
                };
            }

            options = {
                data: {
                    value: null,
                    meta: {
                        typeCheck: 'constructor',
                        typeExpected: 'DataModel'
                    }
                },
                width: {
                    value: 0,
                    meta: {
                        sanitization: intSanitizer,
                        typeCheck: Number.isInteger
                    }
                },
                height: {
                    value: 0,
                    meta: {
                        sanitization: intSanitizer,
                        typeCheck: Number.isInteger
                    }
                },
                config: {
                    value: null,
                    meta: {
                        typeCheck: 'constructor',
                        typeExpected: 'Object'
                    }
                }
            };

            [holder, model] = transactor({}, options);
            subject = new Subject();
        });

        describe('#transactor', () => {
            it('should return the model with default values in place', () => {
                expect(model.serialize()).to.deep.equal({
                    data: null,
                    width: 0,
                    height: 0,
                    config: null
                });
            });

            it('should install getter setter', () => {
                holder.height(10);
                expect(holder.height()).to.equal(10);
            });

            it('should not set a value if wrong value is passed', () => {
                holder.config(null);
                expect(holder.config()).to.equal(null);
            });

            it('should use model if passed', () => {
                const [, newModel] = transactor({}, options, model);
                expect(model).to.equal(newModel);
            });
        });

        describe('#enableChainedTransaction', () => {
            it('should enable chain transactions', () => {
                enableChainedTransaction(model, subject, ['height', 'width']);
                holder.height(99);
                expect(subject.getHeight()).to.equal(99);
            });

            it('should not change the value of non changed prop', () => {
                expect(subject.getWidth()).to.equal(null);
            });

            it('should not change anything outside of transaction item', () => {
                holder.width(49);
                expect(subject.getWidth()).to.equal(49);
                expect(subject.getHeight()).to.equal(99);
            });
        });

        describe('#isSimpleObject', () => {
            it('Should return false if array is given', () => {
                const a = [1, 2, 3];
                expect(isSimpleObject(a)).to.equals(false);
            });
            it('Should return true for object', () => {
                const a = {
                    b: 2
                };
                expect(isSimpleObject(a)).to.equals(true);
            });
        });
    });
});
