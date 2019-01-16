// @warn Pseudo class of PointLayer to generate docs. Real Point layer class attaches method to instance dynamically
// hence property jsdoc on all the method is not possible
export default class {
    /**
     * Sets the configuration of a layer.Configuration includes encoding and other configuration such as transform,
     * transition, className, etc.
     *
     * When used as setter,
     * @param {Object} config Layer configuration
     * @param {string} config.className Applies a class name to the dom elements.
     * @param {Object} config.transform Transform configuration.
     * @param {string} config.transform.type Type of transform.
     * Supported values are:-
     * 1. stack - Stacks points vertically or horizontally.
     * 2. group - Produces multi series points.
     * @param {string} config.transform.groupBy Dimensional field by which the lines will be stacked or grouped.
     * @param {Object} config.encoding Encoding configuration of the layer.
     * @param {string} config.encoding.x Field from which the x coordinate of each point is derived from.
     * @param {string} config.encoding.y Field from which the y coordinate of each point is derived from.
     * @param {Object} config.encoding.color Color encoding configuration.
     * @param {Function} config.encoding.color.value Function which returns the color of each point.
     * @param {Object} config.encoding.shape Shape encoding configuration.
     * @param {Function} config.encoding.shape.value Function which returns the shape of each point.
     * @param {Object} config.encoding.size Size encoding configuration.
     * @param {Object} config.encoding.size.value Function which returns the size value of each point.
     * @param {Object} config.transition Transition configuration
     * @param {boolean} config.transition.disabled If true, then disables the transition.
     * @param {Number} config.transition.duration Transition duration.
     * @param {Number} config.nearestPointThreshold If specified, then only those points which are in the given
     * @return {PointLayer} Instance of Point layer
     *
     * When used as getter,
     * @return {Object} Layer configuration.
     *
     * @public
     * @segment PointLayer
     */
    config () { }
}
