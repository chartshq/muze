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
};

export const registerDomainChangeListener = (context) => {
    const store = context.store();
    store.registerChangeListener([`${STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE}.domain`], () => {
        context.resolver().encoder().unionUnitDomains(context);
    }, false, {
        namespace: 'group',
        key: 'unionDomain'
    });
};

export const unsubscribeChangeListeners = (context) => {
    context.store().unsubscribe({
        namespace: 'group',
        key: 'unionDomain'
    });
};
