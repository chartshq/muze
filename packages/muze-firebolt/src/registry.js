import { componentRegistry } from 'muze-utils';
import * as behaviours from './actions/behavioural';
import { physicalActions } from './actions/physical';
import * as sideEffects from './side-effects';

const convertToObj = (comps) => {
    const obj = {};

    for (const key in comps) {
        const val = comps[key];

        obj[val.formalName()] = val;
    }
    return obj;
};

export const registry = {
    behaviours: componentRegistry(convertToObj(behaviours)),
    physicalActions: componentRegistry(physicalActions),
    sideEffects: componentRegistry(convertToObj(sideEffects))
};
