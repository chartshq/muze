/**
 * Creates a new promise when the given promise is resolved. This needs to be done so that after the lifecycle event
 * is completed, then again when the event gets completed, then a new promise gets resolved.
 *
 * @param {Promise} promise Instance of promise
 * @param {string} eventName name of event
 * @param {LifeCycleManager} context Instance of lifecyclemanager
 */
export const createPromise = (promise, eventName, context) => {
    promise.then(() => {
        const prm = context._makeNotifierPromise(eventName);
        context._promises.set(eventName, prm);
        createPromise(prm, eventName, context);
    });
};
