import { ERROR_MSG } from 'muze-utils';

/**
 *
 *
 * @export
 * @class Variable
 */
export default class Variable {

    /**
     *
     *
     * @memberof Variable
     */
    type () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     *
     *
     * @memberof Variable
     */
    toString () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

}
