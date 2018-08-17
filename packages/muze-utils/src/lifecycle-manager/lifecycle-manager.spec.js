/* global describe, it */
import { expect } from 'chai';
import LifeCycleManager from './lifecycle-manager';


describe('LifeCycleManager', () => {
    let lcm = new LifeCycleManager();
    let eventName = 'canvas.initialized';
    describe('#constructor', () => {
        it('should create an instance of LifeCycleManager', () => {
            expect(lcm).to.be.an.instanceOf(LifeCycleManager);
        });

        it('should have all the event list', () => {
            expect(lcm._eventList.length).to.be.greaterThan(0);
        });

        it('should created the promises', () => {
            expect(lcm._promises.size).to.be.greaterThan(0);
        });

        it('should created notifiers', () => {
            expect(Object.keys(lcm._notifiers).length).to.be.greaterThan(0);
        });

        it('should have promise inside promise map', () => {
            let promise = lcm._promises.get(eventName);
            expect(promise).to.be.an.instanceOf(Promise);
        });

        it('should have function in notifers', () => {
            let fn = lcm._notifiers[eventName];
            expect(fn).to.be.an.instanceOf(Function);
        });

        it('should have same keys for promise map', () => {
            let keys = [...lcm._promises.keys()];
            expect(keys).to.be.deep.equal(lcm._eventList);
        });
    });
    describe('#register', () => {
        it('should set the lifecyle callbacks', () => {
            let lifeCycles = {
                canvas: {
                    initialized: (p) => {
                        p.then(() => {});
                    }
                }
            };
            lcm.register(lifeCycles);
            expect(lcm._lifeCycles).to.be.deep.equal(lifeCycles);
        });
    });
    describe('#notify', () => {
        it('should call the user given callback', () => {
            let flag = false;
            let lifeCycles = {
                canvas: {
                    initialized: (p) => {
                        flag = true;
                        p.then(() => {});
                    }
                }
            };
            lcm.register(lifeCycles);
            lcm.notify({
                client: {},
                action: 'initialized',
                formalName: 'canvas'
            });
            expect(flag).to.be.deep.equal(true);
        });
    });
    describe('#retrieve', () => {
        it('should return the promise', () => {
            let lifeCycles = {
                canvas: {
                    initialized: (p) => {
                        p.then(() => {});
                    }
                }
            };
            lcm.register(lifeCycles);
            lcm.notify({
                client: {},
                action: 'initialized',
                formalName: 'canvas'
            });
            let promise = lcm.retrieve(eventName);
            expect(promise).to.be.an.instanceOf(Promise);
        });
    });
});
