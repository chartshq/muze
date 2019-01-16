import EVENT_LIST from './event-list';
import { createPromise } from './helper';

/**
 * At first call it accepts one function
 * calling it second time accepts notification object.
 * notification object then called with first accepted function
 *
 * @param {Function} resolveFn a promise's resolve function
 * @return {Function} a function to accept notification object
 */
const resolver = resolveFn => notification => resolveFn(notification);

/**
 * Checks if the property string is present in the source object
 *
 * @param {Object} source source object whom you want to check the property
 * @param {string} property key name that need to be checked
 * @return {boolean} returns true if the property found in the source object
 */
const hasOwn = (source, property) => Object.prototype.hasOwnProperty.call(source, property);

/**
 * LifeCycleManager which goes as a dependendecy to a muze
 * it accepts notification from the entire library throughout
 * the exeecution life
 *
 * @export
 * @class LifeCycleManager
 */
export default class LifeCycleManager {

    /**
     * Creates an instance of LifeCycleManager.
     * @memberof LifeCycleManager
     */
    constructor () {
        this._eventList = EVENT_LIST;
        this._promises = new Map();
        this._notifiers = {};
        this._lifeCycles = {};
        this._unreleasedLifeCycles = {};
        this._boot();
    }

    /**
     * Fills all the notifiers with resolver callback
     *
     * @memberof LifeCycleManager
     */
    _boot () {
        this._notifiers = this._eventList.reduce((acc, name) => {
            acc[name] = resolver;
            return acc;
        }, {});
        this._preparePromises();
    }

    /**
     * Public method which gives the promise corresponding
     * to the event name
     *
     * @param {string} eventName name of the event like `canvas.drawn`
     * @return {promise} promise that is passed to the user
     * @memberof LifeCycleManager
     */
    retrieve (eventName) {
        return this._promises.get(eventName);
    }

    /**
     * Creates a promise that will be passed to user's callback
     *
     * @param {string} eventName name of the event like `canvas.drawn`
     * @return {promise} a pending promise waiting for resolve to be called
     * @memberof LifeCycleManager
     */
    _makeNotifierPromise (eventName) {
        return new Promise((resolve) => {
            this._notifiers[eventName] = resolver(resolve);
        });
    }

    /**
     * Prepares the promise map with pending promises
     * all the promises are in a pending state where their's
     * resolve function waiting to be called with notification object
     * @memberof LifeCycleManager
     */
    _preparePromises () {
        this._eventList.forEach((eventName) => {
            const promise = this._makeNotifierPromise(eventName);
            this._promises.set(eventName, promise);
            createPromise(promise, eventName, this);
        });
    }

    /**
     * Resolves the promise with notification object
     *
     * @param {string} eventName name of the event in the system
     * @param {Object} notification notification object
     * @param {string} notification.formalName name of the sender creating the notification
     * @param {Object} notification.client instance or array of instances sending the notification
     * @param {string} notification.action the stage name when the event happened like `beforedraw`
     *
     * @memberof LifeCycleManager
     */
    _resolvePromise (eventName, notification) {
        this._notifiers[eventName](notification);
    }

    /**
     * Public method which is being called by different
     * subcompoents of the system at different execution atages
     * @param {Object} notification notification object
     * @param {string} notification.formalName name of the sender creating the notification
     * @param {Object} notification.client instance or array of instances sending the notification
     * @param {string} notification.action the stage name when the event happened like `beforedraw`
     * @memberof LifeCycleManager
     */
    notify (notification) {
        // get the composition name from notification
        // or from static formalName() method
        const composition = notification.formalName || notification.client.constructor.formalName();
        notification.formalName = composition;
        this._releasePromisesFromCache();
        this._notify(composition, notification);
    }

    /**
     * Notify user the with promsie in a callback
     * if callback not found then cache it
     *
     * @param {string} composition
     * @param {Object} notification notification object
     * @param {string} notification.formalName name of the sender creating the notification
     * @param {Object} notification.client instance or array of instances sending the notification
     * @param {string} notification.action the stage name when the event happened like `beforedraw`
     * @memberof LifeCycleManager
     */
    _notify (composition, notification) {
        const stage = notification.action;
        const eventName = `${composition}.${stage}`;

        // resolves promise with the notification object
        this._resolvePromise(eventName, notification);

        // get the promise from the promise map
        const promise = this.retrieve(eventName);

        if (this._lifeCycles[composition]) {
            if (this._lifeCycles[composition][stage]) {
                // if user given call back exists, then call with promise
                this._callLifeCycleCallback(composition, stage, promise);
            } else {
                // otherwise cache the promise
                this._cachePromise(composition, stage, promise);
            }
        } else {
            this._cachePromise(composition, stage, promise);
        }
    }

    /**
     * Calls the user's callback with callback
     *
     * @param {string} composition name of the compositon like `canvas`
     * @param {string} stage the stage name when the event happened like `beforedraw`
     * @param {promise} promise promise that is passed to the user
     * @memberof LifeCycleManager
     */
    _callLifeCycleCallback (composition, stage, promise) {
        const eventName = `${composition}.${stage}`;
        this._lifeCycles[composition][stage](promise);
        this._resetTargetPromise(eventName);
    }

    /**
     * Try to clear the cached promsies once we have
     * macthed callbacks from the user
     *
     * @memberof LifeCycleManager
     */
    _releasePromisesFromCache () {
        const compositions = Object.keys(this._unreleasedLifeCycles);
        compositions.forEach((composition) => {
            const stages = Object.keys(this._unreleasedLifeCycles[composition]);
            stages.forEach((stage) => {
                if (this._lifeCycles[composition]) {
                    if (this._lifeCycles[composition][stage]) {
                        // take the promise from unreleased lifeCycles
                        const promise = this._unreleasedLifeCycles[composition][stage];
                        // call the user given callback with that promise
                        this._callLifeCycleCallback(composition, stage, promise);
                        // delete promise from unreleased lifeCycles
                        delete this._unreleasedLifeCycles[composition][stage];
                    }
                }
            });
        });
    }

    /**
     * Cache the promise in the map. This cache
     * then get consumed if we get user callbacks
     * @param {string} composition name of the compositon like `canvas`
     * @param {string} stage the stage name when the event happened like `beforedraw`
     * @param {promise} promise promise that is passed to the user
     * @memberof LifeCycleManager
     */
    _cachePromise (composition, stage, promise) {
        if (!hasOwn(this._unreleasedLifeCycles, composition)) {
            this._unreleasedLifeCycles[composition] = {};
        }

        if (!hasOwn(this._unreleasedLifeCycles[composition], stage)) {
            this._unreleasedLifeCycles[composition][stage] = {};
        }
        this._unreleasedLifeCycles[composition][stage] = promise;
    }

    /**
     * It register's the callbacks gievn the user
     *
     * @param {Object} [lifeCycles={}] a object with list of callbacks
     * @memberof LifeCycleManager
     */
    register (lifeCycles = {}) {
        this._lifeCycles = lifeCycles;
        // as we get all the callbacks, try to call them
        // from unreleased promise map
        this._releasePromisesFromCache();
    }

    /**
     * Reset the promise into pending state
     *
     * @param {string} eventName name of the event happening
     * @memberof LifeCycleManager
     */
    _resetTargetPromise (eventName) {
        setTimeout(() => {
            this._notifiers[eventName] = resolver;
            this._promises.set(eventName, this._makeNotifierPromise(eventName));
        }, 0);
    }
}
