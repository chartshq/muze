import { VisualUnit } from '@chartshq/visual-unit';
import { STATE_NAMESPACES } from 'muze-utils';

export const createUnitState = (context) => {
    const [globalState, localState] = VisualUnit.getState();
    const store = context.store();
    store.append(STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE, globalState)
                    .append(STATE_NAMESPACES.UNIT_LOCAL_NAMESPACE, localState);
};

export const initializeGlobalState = (context) => {
    const globalState = context.constructor.getState()[0];
    const store = context.store();
    store.append(STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE, globalState);
};
