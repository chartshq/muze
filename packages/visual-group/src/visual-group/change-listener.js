import { STATE_NAMESPACES } from 'muze-utils';

export const setupChangeListeners = (context) => {
    const store = context.store();
    const stores = {
        throwback: context._dependencies.throwback,
        store
    };

    ['x', 'y'].forEach((axisType) => {
        store.registerChangeListener([`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.${axisType}`], () => {
            const groupAxes = context.resolver().axes();
            groupAxes[axisType].forEach(axes => axes.forEach((axis) => {
                axis.render();
            }));
        });
    });
    const { VisualUnit, layerRegistry } = context.registry();
    const { base: BaseLayer } = layerRegistry;
    [VisualUnit, BaseLayer].forEach((comp) => {
        const formalName = comp.formalName();
        ['store', 'throwback'].forEach((type) => {
            const listeners = comp.getListeners()[type];
            const storeInst = stores[type];
            listeners.forEach((listenerInf) => {
                storeInst[listenerInf.type](listenerInf.props, listenerInf.listener, false, {
                    namespace: formalName,
                    subNamespace: listenerInf.subNamespace
                });
            });
        });
    });
};

export const registerDomainChangeListener = (context) => {
    const store = context.store();
    store.registerChangeListener([`${STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE}.domain`], () => {
        context.resolver().encoder().unionUnitDomains(context);
    }, false, {
        key: 'unionDomain'
    });
};

export const unsubscribeChangeListeners = (context) => {
    context.store().unsubscribe({
        key: 'unionDomain'
    });
};
