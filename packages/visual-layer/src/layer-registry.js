import { DEFAULT_LAYERS } from './defaults';

export default (layers = DEFAULT_LAYERS) => {
    const reg = Object.assign({}, layers);
    const regObj = {
        set: (key, def) => {
            reg[key] = def;
            return regObj;
        },
        get: () => reg
    };
    return regObj;
};
