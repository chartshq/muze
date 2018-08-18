import { DEFAULT_PLACEHOLDERS } from './defaults';

/**
 * Creates a registry for the cells, which can be used for
 * setting a new cell or getting the registered cells
 *
 * @return {Object} Setters and getters for registered cells
 */
const cellRegistry = () => {
    const reg = DEFAULT_PLACEHOLDERS;
    return {
        set: (key, def) => {
            reg[key] = def;
            return cellRegistry;
        },
        get: () => reg
    };
};
export default cellRegistry;
