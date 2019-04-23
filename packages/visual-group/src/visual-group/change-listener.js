import { VisualUnit } from '@chartshq/visual-unit';
import { BaseLayer } from '@chartshq/visual-layer';

import { STATE_NAMESPACES } from 'muze-utils';

export const setupChangeListeners = (context) => {
    const store = context.store();

    store.registerChangeListener([`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.x`], () => {
        const groupAxes = context.resolver().axes();
        groupAxes.x.forEach(axes => axes.forEach((axis) => {
            axis.render();
        }));
    });

    store.registerChangeListener([`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.y`], () => {
        const groupAxes = context.resolver().axes();
        groupAxes.y.forEach(axes => axes.forEach((axis) => {
            axis.render();
        }));
    });

    let listeners = VisualUnit.getListeners();
    listeners.forEach((listenerInf) => {
        store[listenerInf.type](listenerInf.props, listenerInf.listener, false, {
            namespace: VisualUnit.formalName(),
            subNamespace: listenerInf.subNamespace
        });
    });

    listeners = BaseLayer.getListeners();
    listeners.forEach((listenerInf) => {
        store[listenerInf.type](listenerInf.props, listenerInf.listener, false, {
            namespace: 'layer',
            subNamespace: listenerInf.subNamespace
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
