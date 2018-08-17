import { ERROR_MSG } from 'muze-utils';
/**
 * An Interface to be implemented if the transaction support is necessary. This class ensures reactivity to
 * global properties.
 */
export default class TransactionSupport {
    /**
     * Property accessor for data member of the class. Data is passed to the system by calling this method.
     */
    data () {
        throw new Error(ERROR_MSG.INTERFACE_IMPl);
    }

    /**
     * Property accessor for width of the class. Width is passed as an integer.
     */
    width () {
        throw new Error(ERROR_MSG.INTERFACE_IMPl);
    }

    /**
     * Property accessor for height of the class. Height is passed as an integer.
     */
    height () {
        throw new Error(ERROR_MSG.INTERFACE_IMPl);
    }

    /**
     * Property accessor for config of the class. Config is passed as an object.
     */
    config () {
        throw new Error(ERROR_MSG.INTERFACE_IMPl);
    }
}
