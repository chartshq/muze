import { VisualUnit } from '@chartshq/visual-unit';

export const createUnitState = (context) => {
    const [globalState, localState] = VisualUnit.getState();
    const store = context.store();
    store.append('app.units', globalState).append('local.units', localState);
};

export const initializeGlobalState = (context) => {
    const globalState = context.constructor.getState()[0];
    const store = context.store();
    store.append('app.group', globalState);
};
