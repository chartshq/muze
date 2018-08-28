import { ERROR_MSG } from 'muze-utils';

/**
 * This is an interface class which any new layer class has to extend.
 *
 * @example
 * class BarLayer extends BaseLayer {
 *   update (params) {
 *       // super.update(params);
 *       // Update the bar layer
 *   }
 * }
 * @class
 */
export default class SimpleLayer {

    formalName () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Sets or gets the dependencies.
     * @param {Object} dependencies Dependencies needed by layer
     * @return {BaseLayer} Instance of base layer.
     */
    dependencies () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns the config of the layer
     *
     * @param {Object} config Configuration of layer
     * @return {Object} configuration of layer
     */
    config () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Acts as a getter or setter function
     * When setter
     * Returns the datamodel of the layer
     * @param { DataModel } dataModel instance of DataModel
     * @return { DataModel } DataModel instance of the layer
     */
    data () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns a serialized schema of the layer
     * @return {Object} Serialized schema
     */
    serialize () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns the unique identifier of this layer
     * @return {string} id of the layer
     */
    id () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }
    /*
     * This method resolves the x, y, x0 and y0 values from the transformed data.
     * It also checks the type of transformed data for example, if it is a stacked data
     * then it fetches the y and y0 values from the stacked data.
     * @param {Array.<Array>} transformedData transformed data
     * @param {Object} fieldMap field definitions
     * @param {string} transformType type of transformed data - stack, group or identity.
     * @return {Array.<Object>} Normalized data
     * @private
     */
    normalizeTransformedData () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Gets the transform method from transform factory based on type of transform. It then calls the
     * transform method with the data and passes the configuration parameters of transform such as
     * groupBy, value field, etc.
     *
     * @param {DataModel} dataModel Instance of dataModel
     * @param {Object} config configuration for transforming data
     * @return {Array.<Array>} Transformed data.
     * @private
     */
    getTransformedData () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Calculates the domain from the data.
     * It checks the type of field and calculates the domain based on that. For example, if it
     * is a quantitative or temporal field, then it calculates the min and max from the data or
     * if it is a nominal field then it gets all the values from the data of that field.
     * @param {Array} data DataArray
     * @return {Array} Domain values array.
     */
    _calculateDomainFromData () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Returns the domain for the axis.
     *
     * @param {string} encodingType type of encoding x, y, color, etc.
     * @return {Object} Axis domains
     */
    getDomain () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Abstract method for getting nearest point
     * @return {BaseLayer} Instance of base layer
     */
    getNearestPoint () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Abstract method for highlighting points
     * @return {BaseLayer} Instance of base layer
     */
    highlightPoint () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Abstract method for deselecting points
     * @return {BaseLayer} Instance of base layer
     */
    dehighlightPoint () {
        return this;
    }

    linkLayerStore () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     * Sets the container element for the layer to be renderered.
     * @param {SVGElement} mountPoint SVG element or group element.
     */
    mount () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    render () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }
}
