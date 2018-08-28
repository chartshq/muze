import { ERROR_MSG } from 'muze-utils';

/**
 * Interfaces for VisualGroup. Any new VisualGroup has to implement this class.
 * @class  SimpleGroup
 */
class SimpleGroup {

    /**
     * This method is used to set or get the DataModel instance.
     *
     * @param {DataModel | undefined} dataModel Instance of datamodel.

     * @memberof  SimpleGroup
     */
    data () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * This method is used to set or get the group specific configuration
     * properties
     *
     * @param {Object | undefined} configObj The input configuration.
     *                                or instance of visual group.
     * @memberof  SimpleGroup
     */
    config () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * This method is used to return a serialized representation of the
     * instance's properties.
     *
     * @memberof  SimpleGroup
     */
    serialize () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * This method is used to get or set the measurement object which houses
     * layout properties like width and height.
     *
     * @param {Object  | undefined} mObj The measurement properties.
     * @memberof  SimpleGroup
     */
    measurement () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }
}

export default SimpleGroup;
