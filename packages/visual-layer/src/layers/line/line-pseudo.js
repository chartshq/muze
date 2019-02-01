// @warn Pseudo class of LineLayer to generate docs. Real Line layer class attaches method to instance dynamically
// hence property jsdoc on all the method is not possible
export default class {
    /**
     * Sets the configuration of a layer.Configuration includes encoding and other configuration such as transform,
     * transition, className, etc.
     *
     * When used as setter,
     * @param {Object} config Layer configuration
     * @param {string} config.interpolate Interpolator which determines how to interpolate between two points.
     * Default value is linear.
     * Supported interpolators are:-
     * 1. catmullRom - Produces a spline curve.
     * 2. step - Generates alternating horizontal and vertical lines. The y value changes at the midpoint of adjacent
     * x values.
     * 3. stepAfter - Same as step but the y value changes after the x value.
     * 4. stepBefore - Same as step but the y value changes before the x value.
     * @param {string} config.className Applies a class name to the line elements.
     * @param {Object} config.transform Transform configuration.
     * @param {string} config.transform.type Type of transform.
     * Supported values are:-
     * 1. stack - Stacks lines vertically or horizontally.
     * 2. group - Produces multi series lines.
     * @param {string} config.transform.groupBy Dimensional field by which the lines will be stacked or grouped.
     * @param {Object} config.encoding Encoding configuration of the layer.
     * @param {string} config.encoding.x Field from which the x coordinate of each point of the line mark is derived
     * from.
     * @param {string} config.encoding.y Field from which the y coordinate of each point of the line mark is derived
     * from.
     * @param {Object} config.encoding.color Color configuration
     * @param {Function} config.encoding.color.value Function which returns the color each line.
     * @param {boolean} config.connectNullData If true, then connects missing points, by default set to false.
     * @param {Object} config.transition Transition configuration
     * @param {boolean} config.transition.disabled If true, then disables the transition.
     * @param {Number} config.transition.duration Transition duration.
     * @param {Number} config.nearestPointThreshold If specified, then only those points which are in the given
     * threshold distance are considered for nearest point search.
     *
     * @return {LineLayer} Instance of line layer
     *
     * When used as getter,
     * @return {Object} Layer configuration.
     *
     * @public
     * @segment LineLayer
     */
    config () { }
}
