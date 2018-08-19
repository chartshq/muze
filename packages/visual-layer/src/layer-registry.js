import { DEFAULT_LAYERS } from './defaults';

export default () => {
    const reg = DEFAULT_LAYERS;
    const regObj = {
        set: (key, def) => {
            if (key in reg) {
                reg[key] = def;
            }
            return regObj;
        },
        get: () => reg
    };
    return regObj;
};
