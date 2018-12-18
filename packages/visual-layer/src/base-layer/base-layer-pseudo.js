// @warn Pseudo class of BaseLayer to generate docs. Real Base Layer Class attaches method to instance dynamically
// hence property jsdoc on all the mthod is not possible
export default class {
    /**
     * Updates the layer with new data model.
     *
     * @public
     * @segment BaseLayer
     * @param {DataModel} data Instance of new data model.
     *
     * @return {BaseLayer} Instance of layer.
     */
    data () { }

    /**
     * Returns the axes attached with the layer.
     *
     * @public
     * @segment BaseLayer
     *
     * @return {Object} Axes instances of the layer.
     * ```
     *      {
     *          // x and y axis is only returned for cartesian layers
     *          x: // X Axis Instance.
     *          y: // Y Axis Instance.
     *          color: // Color Axis instance
     *          shape: // Shape Axis instance.
     *          size: // Size Axis instance.
     *      }
     * ```
     */
    axes () { }

    /**
     * Returns the configuration of the layer.
     *
     * @public
     * @segment BaseLayer
     *
     * @return {Object} Configuration of layer.
     */
    config () { }

    /**
     * Returns the measurement of the {@link VisualUnit} where the layer has been rendered.
     *
     * @return {Object} Width and height of the visual unit.
     */
    measurement () { }
}
