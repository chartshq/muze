export const createPromise = (promise, eventName, context) => {
    promise.then(() => {
        const prm = context._makeNotifierPromise(eventName);
        context._promises.set(eventName, prm);
        createPromise(prm, eventName, context);
    });
};
